import { Auth, Prisma, UserRole } from "@prisma/client";
import prisma from "../utils/prisma.js";
import AppError from "../utils/errorHandler.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import uploadResume from "../utils/uploadResume.js";
import { UpdateAuthProfilePayload } from "../types/index.js";

const normalizeRole = (role: string): UserRole => {
  const normalizedRole = role.trim().toUpperCase();

  if (normalizedRole === "JOBSEEKER" || normalizedRole === "JOB_SEEKER") {
    return UserRole.JOB_SEEKER;
  }

  if (normalizedRole === "RECRUITER") {
    return UserRole.RECRUITER;
  }

  if (normalizedRole === "ADMIN") {
    return UserRole.ADMIN;
  }

  throw new AppError(
    StatusCodes.BAD_REQUEST,
    "Invalid role. Use one of: JOB_SEEKER, RECRUITER, ADMIN",
  );
};

const authProfileSelect = {
  userId: true,
  name: true,
  email: true,
  phoneNumber: true,
  role: true,
  bio: true,
  resume: true,
  resumePublicId: true,
  profilePic: true,
  profilePicPublicId: true,
  createdAt: true,
  subscription: true,
  userSkills: {
    select: {
      skill: {
        select: { skillId: true, name: true },
      },
    },
  },
} as const;

const normalizeSkills = (skills: string[]) => {
  if (!Array.isArray(skills)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "userSkills must be an array");
  }

  const normalizedSkills = skills.map((skill) => {
    if (typeof skill !== "string") {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Each user skill must be a string",
      );
    }

    return skill.trim();
  });

  return [...new Set(normalizedSkills)].filter(Boolean);
};

const registerUserIntoDB = async (
  payload: Auth & { userSkills?: string[] },
  file?: Express.Multer.File,
) => {
  const { name, email, password, phoneNumber, role, bio, userSkills } = payload;

  // 1. Validate required fields
  if (!name || !email || !password || !phoneNumber || !role) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please provide all required fields: name, email, password, phoneNumber, and role.",
    );
  }

  // 2. Check if user already exists
  const existingUser = await prisma.auth.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "User with this email already exists.",
    );
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  const normalizedRole = normalizeRole(role);

  // 4. Prepare user data for creation
  const userData: Prisma.AuthCreateInput = {
    name,
    email,
    password: hashedPassword,
    phoneNumber,
    role: normalizedRole,
    bio,
  };

  const skills =
    userSkills !== undefined ? normalizeSkills(userSkills) : undefined;

  if (skills?.length) {
    userData.userSkills = {
      create: skills.map((skillName) => ({
        skill: {
          connectOrCreate: {
            where: { name: skillName },
            create: { name: skillName },
          },
        },
      })),
    };
  }

  if (normalizedRole === UserRole.JOB_SEEKER && !file) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Resume file is required for job seekers",
    );
  }

  if (file) {
    const uploadedResume = await uploadResume(file);
    userData.resume = uploadedResume.url;
    userData.resumePublicId = uploadedResume.public_id;
  }

  // 5. Create user and return data (excluding password)
  const result = await prisma.auth.create({
    data: userData,
    select: authProfileSelect,
  });

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    { id: result.userId, role: result.role },
    process.env.JWT_SECRET!,
    options,
  );
  return { user: result, token };
};

const loginUserIntoDB = async (payload: Pick<Auth, "email" | "password">) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please provide email and password",
    );
  }

  const user = await prisma.auth.findUnique({
    where: {
      email,
    },
    include: {
      userSkills: {
        select: {
          skill: {
            select: { skillId: true, name: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Incorrect password");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    { id: user.userId, role: user.role },
    process.env.JWT_SECRET!,
    options,
  );

  const { password: _, ...userWithoutPassword } = await user;

  return {
    user: userWithoutPassword,
    token,
  };
};

const getMyProfileFromDb = async (userId: string) => {
  const user = await prisma.auth.findUnique({
    where: { userId },
    select: authProfileSelect,
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};

const getAllUsersFromDb = async () => {
  return prisma.auth.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: authProfileSelect,
  });
};

const updateAuthProfileInDb = async (payload: UpdateAuthProfilePayload) => {
  if (!payload.userId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User ID is required to update auth profile",
    );
  }

  const data: Record<string, string | Date | null> = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.phoneNumber !== undefined) data.phoneNumber = payload.phoneNumber;
  if (payload.bio !== undefined) data.bio = payload.bio;
  if (payload.resume !== undefined) data.resume = payload.resume;
  if (payload.resumePublicId !== undefined)
    data.resumePublicId = payload.resumePublicId;
  if (payload.profilePic !== undefined) data.profilePic = payload.profilePic;
  if (payload.profilePicPublicId !== undefined)
    data.profilePicPublicId = payload.profilePicPublicId;
  if (payload.subscription !== undefined) {
    data.subscription = payload.subscription
      ? new Date(payload.subscription)
      : null;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "No profile fields provided to update",
    );
  }

  const user = await prisma.auth.update({
    where: { userId: payload.userId },
    data,
    select: authProfileSelect,
  });

  return user;
};

const updateMyProfileInDb = async (
  userId: string,
  payload: Omit<UpdateAuthProfilePayload, "userId">,
) => {
  return updateAuthProfileInDb({
    ...payload,
    userId,
  });
};

const addSkillsToUserInDb = async (userId: string, userSkills: string[]) => {
  const normalizedSkills = normalizeSkills(userSkills);

  const userExists = await prisma.auth.findUnique({
    where: { userId },
  });

  if (!userExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const user = await prisma.auth.update({
    where: { userId },
    data: {
      userSkills: {
        create: normalizedSkills.map((skillName) => ({
          skill: {
            connectOrCreate: {
              where: { name: skillName },
              create: { name: skillName },
            },
          },
        })),
      },
    },
    select: authProfileSelect,
  });

  return user;
};

const deleteSkillsFromUserInDb = async (
  userId: string,
  userSkills: string[],
) => {
  const normalizedSkills = normalizeSkills(userSkills);

  const userExists = await prisma.auth.findUnique({
    where: { userId },
  });
  if (!userExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const skills = await prisma.skill.findMany({
    where: {
      name: {
        in: normalizedSkills,
      },
    },
    select: {
      skillId: true,
    },
  });

  const skillIds = skills.map((skill) => skill.skillId);

  const user = await prisma.auth.update({
    where: { userId },
    data: {
      userSkills: {
        deleteMany: {
          skillId: {
            in: skillIds,
          },
        },
      },
    },
    select: authProfileSelect,
  });

  return user;
};

export const authServices = {
  registerUserIntoDB,
  loginUserIntoDB,
  updateAuthProfileInDb,
  getMyProfileFromDb,
  getAllUsersFromDb,
  updateMyProfileInDb,
  addSkillsToUserInDb,
  deleteSkillsFromUserInDb,
};

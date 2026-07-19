import { Auth, Prisma, UserRole } from "@prisma/client";
import prisma from "../utils/prisma.js";
import AppError from "../utils/errorHandler.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import getBufferFromFile from "../utils/buffer.js";
import jwt, { SignOptions } from "jsonwebtoken";

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

const uploadResume = async (file: Express.Multer.File) => {
  const uploadServiceBaseUrl =
    process.env.UPLOAD_SERVICE || "http://localhost:5001";
    
  const fileBuffer = getBufferFromFile(file);

  const response = await fetch(`${uploadServiceBaseUrl}/api/utils/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      buffer: fileBuffer.toString(),
    }),
  });

  if (!response.ok) {
    throw new AppError(
      StatusCodes.BAD_GATEWAY,
      "Failed to upload resume to upload service",
    );
  }

  const data = (await response.json()) as { url: string; public_id: string };

  if (!data.url || !data.public_id) {
    throw new AppError(
      StatusCodes.BAD_GATEWAY,
      "Invalid upload service response",
    );
  }

  return data;
};

const registerUserIntoDB = async (
  payload: Auth,
  file?: Express.Multer.File,
) => {
  const { name, email, password, phoneNumber, role, bio } = payload;

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
    select: {
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
    },
  });

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    { id: result.userId },
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

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

export const authServices = {
  registerUserIntoDB,
  loginUserIntoDB,
};

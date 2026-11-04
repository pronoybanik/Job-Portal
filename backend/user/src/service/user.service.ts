import prisma from "../utils/prisma.js";
import { Prisma } from "@prisma/client";
import AppError from "../utils/errorHandler.js";
import { StatusCodes } from "http-status-codes";

type SyncUserProfileInput = {
  userId: string;
  phoneNumber?: string | null;
  bio?: string | null;
  resume?: string | null;
  resumePublicId?: string | null;
  profilePic?: string | null;
  profilePicPublicId?: string | null;
  createdAt?: string | Date;
  subscription?: string | Date | null;
};

type UpdateUserProfileInput = {
  userId: string;
  phoneNumber?: string;
  bio?: string | null;
  resume?: string | null;
  resumePublicId?: string | null;
  profilePic?: string | null;
  profilePicPublicId?: string | null;
  subscription?: string | Date | null;
  userSkills?: unknown;
};

const getProfileSelect = {
  id: true,
  userId: true,
  phoneNumber: true,
  bio: true,
  resume: true,
  resumePublicId: true,
  profilePic: true,
  profilePicPublicId: true,
  subscription: true,
  createdAt: true,
  userSkills: {
    select: {
      skill: {
        select: {
          skillId: true,
          name: true,
        },
      },
    },
  },
} as const;

const getUserProfile = async (userId: string) => {
  if (!userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "User ID is required to fetch profile",
    );
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: getProfileSelect,
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};

const getAuthProfile = async (authorization: string | undefined) => {
  if (!authorization) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authorization token is missing");
  }

  const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:5000";

  let response: Response;
  try {
    response = await fetch(`${authServiceUrl}/me`, {
      headers: { Authorization: authorization },
    });
  } catch {
    throw new AppError(StatusCodes.BAD_GATEWAY, "Auth service is unavailable");
  }

  const body = (await response.json()) as {
    data?: unknown;
    message?: string;
  };

  if (!response.ok) {
    throw new AppError(
      response.status,
      body.message || "Failed to retrieve auth profile",
    );
  }

  return body.data;
};

const getMyProfile = async (
  userId: string,
  authorization: string | undefined,
) => {
  const [profile, authUser] = await Promise.all([
    getUserProfile(userId),
    getAuthProfile(authorization),
  ]);

  return { ...profile, authUser };
};

const syncUserProfile = async (payload: SyncUserProfileInput) => {
  if (
    !payload.userId
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Missing required user profile data",
    );
  }

  const createdAt = payload.createdAt
    ? new Date(payload.createdAt)
    : new Date();
  const subscription = payload.subscription
    ? new Date(payload.subscription)
    : null;

  const user = await prisma.user.upsert({
    where: { userId: payload.userId },
    create: {
      userId: payload.userId,
      phoneNumber: payload.phoneNumber ?? null,
      bio: payload.bio ?? null,
      resume: payload.resume ?? null,
      resumePublicId: payload.resumePublicId ?? null,
      profilePic: payload.profilePic ?? null,
      profilePicPublicId: payload.profilePicPublicId ?? null,
      createdAt,
      subscription,
    },
    update: {
      ...(payload.phoneNumber !== undefined
        ? { phoneNumber: payload.phoneNumber }
        : {}),
      bio: payload.bio ?? null,
      resume: payload.resume ?? null,
      resumePublicId: payload.resumePublicId ?? null,
      profilePic: payload.profilePic ?? null,
      profilePicPublicId: payload.profilePicPublicId ?? null,
      subscription,
    },
    select: {
      ...getProfileSelect,
    },
  });

  return user;
};

const updateUserProfile = async (payload: UpdateUserProfileInput) => {
  if (!payload.userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "User ID is required to update profile",
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { userId: payload.userId },
    select: getProfileSelect,
  });

  if (!currentUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const data: Prisma.UserUpdateInput = {};
  if (payload.phoneNumber !== undefined) data.phoneNumber = payload.phoneNumber;
  if (payload.bio !== undefined) data.bio = payload.bio;
  if (payload.resume !== undefined) data.resume = payload.resume;
  if (payload.resumePublicId !== undefined) data.resumePublicId = payload.resumePublicId;
  if (payload.profilePic !== undefined) data.profilePic = payload.profilePic;
  if (payload.profilePicPublicId !== undefined) {
    data.profilePicPublicId = payload.profilePicPublicId;
  }
  if (payload.subscription !== undefined) {
    data.subscription = payload.subscription ? new Date(payload.subscription) : null;
  }

  const hasSkillsUpdate = payload.userSkills !== undefined;
  if (Object.keys(data).length === 0 && !hasSkillsUpdate) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "No profile fields provided to update",
    );
  }

  const normalizedSkills = hasSkillsUpdate
    ? normalizeSkills(payload.userSkills)
    : undefined;

  return prisma.$transaction(async (transaction) => {
    if (normalizedSkills) {
      await transaction.userSkill.deleteMany({ where: { userId: payload.userId } });

      for (const name of normalizedSkills) {
        const skill = await transaction.skill.upsert({
          where: { name },
          create: { name },
          update: {},
        });
        await transaction.userSkill.create({
          data: { userId: payload.userId, skillId: skill.skillId },
        });
      }
    }

    return transaction.user.update({
      where: { userId: payload.userId },
      data,
      select: getProfileSelect,
    });
  });
};

const normalizeSkills = (skills: unknown): string[] => {
  if (!Array.isArray(skills)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "userSkills must be an array");
  }

  return [...new Set(skills.map((skill) => {
    if (typeof skill !== "string") {
      throw new AppError(StatusCodes.BAD_REQUEST, "Each user skill must be a string");
    }
    return skill.trim();
  }).filter(Boolean))];
};

const addSkillsToUser = async (userId: string, skills: unknown) => {
  const normalizedSkills = normalizeSkills(skills);
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  await prisma.$transaction(async (transaction) => {
    for (const name of normalizedSkills) {
      const skill = await transaction.skill.upsert({
        where: { name },
        create: { name },
        update: {},
      });
      await transaction.userSkill.upsert({
        where: { userId_skillId: { userId, skillId: skill.skillId } },
        create: { userId, skillId: skill.skillId },
        update: {},
      });
    }
  });

  return getUserProfile(userId);
};

const deleteSkillsFromUser = async (userId: string, skills: unknown) => {
  const normalizedSkills = normalizeSkills(skills);
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  const matchingSkills = await prisma.skill.findMany({
    where: { name: { in: normalizedSkills } },
    select: { skillId: true },
  });

  await prisma.userSkill.deleteMany({
    where: {
      userId,
      skillId: { in: matchingSkills.map(({ skillId }) => skillId) },
    },
  });

  return getUserProfile(userId);
};

const getApplicationsIntoDB = async (authorization: string | undefined) => {
  if (!authorization) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Authorization token is missing",
    );
  }

  const jobServiceBaseUrl =
    process.env.JOB_SERVICE_URL || "http://localhost:5003";

  let response: Response;
  try {
    response = await fetch(`${jobServiceBaseUrl}/applications`, {
      headers: { Authorization: authorization },
    });
  } catch {
    throw new AppError(StatusCodes.BAD_GATEWAY, "Job service is unavailable");
  }

  const responseBody = await response.json();

  if (!response.ok) {
    throw new AppError(
      response.status,
      responseBody?.message || "Failed to retrieve job applications",
    );
  }

  return responseBody.data;
};


export const userServices = {
  getUserProfile,
  getMyProfile,
  syncUserProfile,
  updateUserProfile,
  addSkillsToUser,
  deleteSkillsFromUser,
  getApplicationsIntoDB
};

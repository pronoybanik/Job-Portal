import prisma from "../utils/prisma.js";
import AppError from "../utils/errorHandler.js";
import { StatusCodes } from "http-status-codes";

type SyncUserProfileInput = {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: "JOB_SEEKER" | "RECRUITER" | "ADMIN";
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
  name?: string;
  phoneNumber?: string;
  bio?: string | null;
  resume?: string | null;
  resumePublicId?: string | null;
  profilePic?: string | null;
  profilePicPublicId?: string | null;
  subscription?: string | Date | null;
};

type AuthProfileUpdatePayload = UpdateUserProfileInput;

const syncUserProfileToAuthService = async (
  payload: AuthProfileUpdatePayload,
) => {
  const authServiceBaseUrl =
    process.env.AUTH_SERVICE_URL || "http://localhost:5000"; //auth port is 5000
  const userSyncSecret = process.env.USER_SYNC_SECRET;

  if (!userSyncSecret) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "USER_SYNC_SECRET is not configured in user service",
    );
  }

  const response = await fetch(`${authServiceBaseUrl}/api/auth/sync`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-service-secret": userSyncSecret,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = "Failed to sync auth profile to auth service";

    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // Keep the default message when the response body is not JSON.
    }

    throw new AppError(StatusCodes.BAD_GATEWAY, errorMessage);
  }
};

const getProfileSelect = {
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
  subscription: true,
  createdAt: true,
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

const syncUserProfile = async (payload: SyncUserProfileInput) => {
  if (
    !payload.userId ||
    !payload.email ||
    !payload.name ||
    !payload.phoneNumber ||
    !payload.role
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
      name: payload.name,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
      bio: payload.bio ?? null,
      resume: payload.resume ?? null,
      resumePublicId: payload.resumePublicId ?? null,
      profilePic: payload.profilePic ?? null,
      profilePicPublicId: payload.profilePicPublicId ?? null,
      createdAt,
      subscription,
    },
    update: {
      name: payload.name,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
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

  // Build a payload containing only fields provided by caller.
  const syncPayload: AuthProfileUpdatePayload = {
    userId: payload.userId,
  } as AuthProfileUpdatePayload;

  let hasAnyField = false;
  if (payload.name !== undefined) {
    syncPayload.name = payload.name;
    hasAnyField = true;
  }
  if (payload.phoneNumber !== undefined) {
    syncPayload.phoneNumber = payload.phoneNumber;
    hasAnyField = true;
  }
  if (payload.bio !== undefined) {
    syncPayload.bio = payload.bio;
    hasAnyField = true;
  }
  if (payload.resume !== undefined) {
    syncPayload.resume = payload.resume;
    hasAnyField = true;
  }
  if (payload.resumePublicId !== undefined) {
    syncPayload.resumePublicId = payload.resumePublicId;
    hasAnyField = true;
  }
  if (payload.profilePic !== undefined) {
    syncPayload.profilePic = payload.profilePic;
    hasAnyField = true;
  }
  if (payload.profilePicPublicId !== undefined) {
    syncPayload.profilePicPublicId = payload.profilePicPublicId;
    hasAnyField = true;
  }
  if (payload.subscription !== undefined) {
    // keep same shape as input (Auth service can parse string/date/null as needed)
    syncPayload.subscription = payload.subscription
      ? new Date(payload.subscription)
      : null;
    hasAnyField = true;
  }

  if (!hasAnyField) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "No profile fields provided to update",
    );
  }

  try {
    // Only sync to auth service. Do not modify local user table.
    await syncUserProfileToAuthService(syncPayload);
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError(StatusCodes.BAD_GATEWAY, "Failed to sync auth profile");
  }

  // Return the merged view (DB unchanged): prefer payload values when provided.
  const merged = {
    ...currentUser,
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.phoneNumber !== undefined
      ? { phoneNumber: payload.phoneNumber }
      : {}),
    ...(payload.bio !== undefined ? { bio: payload.bio } : {}),
    ...(payload.resume !== undefined ? { resume: payload.resume } : {}),
    ...(payload.resumePublicId !== undefined
      ? { resumePublicId: payload.resumePublicId }
      : {}),
    ...(payload.profilePic !== undefined
      ? { profilePic: payload.profilePic }
      : {}),
    ...(payload.profilePicPublicId !== undefined
      ? { profilePicPublicId: payload.profilePicPublicId }
      : {}),
    ...(payload.subscription !== undefined
      ? {
          subscription: payload.subscription
            ? new Date(payload.subscription)
            : null,
        }
      : {}),
  } as const;

  return merged;
};

export const userServices = {
  getUserProfile,
  syncUserProfile,
  updateUserProfile,
};

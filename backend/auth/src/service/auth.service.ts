import { Auth, Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

import prisma from "../utils/prisma.js";
import AppError from "../utils/errorHandler.js";
import uploadResume from "../utils/uploadResume.js";
import {
  cacheAllUsers,
  clearAllUsersCache,
  getCachedAllUsers,
} from "../cache/cacheAllUser.js";

const authProfileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

const normalizeRole = (role: string): UserRole => {
  const normalizedRole = role.trim().toUpperCase();

  if (normalizedRole === "JOBSEEKER" || normalizedRole === "JOB_SEEKER") {
    return UserRole.JOB_SEEKER;
  }
  if (normalizedRole === "RECRUITER") return UserRole.RECRUITER;
  if (normalizedRole === "ADMIN") return UserRole.ADMIN;

  throw new AppError(
    StatusCodes.BAD_REQUEST,
    "Invalid role. Use one of: JOB_SEEKER, RECRUITER, ADMIN",
  );
};

const createToken = (user: Pick<Auth, "id" | "role">) => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"],
  };

  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, options);
};

const syncProfileToUserService = async (profile: {
  userId: string;
  createdAt: Date;
}) => {
  const userServiceUrl = process.env.USER_SERVICE_URL;
  const syncSecret = process.env.USER_SYNC_SECRET;

  if (!userServiceUrl || !syncSecret) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "User service configuration is incomplete",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${userServiceUrl}/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-secret": syncSecret,
      },
      body: JSON.stringify(profile),
    });
  } catch {
    throw new AppError(StatusCodes.BAD_GATEWAY, "User service is unavailable");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new AppError(
      StatusCodes.BAD_GATEWAY,
      body?.message || "Failed to create user profile",
    );
  }
};

const registerUserIntoDB = async (
  payload: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }
) => {
  const { name, email, password, role } = payload;

  if (!name || !email || !password ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please provide name, email, password.",
    );
  }

  const existingUser = await prisma.auth.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(StatusCodes.CONFLICT, "User with this email already exists.");
  }

  const normalizedRole = normalizeRole(role ?? UserRole.JOB_SEEKER);
  
  const user = await prisma.auth.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: normalizedRole,
    },
    select: authProfileSelect,
  });

  try {
    await syncProfileToUserService({
      userId: user.id,
      createdAt: user.createdAt,
    });
  } catch (error) {
    await prisma.auth.delete({ where: { id: user.id } });
    throw error;
  }

  await clearAllUsersCache();
  return { user, token: createToken(user) };
};

const loginUserIntoDB = async (payload: Pick<Auth, "email" | "password">) => {
  const { email, password } = payload;
  if (!email || !password) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Please provide email and password");
  }

  const user = await prisma.auth.findUnique({ where: { email } });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  if (!(await bcrypt.compare(password, user.password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Incorrect password");
  }

  const { password: _password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token: createToken(user) };
};

const getMyProfileFromDb = async (id: string) => {
  const user = await prisma.auth.findUnique({
    where: { id },
    select: authProfileSelect,
  });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  return user;
};

const getUserByIdFromDb = async (id: string) => {
  const user = await prisma.auth.findUnique({
    where: { id },
    select: authProfileSelect,
  });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  return user;
};

const getAllUsersFromDb = async () => {
  const cachedUsers = await getCachedAllUsers<
    Prisma.AuthGetPayload<{ select: typeof authProfileSelect }>
  >();
  if (cachedUsers) return cachedUsers;

  const users = await prisma.auth.findMany({
    orderBy: { createdAt: "desc" },
    select: authProfileSelect,
  });
  await cacheAllUsers(users);
  return users;
};

export const authServices = {
  registerUserIntoDB,
  loginUserIntoDB,
  getMyProfileFromDb,
  getUserByIdFromDb,
  getAllUsersFromDb,
};

import prisma from '../utils/prisma.js';
import AppError from '../utils/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const getUserProfile = async (userId: string) => {
  if (!userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'User ID is required to fetch profile',
    );
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      bio: true,
      resume: true,
      profilePic: true,
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
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

export const userServices = {
  getUserProfile,
};

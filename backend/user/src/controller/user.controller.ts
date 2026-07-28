import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync.js';
import { userServices } from '../service/user.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../utils/sendResponse.js';

const syncProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.syncUserProfile(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User profile synced successfully',
    data: result,
  });
});

const getProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as string;
  const result = await userServices.getUserProfile(userId);

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as string;
  const result = await userServices.updateUserProfile({
    userId,
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    bio: req.body.bio,
    resume: req.body.resume,
    resumePublicId: req.body.resumePublicId,
    profilePic: req.body.profilePic,
    profilePicPublicId: req.body.profilePicPublicId,
    subscription: req.body.subscription,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User profile updated successfully',
    data: result,
  });
});

export const userControllers = {
  getProfile,
  updateProfile,
  syncProfile,
};

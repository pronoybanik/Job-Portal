import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync.js';
import { userServices } from '../service/user.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const getProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as string;
  const result = await userServices.getUserProfile(userId);

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

export const userControllers = {
  getProfile,
};

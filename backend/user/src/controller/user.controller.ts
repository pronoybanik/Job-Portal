import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync.js';
import { userServices } from '../service/user.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../utils/sendResponse.js';
import AppError from '../utils/errorHandler.js';
import uploadFile from '../utils/uploadFile.js';

const getUploadedFile = (
  files: Express.Request["files"],
  fieldName: string,
) => {
  if (!files || Array.isArray(files)) return undefined;
  return files[fieldName]?.[0];
};

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
  const result = await userServices.getMyProfile(
    userId,
    req.headers.authorization,
  );

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

const applyForJob = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as string;
  const { job_id: jobId } = req.body as { job_id?: string };

  if (!jobId) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'job_id is required',
    });
    return;
  }

  const profile = await userServices.getUserProfile(userId);
  if (!profile.resume) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'You need to add a resume to your profile before applying',
    });
    return;
  }

  const jobServiceBaseUrl = process.env.JOB_SERVICE_URL || 'http://localhost:5003';
  const response = await fetch(`${jobServiceBaseUrl}/apply`, {
    method: 'POST',
    headers: {
      Authorization: req.headers.authorization || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ job_id: jobId, resume: profile.resume }),
  });

  const responseBody = await response.json();
  res.status(response.status).json(responseBody);
});

const updateProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as string;
  const currentProfile = await userServices.getUserProfile(userId);
  const profilePic = getUploadedFile(req.files, "profilePic");
  const resume = getUploadedFile(req.files, "resume");
  const uploadedProfilePic = profilePic
    ? await uploadFile(profilePic, currentProfile.profilePicPublicId)
    : undefined;
  const uploadedResume = resume
    ? await uploadFile(resume, currentProfile.resumePublicId)
    : undefined;

  const result = await userServices.updateUserProfile({
    userId,
    phoneNumber: req.body.phoneNumber,
    bio: req.body.bio,
    resume: uploadedResume?.url ?? req.body.resume,
    resumePublicId: uploadedResume?.public_id ?? req.body.resumePublicId,
    profilePic: uploadedProfilePic?.url ?? req.body.profilePic,
    profilePicPublicId: uploadedProfilePic?.public_id ?? req.body.profilePicPublicId,
    subscription: req.body.subscription,
    userSkills: req.body.userSkills,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User profile updated successfully',
    data: result,
  });
});

const updateProfileByUserId = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    if (!userId) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'User ID is required');
    }
    if (req.user?.id !== userId) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You can only update your own profile');
    }

    const currentProfile = await userServices.getUserProfile(userId);
    const profilePic = getUploadedFile(req.files, "profilePic");
    const resume = getUploadedFile(req.files, "resume");
    const uploadedProfilePic = profilePic
      ? await uploadFile(profilePic, currentProfile.profilePicPublicId)
      : undefined;
    const uploadedResume = resume
      ? await uploadFile(resume, currentProfile.resumePublicId)
      : undefined;

    const result = await userServices.updateUserProfile({
      userId,
      phoneNumber: req.body.phoneNumber,
      bio: req.body.bio,
      resume: uploadedResume?.url ?? req.body.resume,
      resumePublicId: uploadedResume?.public_id ?? req.body.resumePublicId,
      profilePic: uploadedProfilePic?.url ?? req.body.profilePic,
      profilePicPublicId: uploadedProfilePic?.public_id ?? req.body.profilePicPublicId,
      subscription: req.body.subscription,
      userSkills: req.body.userSkills,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User profile updated successfully',
      data: result,
    });
});

const addSkills = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const result = await userServices.addSkillsToUser(userId, req.body.userSkills);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User skills added successfully',
      data: result,
    });
});

const deleteSkills = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const result = await userServices.deleteSkillsFromUser(userId, req.body.userSkills);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User skills deleted successfully',
      data: result,
    });
});

const getApplications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await userServices.getApplicationsIntoDB(
    req.headers.authorization,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job applications retrieved successfully',
    data: result,
  });
});

export const userControllers = {
  getProfile,
  applyForJob,
  updateProfile,
  updateProfileByUserId,
  addSkills,
  deleteSkills,
  syncProfile,
  getApplications
};

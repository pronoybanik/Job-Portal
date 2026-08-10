import { authServices } from "../service/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../middleware/auth.js";
import uploadResume from "../utils/uploadResume.js";

const registerUser = catchAsync(async (req, res) => {
  const result = await authServices.registerUserIntoDB(req.body, req.file);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User registered successfully!",
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in successfully!",
    data: result,
  });
});

const getMe = catchAsync(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id as string;
  const result = await authServices.getMyProfileFromDb(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (_req, res) => {
  const result = await authServices.getAllUsersFromDb();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const updateMe = catchAsync(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id as string;

  const payload: Record<string, any> = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    bio: req.body.bio,
    profilePic: req.body.profilePic,
    profilePicPublicId: req.body.profilePicPublicId,
    subscription: req.body.subscription,
    userSkills: req.body.userSkills,
  };

  if (req.file) {
    const uploaded = await uploadResume(req.file as Express.Multer.File);
    payload.resume = uploaded.url;
    payload.resumePublicId = uploaded.public_id;
  }

  const result = await authServices.updateMyProfileInDb(userId, payload as any);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const addSkillsToUser = catchAsync(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id as string;
  const {userSkills} = req.body;

  if (!userSkills || !Array.isArray(userSkills)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid userSkills data. It should be an array.",
    });
  }

  const result = await authServices.addSkillsToUserInDb(userId, userSkills);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User skills added successfully",
    data: result,
  });
}); 

const deleteSkillsFromUser = catchAsync(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id as string;
  const { userSkills } = req.body;

  if (!userSkills || !Array.isArray(userSkills)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid userSkills data. It should be an array.",
    });
  }

  const result = await authServices.deleteSkillsFromUserInDb(userId, userSkills);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User skills deleted successfully",
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  updateMe,
  addSkillsToUser,
  deleteSkillsFromUser,
};

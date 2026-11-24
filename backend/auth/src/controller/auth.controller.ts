import { authServices } from "../service/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../middleware/auth.js";
import AppError from "../utils/errorHandler.js";

const registerUser = catchAsync(async (req, res) => {
  const result = await authServices.registerUserIntoDB(req.body);

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

const getUserById = catchAsync(async (req, res) => {
  const userId = Array.isArray(req.params.userId)
    ? req.params.userId[0]
    : req.params.userId;
  if (!userId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User id is required");
  }
  const result = await authServices.getUserByIdFromDb(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  getUserById,
};

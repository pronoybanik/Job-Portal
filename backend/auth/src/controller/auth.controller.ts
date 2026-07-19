import { authServices } from "../service/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

const registerUser = catchAsync(async (req, res) => {
  const result = await authServices.registerUserIntoDB(req.body, req.file);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User registered successfully!",
    data: result
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in successfully!",
    data: result
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
};

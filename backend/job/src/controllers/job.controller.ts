import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { jobServices } from "../services/job.service.js";

const createJob = catchAsync(async (req: Request, res: Response) => {
    const result = await jobServices.createJobIntoDB(req.body);
  

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User profile synced successfully",
    data: result,
  });
});

export const jobControllers = {
  createJob,
};

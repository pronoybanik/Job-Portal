import { Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { jobServices } from "../services/job.service.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const createCompany = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const result = await jobServices.createCompany(req.body, user, req.file);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Company created successfully",
      data: result,
    });
  },
);

const getAllCompanies = catchAsync(
  async (_req: AuthenticatedRequest, res: Response) => {
    const result = await jobServices.getAllCompanies();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Companies retrieved successfully",
      data: result,
    });
  },
);

const getCompaniesById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const result = await jobServices.getCompaniesById(id as string);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Companies retrieved successfully",
      data: result,
    });
  },
);

const getJobById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const result = await jobServices.getJobById(id as string);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Companies retrieved successfully",
      data: result,
    });
  },
);

const getAllCompaniesByRecruiter = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await jobServices.getAllCompaniesByRecruiter(req.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Companies retrieved successfully",
      data: result,
    });
  },
);

const deleteCompany = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await jobServices.deleteCompany(req.params.companyId as string, req.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Company deleted successfully",
      data: null,
    });
  },
);

const createJob = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await jobServices.createJob(req.body, req.user);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Job created successfully",
      data: result,
    });
  },
);

const getAllJobs = catchAsync(
  async (_req: AuthenticatedRequest, res: Response) => {
    const result = await jobServices.getAllJobs();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Jobs retrieved successfully",
      data: result,
    });
  },
);

const deleteJob = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await jobServices.deleteJob(req.params.jobId as string, req.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Job deleted successfully",
      data: null,
    });
  },
);

export const jobControllers = {
  createCompany,
  getAllCompanies,
  getAllCompaniesByRecruiter,
  deleteCompany,
  createJob,
  getAllJobs,
  deleteJob,
  getCompaniesById,
  getJobById
};

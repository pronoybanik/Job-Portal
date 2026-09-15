import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { JobType, WorkLocation } from "@prisma/client";
import AppError from "../utils/errorHandler.js";
import prisma from "../utils/prisma.js";
import uploadResume from "../utils/uploadResume.js";

type CreateCompanyPayload = {
  name?: string;
  description?: string;
  website?: string;
};

const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const createCompany = async (
  payload: CreateCompanyPayload,
  user: JwtPayload | undefined,
  file?: Express.Multer.File,
) => {
  if (!user?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  if (String(user.role).toUpperCase() !== "RECRUITER") {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Forbidden: only recruiters can create a company",
    );
  }

  const { name, description, website } = payload;

  if (!name || !description || !website) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Name, description, and website are required",
    );
  }

  if (!file) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Company logo file is required",
    );
  }

  const existingCompany = await prisma.company.findUnique({ where: { name } });
  if (existingCompany) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Company with this name already exists",
    );
  }

  const uploadedLogo = await uploadResume(file);

  const result = await prisma.company.create({
    data: {
      name,
      description,
      website,
      logo: uploadedLogo.url,
      logo_public_id: uploadedLogo.public_id,
      recruiter_id: String(user.id),
    },
  });

  return result;
};

const getAllCompanies = async () => {
  const result = await prisma.company.findMany({
    orderBy: { created_at: "desc" },
  });

  return result;
};

const deleteCompany = async (
  companyId: string,
  user: JwtPayload | undefined,
) => {
  if (!user?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  if (!isUuid(companyId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid company id");
  }

  const company = await prisma.company.findFirst({
    where: {
      company_id: companyId,
      recruiter_id: String(user.id),
    },
    select: { company_id: true },
  });

  if (!company) {
    throw new AppError(StatusCodes.NOT_FOUND, "Company not found");
  }

  const jobCount = await prisma.job.count({
    where: { company_id: companyId },
  });

  if (jobCount > 0) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Company cannot be deleted while it has jobs",
    );
  }

  await prisma.company.delete({ where: { company_id: companyId } });
};

type CreateJobPayload = {
  title?: string;
  description?: string;
  salary?: number | string;
  location?: string;
  job_type?: JobType | string;
  openings?: number | string;
  role?: string;
  work_location?: WorkLocation | string;
  company_id?: string;
};

const createJob = async (
  payload: CreateJobPayload,
  user: JwtPayload | undefined,
) => {
  if (!user?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  if (String(user.role).toUpperCase() !== "RECRUITER") {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Forbidden: only recruiters can create a job",
    );
  }

  const {
    title,
    description,
    salary,
    location,
    job_type,
    openings,
    role,
    work_location,
    company_id,
  } = payload;

  const companyId = company_id;
  const salaryValue = Number(salary);
  const openingsValue = Number(openings);
  const recruiterId = String(user.id);

  if (
    !title?.trim() ||
    !description?.trim() ||
    !location?.trim() ||
    !role?.trim() ||
    !job_type ||
    !work_location
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Title, description, location, job type, openings, role, work location, and company are required",
    );
  }

  if (!isUuid(companyId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid company id");
  }

  if (!isUuid(recruiterId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid recruiter id");
  }

  if (!Number.isFinite(salaryValue) || salaryValue < 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Salary must be a valid positive number",
    );
  }

  if (!Number.isInteger(openingsValue) || openingsValue <= 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Openings must be a positive integer",
    );
  }

  if (!Object.values(JobType).includes(job_type as JobType)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid job type");
  }

  if (!Object.values(WorkLocation).includes(work_location as WorkLocation)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid work location");
  }

  const company = await prisma.company.findFirst({
    where: {
      company_id: companyId,
      recruiter_id: String(user.id),
    },
    select: { company_id: true },
  });

  if (!company) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Company not found or does not belong to the recruiter",
    );
  }

  return prisma.job.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      salary: salaryValue,
      location: location.trim(),
      job_type: job_type as JobType,
      openings: openingsValue,
      role: role.trim(),
      work_location: work_location as WorkLocation,
      company_id: companyId,
      posted_by_recruiter_id: recruiterId,
    },
    include: { company: true },
  });
};

const getAllJobs = async () => {
  return prisma.job.findMany({
    orderBy: { created_at: "desc" },
    include: { company: true },
  });
};

const deleteJob = async (jobId: string, user: JwtPayload | undefined) => {
  if (!user?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  const recruiterId = String(user.id);
  if (!isUuid(jobId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid job id");
  }

  const job = await prisma.job.findFirst({
    where: {
      job_id: jobId,
      posted_by_recruiter_id: recruiterId,
    },
    select: { job_id: true },
  });

  if (!job) {
    throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
  }

  const applicationCount = await prisma.application.count({
    where: { job_id: jobId },
  });

  if (applicationCount > 0) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Job cannot be deleted while it has applications",
    );
  }

  await prisma.job.delete({ where: { job_id: jobId } });
};

export const jobServices = {
  createCompany,
  getAllCompanies,
  deleteCompany,
  createJob,
  getAllJobs,
  deleteJob,
};

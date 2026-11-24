import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { ApplicationStatus, JobType, WorkLocation } from "@prisma/client";
import AppError from "../utils/errorHandler.js";
import prisma from "../utils/prisma.js";
import uploadResume from "../utils/uploadResume.js";
import { publishJobEvent, publishToTopic } from "../producer.js";
import { applicationStatusUpdateTemplate } from "../utils/emailTemplate.js";
import type {
  CreateJobPayload,
  ApplyForJobPayload,
  UpdateApplicationPayload,
  CreateCompanyPayload,
} from "../utils/types.js";

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

  const job = await prisma.job.create({
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

  await publishJobEvent("job.created", {
    job_id: job.job_id,
    title: job.title,
    company_id: job.company_id,
    posted_by_recruiter_id: job.posted_by_recruiter_id,
  });

  return job;
};

const getAllJobs = async () => {
  return prisma.job.findMany({
    orderBy: { created_at: "desc" },
    include: { company: true },
  });
};

const getAllCompaniesByRecruiter = async (user: JwtPayload | undefined) => {
  if (!user?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  return prisma.company.findMany({
    where: {
      recruiter_id: String(user.id),
    },
    orderBy: { created_at: "desc" },
  });
};

const getCompaniesById = async (id: string) => {
  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Company id is required");
  }

  const companyData = await prisma.company.findUnique({
    where: {
      company_id: id,
    },
    include: {
      jobs: true,
    },
  });

  if (!companyData) {
    throw new AppError(StatusCodes.NOT_FOUND, "Company not found");
  }

  return companyData;
};

const getJobById = async (id: string) => {
  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Job id is required");
  }

  const jobData = await prisma.job.findUnique({
    where: {
      job_id: id,
    },
    // include: {
    //   jobs: true,
    // },
  });

  if (!jobData) {
    throw new AppError(StatusCodes.NOT_FOUND, "Company not found");
  }

  return jobData;
};

const applyForJob = async (
  payload: ApplyForJobPayload,
  user: JwtPayload | undefined,
) => {
  if (!user?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  if (String(user.role).toUpperCase() !== "JOB_SEEKER") {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Forbidden: only job seekers can apply for a job",
    );
  }

  const jobId = payload.job_id;
  if (!isUuid(jobId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "job_id is required");
  }

  if (!payload.resume?.trim()) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Resume is required");
  }

  const job = await prisma.job.findUnique({
    where: { job_id: jobId },
    select: { job_id: true, is_active: true },
  });

  if (!job) {
    throw new AppError(StatusCodes.NOT_FOUND, "No job found with this id");
  }

  if (job.is_active !== "ACTIVE") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Job is not active");
  }

  const applicantId = String(user.id);
  const existingApplication = await prisma.application.findFirst({
    where: { job_id: jobId, applicant_id: applicantId },
    select: { application_id: true },
  });

  if (existingApplication) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "You have already applied for this job",
    );
  }

  return prisma.application.create({
    data: {
      job_id: jobId,
      applicant_id: applicantId,
      resume: payload.resume.trim(),
    },
  });
};

const updateApplication = async (
  applicationId: string,
  payload: UpdateApplicationPayload,
  user: JwtPayload | undefined,
) => {
  if (!user?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  if (String(user.role).toUpperCase() !== "RECRUITER") {
    throw new AppError(StatusCodes.FORBIDDEN, "Recruiter access required");
  }

  if (!isUuid(applicationId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid application id");
  }

  const status = payload.status;
  if (
    !status ||
    !Object.values(ApplicationStatus).includes(status as ApplicationStatus)
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "A valid application status is required",
    );
  }

  const application = await prisma.application.findUnique({
    where: { application_id: applicationId },
    select: {
      application_id: true,
      applicant_id: true,
      job: {
        select: {
          posted_by_recruiter_id: true,
          title: true,
        },
      },
    },
  });

  if (!application) {
    throw new AppError(StatusCodes.NOT_FOUND, "Application not found");
  }

  if (application.job.posted_by_recruiter_id !== String(user.id)) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You can only update applications for your own jobs",
    );
  }

  const updatedApplication = await prisma.application.update({
    where: { application_id: applicationId },
    data: { status: status as ApplicationStatus },
  });

  try {
    const authServiceUrl =
      process.env.AUTH_SERVICE_URL || "http://localhost:5000";
    const applicantResponse = await fetch(
      `${authServiceUrl}/users/${encodeURIComponent(application.applicant_id)}`,
    );

    if (applicantResponse.ok) {
      const applicantBody = (await applicantResponse.json()) as {
        data?: { email?: string; name?: string };
      };
      const applicantEmail = applicantBody.data?.email;
      const applicantName = applicantBody.data?.name;

      if (applicantEmail) {
        await publishToTopic(process.env.KAFKA_MAIL_TOPIC || "send-mail", {
          to: applicantEmail,
          subject: "Application Update - Job portal",
          html: applicationStatusUpdateTemplate(
            application.job.title,
            status as ApplicationStatus,
            applicantName,
          ),
        });
      }
    } else {
      console.error(
        `Unable to find applicant ${application.applicant_id} for application status email`,
      );
    }
  } catch (error: unknown) {
    console.error("Unable to publish application status email event", error);
  }

  await publishJobEvent("application.status.updated", {
    application_id: updatedApplication.application_id,
    applicant_id: updatedApplication.applicant_id,
    job_id: updatedApplication.job_id,
    status: updatedApplication.status,
  });

  return updatedApplication;
};

const getApplicationsByApplicant = async (user: JwtPayload | undefined) => {
  if (!user?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  return prisma.application.findMany({
    where: { applicant_id: String(user.id) },
    orderBy: { applied_at: "desc" },
    include: {
      job: {
        include: {
          company: true,
        },
      },
    },
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

const getAllApplicationForJob = async (
  user: JwtPayload | undefined,
  jobId: string,
) => {
  if (!user?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  if (String(user.role).toUpperCase() !== "RECRUITER") {
    throw new AppError(StatusCodes.FORBIDDEN, "Recruiter access required");
  }

  if (!isUuid(jobId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid job id");
  }

  const job = await prisma.job.findFirst({
    where: {
      job_id: jobId,
    },
    select: { job_id: true, posted_by_recruiter_id: true },
  });

  if (!job) {
    throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
  }

  if (job.posted_by_recruiter_id !== String(user.id)) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You can only view applications for your own jobs",
    );
  }

  return prisma.application.findMany({
    where: { job_id: jobId },
    orderBy: { applied_at: "desc" },
  });
};

export const jobServices = {
  createCompany,
  getAllCompanies,
  deleteCompany,
  createJob,
  getAllJobs,
  deleteJob,
  getAllCompaniesByRecruiter,
  getCompaniesById,
  getJobById,
  applyForJob,
  updateApplication,
  getApplicationsByApplicant,
  getAllApplicationForJob,
};

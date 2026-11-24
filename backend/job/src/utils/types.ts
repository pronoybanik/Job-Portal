import { ApplicationStatus, JobType, WorkLocation } from "@prisma/client";

export type CreateJobPayload = {
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

export type ApplyForJobPayload = {
  job_id?: string;
  resume?: string;
};

export type UpdateApplicationPayload = {
  status?: ApplicationStatus | string;
};

export type CreateCompanyPayload = {
  name?: string;
  description?: string;
  website?: string;
};
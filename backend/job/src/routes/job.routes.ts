import express from "express";
import { jobControllers } from "../controllers/job.controller.js";
import auth from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.get("/companies", jobControllers.getAllCompanies);
router.get("/jobs", jobControllers.getAllJobs);

router.post(
	"/create-company",
	auth("recruiter", "RECRUITER"),
	uploadFile,
	jobControllers.createCompany,
);

router.post(
	"/create-job",
	auth("recruiter", "RECRUITER"),
	jobControllers.createJob,
);

router.delete(
	"/jobs/:jobId",
	auth("recruiter", "RECRUITER"),
	jobControllers.deleteJob,
);

router.delete(
	"/:companyId",
	auth("recruiter", "RECRUITER"),
	jobControllers.deleteCompany,
);


export default router;

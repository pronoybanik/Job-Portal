import express from "express";
import { jobControllers } from "../controllers/job.controller.js";

const router = express.Router();

router.get("/create-job", jobControllers.createJob);

export default router;

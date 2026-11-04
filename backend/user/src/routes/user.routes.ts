import express from "express";
import { userControllers } from "../controller/user.controller.js";
import auth from "../middleware/auth.js";
import serviceAuth from "../middleware/serviceAuth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/sync", serviceAuth, userControllers.syncProfile);

router.get("/me", auth(), userControllers.getProfile);
router.patch("/update/me", auth(), uploadFile, userControllers.updateProfile);
router.patch("/update/:userId", auth(), uploadFile, userControllers.updateProfileByUserId);
router.patch("/add-skills", auth(), userControllers.addSkills);
router.delete("/delete-skills", auth(), userControllers.deleteSkills);

router.post(
  "/apply",
  auth("job_seeker", "JOB_SEEKER"),
  userControllers.applyForJob,
);


router.get(
  "/allApplications",
  auth("job_seeker", "JOB_SEEKER"),
  userControllers.getApplications,
);

export default router;

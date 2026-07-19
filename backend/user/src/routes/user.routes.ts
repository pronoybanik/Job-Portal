import express from "express";
import { userControllers } from "../controller/user.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get user profile - requires authentication
router.get("/me", auth(), userControllers.getProfile);

export default router;

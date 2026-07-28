import express from "express";
import { userControllers } from "../controller/user.controller.js";
import auth from "../middleware/auth.js";
import serviceAuth from "../middleware/serviceAuth.js";

const router = express.Router();

// router.post("/sync", serviceAuth, userControllers.syncProfile);

router.get("/me", auth(), userControllers.getProfile);

// router.patch("/update/me", auth(), userControllers.updateProfile);

export default router;

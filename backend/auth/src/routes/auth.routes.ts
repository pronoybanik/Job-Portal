import express from "express";
import { AuthControllers } from "../controller/auth.controller.js";
import uploadFile from "../middleware/multer.js";
import createWindowRateLimit from "../middleware/windowRateLimit.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const authRateLimit = createWindowRateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
  maxRequests: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 50,
});

router.post(
  "/register",
  authRateLimit,
  uploadFile,
  AuthControllers.registerUser,
);

router.post("/login", authRateLimit, AuthControllers.loginUser);

router.get("/me", auth(), AuthControllers.getMe);

router.get("/users", AuthControllers.getAllUsers);

export default router;

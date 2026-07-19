import express from "express";
import { AuthControllers } from "../controller/auth.controller.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/register", uploadFile, AuthControllers.registerUser);
router.post("/login", AuthControllers.loginUser);

export default router;

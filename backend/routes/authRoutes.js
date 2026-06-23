import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Apply multipart form parser middleware to registration
router.post("/register", uploadMiddleware, registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);

export default router;

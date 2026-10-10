import express from "express";
import {
    registerUser,
    loginUser,
    getMe,
    usersList,
    getProfile,
    updateProfile,
    changePassword
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/list", authMiddleware, usersList);
router.get("/profile", authMiddleware, getProfile);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.post("/register", uploadMiddleware, registerUser);
router.post("/login", loginUser);

export default router;

import express from "express";
import { getAllUsers, getPendingUsers, getBlockedUsers, updateUserRole, updateUserStatus } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes require super admin or moderator credentials
router.use(authMiddleware);
router.use(roleMiddleware("Admin", "Moderator"));

router.get("/", getAllUsers);
router.get("/pending", getPendingUsers);
router.get("/blocked", getBlockedUsers);
router.put("/:id/role", updateUserRole);
router.put("/:id/status", updateUserStatus);

export default router;

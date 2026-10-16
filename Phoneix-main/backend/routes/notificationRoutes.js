import express from "express";
import {
  getMyNotifications,
  markNotificationRead,
  getAuditLogs,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// In-app user notifications
router.get("/", getMyNotifications);
router.put("/:id/read", markNotificationRead);

// Administrative logs
router.get("/admin/logs", roleMiddleware("Admin", "Moderator"), getAuditLogs);

export default router;

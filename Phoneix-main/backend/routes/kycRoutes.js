import express from "express";
import { submitKYC, getPendingKYC, getVerifiedKYC, getRejectedKYC, approveKYC, rejectKYC, triggerReupload } from "../controllers/kycController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Merchant uploads
router.post("/submit", submitKYC);

// Admin controls
router.get("/pending", roleMiddleware("Admin", "Moderator"), getPendingKYC);
router.get("/verified", roleMiddleware("Admin", "Moderator"), getVerifiedKYC);
router.get("/rejected", roleMiddleware("Admin", "Moderator"), getRejectedKYC);
router.put("/:id/approve", roleMiddleware("Admin", "Moderator"), approveKYC);
router.put("/:id/reject", roleMiddleware("Admin", "Moderator"), rejectKYC);
router.post("/:id/re-request", roleMiddleware("Admin", "Moderator"), triggerReupload);

export default router;

import express from "express";
import { getSystemSettings, updateSystemSettings } from "../controllers/settingController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("Admin", "Moderator", "Operations"));

router.get("/", getSystemSettings);
router.put("/", updateSystemSettings);

export default router;

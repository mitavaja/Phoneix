import express from "express";
import { getPageContent, updatePageContent } from "../controllers/pageContentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public route to fetch content
router.get("/:page", getPageContent);

// Protected route for Admins to edit content
router.put("/:page", authMiddleware, roleMiddleware("Admin"), updatePageContent);

export default router;

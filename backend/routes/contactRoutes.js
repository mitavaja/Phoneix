import express from "express";
import { submitContact, getContacts } from "../controllers/contactController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public submission
router.post("/", submitContact);

// Admin query list
router.get("/list", authMiddleware, roleMiddleware("Admin", "Moderator"), getContacts);

export default router;

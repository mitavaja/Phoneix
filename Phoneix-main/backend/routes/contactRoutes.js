import express from "express";
import { submitContact, getContacts, updateContactReply } from "../controllers/contactController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public submission
router.post("/", submitContact);

// Admin query list
router.get("/list", authMiddleware, roleMiddleware("Admin", "Moderator"), getContacts);

// Admin reply / update status
router.put("/:id", authMiddleware, roleMiddleware("Admin", "Moderator"), updateContactReply);

export default router;

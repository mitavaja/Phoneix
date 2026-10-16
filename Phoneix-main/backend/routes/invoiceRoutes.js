import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateInvoicePDF } from "../controllers/invoiceController.js";

const router = express.Router();

// Route: GET /api/invoices/generate
// Accepts optional ?fromDate=YYYY-MM-DD & toDate=YYYY-MM-DD
router.get("/generate", authMiddleware, generateInvoicePDF);

export default router;
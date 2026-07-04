import express from "express";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public route to fetch testimonials
router.get("/", getTestimonials);

// Protected routes for Admin only to manage testimonials
router.post("/", authMiddleware, roleMiddleware("Admin"), createTestimonial);
router.put("/:id", authMiddleware, roleMiddleware("Admin"), updateTestimonial);
router.delete("/:id", authMiddleware, roleMiddleware("Admin"), deleteTestimonial);

export default router;

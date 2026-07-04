import express from "express";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getApplicableCoupons,
} from "../controllers/couponController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get applicable coupons for recharging merchant (authenticated)
router.get("/applicable", authMiddleware, getApplicableCoupons);

// Admin / Moderator coupon listing
router.get("/", authMiddleware, roleMiddleware("Admin", "Moderator"), getCoupons);

// Admin only CRUD modifications
router.post("/", authMiddleware, roleMiddleware("Admin"), createCoupon);
router.put("/:id", authMiddleware, roleMiddleware("Admin"), updateCoupon);
router.delete("/:id", authMiddleware, roleMiddleware("Admin"), deleteCoupon);

export default router;

import express from "express";
import {
  getAllRates,
  addRateSlab,
  deleteRateSlab,
  calculateShippingCost,
  getMargins,
  addMarginRule,
  deleteMarginRule,
} from "../controllers/rateController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Merchant or Guest calculation (public-facing)
router.post("/calculate", calculateShippingCost);

// Secured list view
router.get("/", authMiddleware, getAllRates);

// Admin / Moderator controls for weight slabs
router.post("/add", authMiddleware, roleMiddleware("Admin", "Moderator"), addRateSlab);
router.delete("/:id", authMiddleware, roleMiddleware("Admin", "Moderator"), deleteRateSlab);

// Profit margins management
router.get("/margins", authMiddleware, roleMiddleware("Admin", "Moderator", "Operations"), getMargins);
router.post("/margins", authMiddleware, roleMiddleware("Admin", "Moderator"), addMarginRule);
router.delete("/margins/:id", authMiddleware, roleMiddleware("Admin", "Moderator"), deleteMarginRule);

export default router;

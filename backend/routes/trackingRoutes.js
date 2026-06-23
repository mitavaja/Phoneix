import express from "express";
import { trackShipment, publicVerifyTracking } from "../controllers/trackingController.js";

const router = express.Router();

// Publicly accessible tracking endpoints
router.get("/keys", publicVerifyTracking);
router.get("/:shipmentId", trackShipment);

export default router;

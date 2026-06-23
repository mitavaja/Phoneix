import express from "express";
import multer from "multer";
import { 
  bookShipment, 
  getAllShipments, 
  getDeliveredShipments, 
  getCancelledShipments, 
  updateShipmentStatus, 
  refundShipment, 
  getDiscrepancies, 
  resolveDiscrepancy,
  getAdminMetrics,
  schedulePickup,
  downloadInvoicePdf,
  validateBulkUpload,
  confirmBulkUpload,
} from "../controllers/shipmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();
const upload = multer();

router.use(authMiddleware);

// Merchant operations
router.post("/book", bookShipment);
router.get("/list", getAllShipments);
router.get("/delivered", getDeliveredShipments);
router.get("/cancelled", getCancelledShipments);
router.post("/pickup/schedule", schedulePickup);
router.get("/:id/invoice", downloadInvoicePdf);

// Double-pass bulk uploads
router.post("/bulk-upload", upload.single("file"), validateBulkUpload);
router.post("/bulk-confirm", confirmBulkUpload);

// Admin & Operations operations
router.get("/metrics", roleMiddleware("Admin", "Moderator", "Operations"), getAdminMetrics);
router.put("/:id/status", roleMiddleware("Admin", "Moderator", "Operations"), updateShipmentStatus);
router.post("/:id/refund", roleMiddleware("Admin", "Moderator"), refundShipment);
router.get("/discrepancies/list", roleMiddleware("Admin", "Moderator", "Operations"), getDiscrepancies);
router.put("/:id/resolve-discrepancy", roleMiddleware("Admin", "Moderator"), resolveDiscrepancy);

export default router;

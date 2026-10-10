import express from "express";
import {
  createAddress,
  editAddress,
  getMyAddresses,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/warehouseController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/add", createAddress);
router.get("/my-addresses", getMyAddresses);
router.delete("/:id", deleteAddress);
router.post("/:id", editAddress);
router.put("/:id/default", setDefaultAddress);

export default router;

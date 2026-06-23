import express from "express";
import {
  getMyWallet,
  getMyTransactions,
  getAllBalances,
  getAllTransactions,
  addBalanceAdmin,
  rechargeWallet,
  verifyRecharge,
  requestBankTransfer,
  getPendingBankTransfers,
  approveBankTransfer,
  rejectBankTransfer,
} from "../controllers/walletController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Merchant operations
router.get("/me", getMyWallet);
router.get("/transactions/me", getMyTransactions);
router.post("/recharge", rechargeWallet);
router.post("/verify-recharge", verifyRecharge);
router.post("/bank-transfer", requestBankTransfer);

// Admin / Operations controls
router.get("/admin/balances", roleMiddleware("Admin", "Moderator", "Operations"), getAllBalances);
router.get("/admin/transactions", roleMiddleware("Admin", "Moderator", "Operations"), getAllTransactions);
router.get("/admin/bank-transfers", roleMiddleware("Admin", "Moderator", "Operations"), getPendingBankTransfers);
router.post("/admin/add", roleMiddleware("Admin", "Moderator"), addBalanceAdmin);
router.put("/admin/bank-transfer/:id/approve", roleMiddleware("Admin", "Moderator"), approveBankTransfer);
router.put("/admin/bank-transfer/:id/reject", roleMiddleware("Admin", "Moderator"), rejectBankTransfer);

export default router;

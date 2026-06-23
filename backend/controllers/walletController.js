import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";
import { createPaymentOrder, verifyPaymentSignature } from "../services/paymentService.js";
import { sendWalletRechargeEmail } from "../services/emailService.js";

// View own wallet and transactions (Merchant)
export const getMyWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      // Auto-create wallet if missing
      wallet = await Wallet.create({
        user: req.user._id,
        storeName: req.user.companyName || `${req.user.name}'s Store`,
        balance: 0.0,
        totalBalance: 0.0,
        availableBalance: 0.0,
        holdBalance: 0.0,
      });
    }

    const transactions = await WalletTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({ wallet, transactions });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving wallet profile", error: error.message });
  }
};

// View own transactions
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transaction ledger", error: error.message });
  }
};

// Admin lists all balances (Admin/Moderator)
export const getAllBalances = async (req, res) => {
  try {
    const wallets = await Wallet.find({}).populate("user", "name email role status").sort({ totalBalance: -1 });
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving wallets roster", error: error.message });
  }
};

// Admin lists all transactions ledger (Admin/Moderator)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({}).populate("userId", "name email").sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving financial ledger records", error: error.message });
  }
};

// Admin manual deposit / credit adjustments (Admin/Moderator)
export const addBalanceAdmin = async (req, res) => {
  try {
    const { storeName, amount, type, reference, memo } = req.body;

    if (!storeName || !amount || !type || !memo) {
      return res.status(400).json({ message: "Store name, amount, type, and audit memo notes are required" });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number greater than 0" });
    }

    // Find wallet by storeName
    const wallet = await Wallet.findOne({ storeName });
    if (!wallet) {
      return res.status(404).json({ message: `Wallet profile with store name "${storeName}" not found` });
    }

    const openingBalance = wallet.availableBalance;
    const closingBalance = openingBalance + numericAmount;

    // Increment balance
    wallet.availableBalance = closingBalance;
    wallet.totalBalance = wallet.totalBalance + numericAmount;
    // legacy balance sync
    wallet.balance = closingBalance;
    await wallet.save();

    const refId = reference || `MAN-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create ledger transaction
    const transaction = await WalletTransaction.create({
      userId: wallet.user,
      transactionType: type === "Debit" ? "Debit" : type === "Penalty" ? "Penalty" : "Credit",
      amount: type === "Debit" || type === "Penalty" ? -numericAmount : numericAmount,
      openingBalance,
      closingBalance,
      referenceId: refId,
      remarks: memo,
      status: "Completed",
    });

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: `Admin Credit Adjust: ${type}`,
      module: "Wallet",
      oldValue: `Available: ${openingBalance}`,
      newValue: `Available: ${closingBalance}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create In-App Notification
    await Notification.create({
      userId: wallet.user,
      title: "Wallet Adjustment",
      message: `Admin adjusted your wallet: ${type} of ₹${numericAmount} processed.`,
      type: "Wallet Recharged",
    });

    res.status(201).json({
      message: `Success: Authorized adjustment. Credited ₹${numericAmount} to store wallet.`,
      wallet,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Error writing balance ledger adjustment", error: error.message });
  }
};

/**
 * Initiate Razorpay Recharge Order
 */
export const rechargeWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "A positive recharge amount is required" });
    }

    const receiptId = `REC-${Date.now()}`;
    const orderDetails = await createPaymentOrder(parseFloat(amount), receiptId);

    res.status(201).json({
      message: "Razorpay recharge order created successfully",
      orderDetails,
    });
  } catch (error) {
    res.status(500).json({ message: "Error initiating payment gateway", error: error.message });
  }
};

/**
 * Verify Razorpay Checkout Signature
 */
export const verifyRecharge = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ message: "Payment checkout response details are required" });
    }

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ message: "Security Warning: Payment signature check failed" });
    }

    const numericAmount = parseFloat(amount);
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        storeName: req.user.companyName || `${req.user.name}'s Store`,
        balance: 0.0,
        totalBalance: 0.0,
        availableBalance: 0.0,
        holdBalance: 0.0,
      });
    }

    const openingBalance = wallet.availableBalance;
    const closingBalance = openingBalance + numericAmount;

    wallet.availableBalance = closingBalance;
    wallet.totalBalance = wallet.totalBalance + numericAmount;
    wallet.balance = closingBalance;
    await wallet.save();

    // Create ledger transaction
    const transaction = await WalletTransaction.create({
      userId: req.user._id,
      transactionType: "Recharge",
      amount: numericAmount,
      openingBalance,
      closingBalance,
      referenceId: razorpay_payment_id,
      remarks: "Gateway Online Deposit (Razorpay)",
      status: "Completed",
    });

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Merchant Wallet Recharge Online",
      module: "Wallet",
      oldValue: `Available: ${openingBalance}`,
      newValue: `Available: ${closingBalance}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create In-App Notification
    await Notification.create({
      userId: req.user._id,
      title: "Wallet Recharge Completed",
      message: `Your deposit of ₹${numericAmount} via Razorpay was successful.`,
      type: "Wallet Recharged",
    });

    // Dispatch Email Alert
    await sendWalletRechargeEmail(req.user.email, req.user.name, numericAmount, closingBalance);

    res.status(200).json({
      message: `Success: Deposited ₹${numericAmount} to wallet. Balance updated.`,
      wallet,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying payment recharge", error: error.message });
  }
};

/**
 * Submit manual bank transfer request
 */
export const requestBankTransfer = async (req, res) => {
  try {
    const { amount, referenceId, remarks } = req.body;

    if (!amount || !referenceId) {
      return res.status(400).json({ message: "Amount and UTR reference transaction ID are required" });
    }

    const numericAmount = parseFloat(amount);
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        storeName: req.user.companyName || `${req.user.name}'s Store`,
        balance: 0.0,
        totalBalance: 0.0,
        availableBalance: 0.0,
        holdBalance: 0.0,
      });
    }

    // Create a HOLD transaction representing a pending bank recharge request
    const transaction = await WalletTransaction.create({
      userId: req.user._id,
      transactionType: "Recharge",
      amount: numericAmount,
      openingBalance: wallet.availableBalance,
      closingBalance: wallet.availableBalance, // does not affect balance until approved
      referenceId,
      remarks: remarks || "Manual Bank Transfer Deposit UTR",
      status: "HOLD", // HOLD signifies pending approval in this context
    });

    res.status(201).json({
      message: "Bank transfer receipt recorded. Pending administrative check.",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting bank transfer receipt", error: error.message });
  }
};

/**
 * List pending bank transfer reviews (Admin)
 */
export const getPendingBankTransfers = async (req, res) => {
  try {
    const transfers = await WalletTransaction.find({
      transactionType: "Recharge",
      status: "HOLD",
      remarks: { $regex: /UTR|Bank Transfer/i },
    }).populate("userId", "name email companyName");

    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ message: "Error loading pending manual deposits", error: error.message });
  }
};

/**
 * Approve pending bank transfer recharge (Admin)
 */
export const approveBankTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await WalletTransaction.findById(id);

    if (!tx || tx.status !== "HOLD") {
      return res.status(404).json({ message: "Pending transfer request ledger not found" });
    }

    const wallet = await Wallet.findOne({ user: tx.userId });
    if (!wallet) {
      return res.status(404).json({ message: "User wallet profile not found" });
    }

    const openingBalance = wallet.availableBalance;
    const closingBalance = openingBalance + tx.amount;

    wallet.availableBalance = closingBalance;
    wallet.totalBalance = wallet.totalBalance + tx.amount;
    wallet.balance = closingBalance;
    await wallet.save();

    tx.openingBalance = openingBalance;
    tx.closingBalance = closingBalance;
    tx.status = "Completed";
    await tx.save();

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Admin Approved Bank Transfer Deposit",
      module: "Wallet",
      oldValue: `Available: ${openingBalance}`,
      newValue: `Available: ${closingBalance}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create Notification
    await Notification.create({
      userId: tx.userId,
      title: "Bank Deposit Approved",
      message: `Your manual deposit of ₹${tx.amount} UTR ${tx.referenceId} has been verified.`,
      type: "Wallet Recharged",
    });

    // Dispatch Email Alert
    const user = await User.findById(tx.userId);
    if (user) {
      await sendWalletRechargeEmail(user.email, user.name, tx.amount, closingBalance);
    }

    res.status(200).json({ message: "Success: Verified bank transfer. Balance added.", wallet, tx });
  } catch (error) {
    res.status(500).json({ message: "Error approving manual deposit", error: error.message });
  }
};

/**
 * Reject pending bank transfer recharge (Admin)
 */
export const rejectBankTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tx = await WalletTransaction.findById(id);
    if (!tx || tx.status !== "HOLD") {
      return res.status(404).json({ message: "Pending transfer request ledger not found" });
    }

    tx.status = "Failed";
    tx.remarks = `${tx.remarks} [Rejected: ${reason || "Invalid slip"}]`;
    await tx.save();

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Admin Rejected Bank Transfer Deposit",
      module: "Wallet",
      oldValue: "HOLD",
      newValue: "Failed",
      ipAddress: req.ip || "127.0.0.1",
    });

    res.status(200).json({ message: "Bank transfer deposit request rejected successfully.", tx });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting bank deposit request", error: error.message });
  }
};

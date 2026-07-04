import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";
import Coupon from "../models/Coupon.js";
import { createPaymentOrder, verifyPaymentSignature } from "../services/paymentService.js";
import { sendWalletRechargeEmail } from "../services/emailService.js";

// View own wallets and transactions (Merchant)
export const getMyWallet = async (req, res) => {
  try {
    const supported = [
      { country: "India", currency: "INR" },
      { country: "UAE", currency: "AED" },
      { country: "USA", currency: "USD" },
      { country: "UK", currency: "GBP" }
    ];

    const wallets = [];
    for (const item of supported) {
      let wallet = await Wallet.findOne({ user: req.user._id, currency: item.currency });
      if (!wallet) {
        wallet = await Wallet.create({
          user: req.user._id,
          storeName: req.user.companyName || `${req.user.name}'s Store`,
          country: item.country,
          currency: item.currency,
          balance: 0.0,
          totalBalance: 0.0,
          availableBalance: 0.0,
          holdBalance: 0.0,
        });
      }
      wallets.push(wallet);
    }

    const transactions = await WalletTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({ wallets, transactions });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving wallet profile", error: error.message });
  }
};

// View own transactions with filters
export const getMyTransactions = async (req, res) => {
  try {
    const { currency, transactionType, startDate, endDate } = req.query;
    let query = { userId: req.user._id };
    if (currency) query.currency = currency;
    if (transactionType) query.transactionType = transactionType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    const transactions = await WalletTransaction.find(query).sort({ createdAt: -1 });
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

// Admin lists all transactions ledger with filtering (Admin/Moderator)
export const getAllTransactions = async (req, res) => {
  try {
    const { userId, currency, transactionType, startDate, endDate } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (currency) query.currency = currency;
    if (transactionType) query.transactionType = transactionType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    const transactions = await WalletTransaction.find(query)
      .populate("userId", "name email companyName")
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving financial ledger records", error: error.message });
  }
};

// Admin manual deposit / credit adjustments (Admin/Moderator)
export const addBalanceAdmin = async (req, res) => {
  try {
    const { storeName, amount, type, reference, memo, currency } = req.body;

    if (!storeName || !amount || !type || !memo) {
      return res.status(400).json({ message: "Store name, amount, type, and audit memo notes are required" });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number greater than 0" });
    }

    const targetCurrency = currency || "INR";

    // Find wallet by storeName and currency
    let wallet = await Wallet.findOne({ storeName, currency: targetCurrency });
    if (!wallet) {
      // Find user to map details
      const user = await User.findOne({ companyName: storeName });
      if (!user) {
        return res.status(404).json({ message: `User profile with company name "${storeName}" not found` });
      }
      wallet = await Wallet.create({
        user: user._id,
        storeName,
        currency: targetCurrency,
        balance: 0.0,
        totalBalance: 0.0,
        availableBalance: 0.0,
        holdBalance: 0.0,
      });
    }

    const isDebit = type === "Debit" || type === "Manual Debit" || type === "Penalty";
    const adjustmentAmount = isDebit ? -numericAmount : numericAmount;

    if (isDebit && wallet.availableBalance < numericAmount) {
      return res.status(400).json({
        message: `Security Lock: Wallet available balance cannot drop below zero. Current: ${targetCurrency} ${wallet.availableBalance.toFixed(2)}, Request: ${targetCurrency} ${numericAmount.toFixed(2)}`
      });
    }

    const openingBalance = wallet.availableBalance;
    const closingBalance = openingBalance + adjustmentAmount;

    // Apply safety checks & increment balance
    wallet.availableBalance = closingBalance;
    wallet.totalBalance = wallet.totalBalance + adjustmentAmount;
    wallet.balance = closingBalance;
    await wallet.save();

    const refId = reference || `MAN-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create ledger transaction
    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      userId: wallet.user,
      transactionType: type === "Debit" ? "Debit" : type === "Penalty" ? "Penalty" : "Credit",
      amount: adjustmentAmount,
      currency: targetCurrency,
      openingBalance,
      closingBalance,
      referenceId: refId,
      remarks: memo,
      description: memo,
      status: "Completed",
      createdBy: req.user.name || "Admin",
    });

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: `Admin Credit Adjust: ${type} (${targetCurrency})`,
      module: "Wallet",
      oldValue: `Available: ${openingBalance}`,
      newValue: `Available: ${closingBalance}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create In-App Notification
    await Notification.create({
      userId: wallet.user,
      title: "Wallet Adjustment",
      message: `Admin adjusted your wallet: ${type} of ${targetCurrency} ${numericAmount} processed.`,
      type: "Wallet Recharged",
    });

    res.status(201).json({
      message: `Success: Authorized adjustment. Processed ${targetCurrency} ${numericAmount} wallet adjustment.`,
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
      keyId: process.env.RAZORPAY_KEY_ID || "your_key_id",
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, couponCode } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ message: "Payment checkout response details are required" });
    }

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ message: "Security Warning: Payment signature check failed" });
    }

    const numericAmount = parseFloat(amount);
    const targetCurrency = req.body.currency || "INR";
    const cMap = { INR: "India", AED: "UAE", USD: "USA", GBP: "UK" };
    const targetCountry = cMap[targetCurrency] || "USA";

    let wallet = await Wallet.findOne({ user: req.user._id, currency: targetCurrency });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        storeName: req.user.companyName || `${req.user.name}'s Store`,
        country: targetCountry,
        currency: targetCurrency,
        balance: 0.0,
        totalBalance: 0.0,
        availableBalance: 0.0,
        holdBalance: 0.0,
      });
    }

    // Verify and apply Coupon code bonus
    let bonusAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        if (numericAmount >= coupon.minRecharge) {
          let isEligible = true;
          if (coupon.firstTimeOnly) {
            const completedRechargesCount = await WalletTransaction.countDocuments({
              userId: req.user._id,
              transactionType: "Recharge",
              status: "Completed",
            });
            if (completedRechargesCount > 0) {
              isEligible = false;
            }
          }

          if (isEligible) {
            appliedCoupon = coupon;
            if (coupon.couponType === "Percentage") {
              bonusAmount = (numericAmount * coupon.value) / 100.0;
            } else {
              bonusAmount = coupon.value;
            }
          }
        }
      }
    }

    const totalCredit = numericAmount + bonusAmount;
    const openingBalance = wallet.availableBalance;
    const closingBalance = openingBalance + totalCredit;

    wallet.availableBalance = closingBalance;
    wallet.totalBalance = wallet.totalBalance + totalCredit;
    wallet.balance = closingBalance;
    await wallet.save();

    // Create ledger transaction
    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      userId: req.user._id,
      transactionType: "Recharge",
      amount: totalCredit,
      currency: targetCurrency,
      openingBalance,
      closingBalance,
      referenceId: razorpay_payment_id,
      remarks: appliedCoupon 
        ? `Gateway Deposit (Razorpay) + Coupon ${appliedCoupon.code} Bonus (${targetCurrency} ${bonusAmount.toFixed(2)})` 
        : `Gateway Online Deposit (Razorpay) (${targetCurrency})`,
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
      title: appliedCoupon ? "Coupon Applied & Wallet Recharged" : "Wallet Recharge Completed",
      message: appliedCoupon
        ? `Your deposit of ₹${numericAmount} was successful. Applied Coupon ${appliedCoupon.code} for ₹${bonusAmount.toFixed(2)} extra bonus!`
        : `Your deposit of ₹${numericAmount} via Razorpay was successful.`,
      type: "Wallet Recharged",
    });

    // Dispatch Email Alert
    await sendWalletRechargeEmail(req.user.email, req.user.name, totalCredit, closingBalance);

    res.status(200).json({
      message: appliedCoupon
        ? `Success: Deposited ₹${numericAmount} + ₹${bonusAmount.toFixed(2)} Coupon Bonus to wallet.`
        : `Success: Deposited ₹${numericAmount} to wallet. Balance updated.`,
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
    const { amount, referenceId, remarks, currency } = req.body;

    if (!amount || !referenceId) {
      return res.status(400).json({ message: "Amount and UTR reference UTR transaction ID are required" });
    }

    const numericAmount = parseFloat(amount);
    const targetCurrency = currency || "INR";

    // Supported countries mapping mapping
    const cMap = { INR: "India", AED: "UAE", USD: "USA", GBP: "UK" };
    const targetCountry = cMap[targetCurrency] || "USA";

    let wallet = await Wallet.findOne({ user: req.user._id, currency: targetCurrency });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        storeName: req.user.companyName || `${req.user.name}'s Store`,
        country: targetCountry,
        currency: targetCurrency,
        balance: 0.0,
        totalBalance: 0.0,
        availableBalance: 0.0,
        holdBalance: 0.0,
      });
    }

    // Create a HOLD transaction representing a pending bank recharge request
    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      userId: req.user._id,
      transactionType: "Recharge",
      amount: numericAmount,
      currency: targetCurrency,
      openingBalance: wallet.availableBalance,
      closingBalance: wallet.availableBalance, // does not affect balance until approved
      referenceId,
      remarks: remarks || `Manual Bank Transfer Deposit UTR (${targetCurrency})`,
      description: remarks || `Manual Bank Transfer Deposit UTR (${targetCurrency})`,
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

    const txCurrency = tx.currency || "INR";
    const wallet = await Wallet.findOne({ user: tx.userId, currency: txCurrency });
    if (!wallet) {
      return res.status(404).json({ message: "User wallet profile not found" });
    }

    const openingBalance = wallet.availableBalance;
    const closingBalance = openingBalance + tx.amount;

    wallet.availableBalance = closingBalance;
    wallet.totalBalance = wallet.totalBalance + tx.amount;
    wallet.balance = closingBalance;
    await wallet.save();

    tx.walletId = wallet._id;
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

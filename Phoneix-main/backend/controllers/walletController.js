import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";
import Coupon from "../models/Coupon.js";
import WalletCategory from "../models/WalletCategory.js";
import { createPaymentOrder, verifyPaymentSignature } from "../services/paymentService.js";
import { sendWalletRechargeEmail } from "../services/emailService.js";
import { reprocessDraftShipmentsForUser } from "./shipmentController.js";

// View own wallets and transactions (Merchant)
export const getMyWallet = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const currency = req.query.currency || "INR";
    const skip = (page - 1) * limit;

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

    // Filter transactions specifically for the requested currency and apply pagination
    const txQuery = { userId: req.user._id, currency: currency };
    const totalItems = await WalletTransaction.countDocuments(txQuery);

    const transactions = await WalletTransaction.find(txQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      wallets,
      transactions,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      }
    });
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
    const { userId, currency, transactionType, startDate, endDate, status, search } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let initialMatch = {};
    if (userId) initialMatch.userId = new mongoose.Types.ObjectId(userId);
    if (currency) initialMatch.currency = currency;
    if (transactionType) initialMatch.transactionType = transactionType;
    if (status && status !== "all") initialMatch.status = status;
    if (startDate || endDate) {
      initialMatch.createdAt = {};
      if (startDate) initialMatch.createdAt.$gte = new Date(startDate);
      if (endDate) initialMatch.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: initialMatch },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDoc"
        }
      },
      {
        $unwind: {
          path: "$userDoc",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    if (search) {
      const searchRegex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { referenceId: searchRegex },
            { "userDoc.companyName": searchRegex },
            { transactionType: searchRegex }
          ]
        }
      });
    }

    pipeline.push(
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: skip },
              { $limit: limit },
              {
                $addFields: {
                  userId: {
                    _id: "$userDoc._id",
                    name: "$userDoc.name",
                    email: "$userDoc.email",
                    companyName: "$userDoc.companyName"
                  }
                }
              },
              { $project: { userDoc: 0 } }
            ]
          }
        }
    );

    const result = await WalletTransaction.aggregate(pipeline);

    const totalItems = result[0].metadata[0]?.total || 0;
    const transactions = result[0].data;

    res.status(200).json({
      transactions,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving financial ledger records",
      error: error.message
    });
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

    // Find user to map details if applicable
    const user = await User.findOne({
      $or: [
        { name: storeName },
        { companyName: storeName },
        { email: storeName }
      ]
    });

    // Find wallet by storeName or user and currency
    let wallet = await Wallet.findOne({
      $or: [
        { storeName, currency: targetCurrency },
        ...(user ? [{ user: user._id, currency: targetCurrency }] : [])
      ]
    });

    if (!wallet) {
      if (!user) {
        return res.status(404).json({ message: `Seller profile "${storeName}" not found` });
      }
      wallet = await Wallet.create({
        user: user._id,
        storeName: user.companyName || storeName || `${user.name}'s Store`,
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

    // Auto-reprocess any pending Draft shipments for this seller
    let autoReprocessed = 0;
    try {
      const autoRes = await reprocessDraftShipmentsForUser(wallet.user);
      if (autoRes?.processedCount) {
        autoReprocessed = autoRes.processedCount;
      }
    } catch (autoErr) {
      console.warn("Auto-reprocess error after admin balance adjust:", autoErr.message);
    }

    res.status(201).json({
      message: `Success: Authorized adjustment. Processed ${targetCurrency} ${numericAmount} wallet adjustment.${autoReprocessed > 0 ? ` Automatically reprocessed and booked ${autoReprocessed} draft shipment(s).` : ""}`,
      wallet,
      transaction,
      autoReprocessed,
    });
  } catch (error) {
    res.status(500).json({ message: "Error writing balance ledger adjustment", error: error.message });
  }
};

/**
 * Admin Cut / Deduct Seller Balance (Admin/Moderator)
 * Supports category-wise deduction (Weight Discrepancy, RTO Charges, Penalty, etc.)
 */
export const cutBalanceAdmin = async (req, res) => {
  try {
    const { storeName, amount, category, reference, memo, currency } = req.body;

    if (!storeName || !amount || !category || !memo) {
      return res.status(400).json({
        message: "Target merchant store, deduction amount, category, and audit memo notes are required.",
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number greater than 0." });
    }

    const targetCurrency = currency || "INR";

    // Find seller user
    const user = await User.findOne({
      $or: [
        { name: storeName },
        { companyName: storeName },
        { email: storeName },
      ],
    });

    // Find wallet by storeName or user and currency
    let wallet = await Wallet.findOne({
      $or: [
        { storeName, currency: targetCurrency },
        ...(user ? [{ user: user._id, currency: targetCurrency }] : []),
      ],
    });

    if (!wallet) {
      return res.status(404).json({
        message: `Wallet for seller "${storeName}" (${targetCurrency}) not found.`,
      });
    }

    const currentAvailable = wallet.availableBalance ?? wallet.balance ?? 0;
    if (currentAvailable < numericAmount) {
      return res.status(400).json({
        message: `Insufficient balance: Current available balance is ${targetCurrency} ${currentAvailable.toFixed(2)}. Cannot cut ${targetCurrency} ${numericAmount.toFixed(2)}.`,
      });
    }

    const openingBalance = currentAvailable;
    const closingBalance = parseFloat((openingBalance - numericAmount).toFixed(2));

    wallet.availableBalance = closingBalance;
    wallet.totalBalance = parseFloat(((wallet.totalBalance || openingBalance) - numericAmount).toFixed(2));
    wallet.balance = closingBalance;
    await wallet.save();

    const refId = reference || `CUT-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create ledger transaction
    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      userId: wallet.user,
      transactionType: "Debit",
      amount: -numericAmount,
      currency: targetCurrency,
      openingBalance,
      closingBalance,
      referenceId: refId,
      remarks: `[${category}] ${memo}`,
      description: `Admin balance deduction (${category}): ${memo}`,
      status: "Completed",
      createdBy: req.user.name || "Admin",
    });

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: `Admin Cut Balance: ${category} (${targetCurrency})`,
      module: "Wallet",
      oldValue: `Available: ${openingBalance}`,
      newValue: `Available: ${closingBalance}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create In-App Notification for seller
    try {
      await Notification.create({
        userId: wallet.user,
        title: `Wallet Balance Cut (${category})`,
        message: `${targetCurrency} ${numericAmount.toFixed(2)} was deducted from your wallet for: ${category}. Reason: ${memo}`,
        type: "Wallet Debited",
      });
    } catch (notifErr) {
      console.warn("Notification error during cut balance:", notifErr.message);
    }

    res.status(200).json({
      message: `Successfully cut ${targetCurrency} ${numericAmount.toFixed(2)} from ${storeName}'s wallet (${category}).`,
      wallet,
      transaction,
    });
  } catch (error) {
    console.error("Cut balance error:", error);
    res.status(500).json({ message: "Error processing balance deduction", error: error.message });
  }
};

/**
 * Initiate Razorpay Recharge Order
 */
export const rechargeWallet = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "A positive recharge amount is required" });
    }

    const targetCurrency = currency || "INR";
    const conversionRates = {
      INR: 1.0,
      AED: 22.5,
      USD: 83.5,
      GBP: 106.0
    };
    const rate = conversionRates[targetCurrency] || 1.0;
    const amountInINR = parseFloat(amount) * rate;

    const receiptId = `REC-${Date.now()}`;
    const orderDetails = await createPaymentOrder(amountInINR, receiptId);

    res.status(201).json({
      message: "Razorpay recharge order created successfully",
      orderDetails,
      keyId: process.env.RAZORPAY_KEY_ID || "your_key_id",
      orderId: orderDetails.id,
      amount: amountInINR,
      currency: "INR",
      isDemoMode: orderDetails.simulated === true,
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

    // Auto-reprocess any pending Draft shipments for this user
    let autoReprocessed = 0;
    try {
      const autoRes = await reprocessDraftShipmentsForUser(req.user._id);
      if (autoRes?.processedCount) {
        autoReprocessed = autoRes.processedCount;
      }
    } catch (autoErr) {
      console.warn("Auto-reprocess error after online recharge:", autoErr.message);
    }

    const latestWallet = await Wallet.findOne({ user: req.user._id, currency: targetCurrency });

    res.status(200).json({
      message: appliedCoupon
        ? `Success: Deposited ₹${numericAmount} + ₹${bonusAmount.toFixed(2)} Coupon Bonus to wallet.${autoReprocessed > 0 ? ` Automatically reprocessed and booked ${autoReprocessed} draft shipment(s)!` : ""}`
        : `Success: Deposited ₹${numericAmount} to wallet. Balance updated.${autoReprocessed > 0 ? ` Automatically reprocessed and booked ${autoReprocessed} draft shipment(s)!` : ""}`,
      wallet: latestWallet || wallet,
      transaction,
      autoReprocessed,
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

    // Auto-reprocess any pending Draft shipments for this user
    let autoReprocessed = 0;
    try {
      const autoRes = await reprocessDraftShipmentsForUser(tx.userId);
      if (autoRes?.processedCount) {
        autoReprocessed = autoRes.processedCount;
      }
    } catch (autoErr) {
      console.warn("Auto-reprocess error after bank transfer approve:", autoErr.message);
    }

    const latestWallet = await Wallet.findOne({ user: tx.userId, currency: txCurrency });

    res.status(200).json({
      message: `Success: Verified bank transfer. Balance added.${autoReprocessed > 0 ? ` Automatically reprocessed and booked ${autoReprocessed} draft shipment(s).` : ""}`,
      wallet: latestWallet || wallet,
      tx,
      autoReprocessed,
    });
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

/**
 * Get Wallet Categories (Credit or Debit)
 * Auto-seeds defaults if none exist
 */
export const getWalletCategories = async (req, res) => {
  try {
    const { type } = req.query; // 'Credit' or 'Debit'
    const query = {};
    if (type) {
      query.type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    let categories = await WalletCategory.find(query).sort({ isDefault: -1, createdAt: 1 });

    // If no categories exist for this type, seed defaults
    if (categories.length === 0) {
      const defaultCategories = [
        // Credit (Add Balance) defaults
        { name: "Insurance Claim", type: "Credit", sublabel: "Lost or damaged cargo settlement", isDefault: true },
        { name: "Coupon", type: "Credit", sublabel: "Promotional or discount credit voucher", isDefault: true },
        { name: "Cash Deposit", type: "Credit", sublabel: "Direct cash deposit to account", isDefault: true },
        { name: "Bonus / Cashback", type: "Credit", sublabel: "Merchant volume incentive or referral reward", isDefault: true },
        { name: "Bank Transfer", type: "Credit", sublabel: "Direct NEFT/RTGS/IMPS wire transfer receipt", isDefault: true },

        // Debit (Cut Balance) defaults
        { name: "Weight Discrepancy", type: "Debit", sublabel: "Carrier audit weight difference charges", isDefault: true },
        { name: "RTO Charges", type: "Debit", sublabel: "Return to origin freight & logistics charges", isDefault: true },
        { name: "Penalty / Violation", type: "Debit", sublabel: "Platform policy breach or KYC fine", isDefault: true },
        { name: "Customs & Duty Adjustment", type: "Debit", sublabel: "Consignee unpaid duties or customs fee debit", isDefault: true },
        { name: "Lost / Damaged Goods Fee", type: "Debit", sublabel: "Transit damage adjustment or inspection fees", isDefault: true },
        { name: "Cancellation Fee", type: "Debit", sublabel: "Consignment cancellation after pickup/manifest", isDefault: true },
        { name: "Manual Recovery / Correction", type: "Debit", sublabel: "Administrative ledger clawback or debit correction", isDefault: true },
        { name: "Other / Miscellaneous", type: "Debit", sublabel: "Custom deduction reason specified in memo", isDefault: true },
      ];

      const toInsert = type
        ? defaultCategories.filter(c => c.type === query.type)
        : defaultCategories;

      if (toInsert.length > 0) {
        await WalletCategory.insertMany(toInsert);
        categories = await WalletCategory.find(query).sort({ isDefault: -1, createdAt: 1 });
      }
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wallet categories", error: error.message });
  }
};

/**
 * Create a new Wallet Category (Admin manually adds category)
 */
export const createWalletCategory = async (req, res) => {
  try {
    const { name, type, sublabel } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const normalizedType = type && type.toLowerCase() === "debit" ? "Debit" : "Credit";

    // Check if category already exists for this type
    const existing = await WalletCategory.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      type: normalizedType
    });

    if (existing) {
      return res.status(200).json({
        message: "Category already exists",
        category: existing
      });
    }

    const newCategory = await WalletCategory.create({
      name: name.trim(),
      type: normalizedType,
      sublabel: (sublabel || "").trim(),
      isDefault: false,
      createdBy: req.user?.name || "Admin"
    });

    res.status(201).json({
      message: `Category '${newCategory.name}' added successfully!`,
      category: newCategory
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating wallet category", error: error.message });
  }
};

/**
 * Delete a Wallet Category (Admin deletes category)
 */
export const deleteWalletCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Category ID or name is required" });
    }

    let category;
    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await WalletCategory.findById(id);
    }
    if (!category) {
      category = await WalletCategory.findOne({ name: id });
    }

    if (!category) {
      return res.status(404).json({ message: "Category not found in database" });
    }

    await WalletCategory.findByIdAndDelete(category._id);

    res.status(200).json({
      message: `Category '${category.name}' deleted successfully!`,
      deletedId: category._id,
      deletedName: category.name
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting wallet category", error: error.message });
  }
};


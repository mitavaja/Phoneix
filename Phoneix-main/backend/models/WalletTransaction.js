import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["Recharge", "Credit", "Debit", "Refund", "Penalty", "Adjustment", "Hold", "Manual Credit", "Manual Debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    openingBalance: {
      type: Number,
      required: true,
    },
    closingBalance: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
      required: true, // e.g. UTR, Razorpay payment ID, AWB
    },
    remarks: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    shipmentId: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      default: "System",
    },
    status: {
      type: String,
      enum: ["HOLD", "Completed", "Released", "Failed"],
      default: "Completed",
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({ userId: 1 });
walletTransactionSchema.index({ referenceId: 1 });
walletTransactionSchema.index({ createdAt: 1 });

const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);
export default WalletTransaction;

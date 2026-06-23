import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["Recharge", "Credit", "Debit", "Refund", "Penalty", "Adjustment", "Hold"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
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
      required: true, // e.g. AWB, order ID, gateway charge ID
    },
    remarks: {
      type: String,
      default: "",
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

import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["Manual Credit", "Gateway Deposit", "Shipment Debit", "Discrepancy Penalty", "Discrepancy Correction"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },
    method: {
      type: String,
      required: true,
    },
    ref: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;

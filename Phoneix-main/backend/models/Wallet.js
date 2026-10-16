import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "India",
    },
    currency: {
      type: String,
      default: "INR",
    },
    balance: {
      type: Number,
      default: 0.0,
    },
    totalBalance: {
      type: Number,
      default: 0.0,
    },
    availableBalance: {
      type: Number,
      default: 0.0,
    },
    holdBalance: {
      type: Number,
      default: 0.0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

walletSchema.index({ user: 1, currency: 1 }, { unique: true });

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;

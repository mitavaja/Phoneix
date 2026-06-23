import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;

import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    couponType: {
      type: String,
      enum: ["Percentage", "Flat"],
      default: "Percentage",
    },
    value: {
      type: Number,
      required: true,
    },
    minRecharge: {
      type: Number,
      default: 0,
    },
    firstTimeOnly: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;

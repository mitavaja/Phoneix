import mongoose from "mongoose";

const weightDiscrepancySchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerWeight: {
      type: Number,
      required: true,
    },
    courierWeight: {
      type: Number,
      required: true,
    },
    difference: {
      type: Number,
      required: true,
    },
    additionalCharge: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Deducted"],
      default: "Pending",
    },
    adminRemarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

weightDiscrepancySchema.index({ shipmentId: 1 });
weightDiscrepancySchema.index({ status: 1 });

const WeightDiscrepancy = mongoose.model("WeightDiscrepancy", weightDiscrepancySchema);
export default WeightDiscrepancy;

import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
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
    claimType: {
      type: String,
      enum: ["Lost Shipment", "Damaged Shipment", "Delayed Shipment"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
      default: "", // supporting invoice / photo URL or file path
    },
    claimAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Investigation", "Approved", "Rejected", "Paid"],
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

claimSchema.index({ shipmentId: 1 });
claimSchema.index({ status: 1 });

const Claim = mongoose.model("Claim", claimSchema);
export default Claim;

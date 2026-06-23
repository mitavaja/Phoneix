import mongoose from "mongoose";

const trackingHistorySchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "", // e.g. "Mumbai Hub"
    },
    description: {
      type: String,
      default: "", // e.g. "Package received at hub"
    },
    eventTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

trackingHistorySchema.index({ shipmentId: 1 });
trackingHistorySchema.index({ eventTime: 1 });

const TrackingHistory = mongoose.model("TrackingHistory", trackingHistorySchema);
export default TrackingHistory;

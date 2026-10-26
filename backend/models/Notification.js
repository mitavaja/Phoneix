import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "KYC Approved",
        "KYC Rejected",
        "Wallet Recharged",
        "Wallet Debited",
        "Shipment Booked",
        "Shipment Saved as Draft",
        "Shipment Drafted",
        "Shipment Reprocessed",
        "Shipment Cancelled",
        "Pickup Scheduled",
        "Delivered",
        "Claim Updated",
        "Ticket Updated",
        "General"
      ],
      default: "General",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

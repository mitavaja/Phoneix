import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "Admin Approved KYC", "Admin Added Wallet Credit"
    },
    module: {
      type: String,
      required: true, // e.g. "KYC", "Wallet", "Margins", "Discrepancy", "Claims", "Shipments"
    },
    oldValue: {
      type: String,
      default: "",
    },
    newValue: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ createdAt: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;

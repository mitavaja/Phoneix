import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    codLimit: {
      type: Number,
      default: 50000,
    },
    adminEmail: { type: String, default: "admin@phreights.com" },
    adminPassword: { type: String, default: "" },
    adminPin: { type: String, default: "1234" },
    aramexUsername: { type: String, default: "" },
    aramexPassword: { type: String, default: "" },
    aramexAccountNumber: { type: String, default: "" },
    aramexAccountPin: { type: String, default: "1234" },
    aramexAccountEntity: { type: String, default: "" },
    aramexAccountCountryCode: { type: String, default: "" },
    aramexApiEnv: { type: String, default: "Sandbox" },
  },
  {
    timestamps: true,
  }
);

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);
export default SystemSetting;

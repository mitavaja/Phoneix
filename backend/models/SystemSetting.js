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
    aramexUsername: { type: String, default: "" },
    aramexPassword: { type: String, default: "" },
    aramexAccountNumber: { type: String, default: "" },
    aramexAccountPin: { type: String, default: "" },
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

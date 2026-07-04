import SystemSetting from "../models/SystemSetting.js";

// Retrieve system settings
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({});
    if (!settings) {
      // Seed default settings if missing
      settings = await SystemSetting.create({
        maintenanceMode: false,
        codLimit: 50000,
      });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch system settings", error: error.message });
  }
};

// Update system settings
export const updateSystemSettings = async (req, res) => {
  try {
    const {
      maintenanceMode,
      codLimit,
      aramexUsername,
      aramexPassword,
      aramexAccountNumber,
      aramexAccountPin,
      aramexAccountEntity,
      aramexAccountCountryCode,
      aramexApiEnv,
    } = req.body;

    let settings = await SystemSetting.findOne({});
    if (!settings) {
      settings = new SystemSetting({});
    }

    if (maintenanceMode !== undefined) {
      settings.maintenanceMode = maintenanceMode;
    }
    if (codLimit !== undefined) {
      settings.codLimit = parseFloat(codLimit);
    }
    if (aramexUsername !== undefined) settings.aramexUsername = aramexUsername;
    if (aramexPassword !== undefined) settings.aramexPassword = aramexPassword;
    if (aramexAccountNumber !== undefined) settings.aramexAccountNumber = aramexAccountNumber;
    if (aramexAccountPin !== undefined) settings.aramexAccountPin = aramexAccountPin;
    if (aramexAccountEntity !== undefined) settings.aramexAccountEntity = aramexAccountEntity;
    if (aramexAccountCountryCode !== undefined) settings.aramexAccountCountryCode = aramexAccountCountryCode;
    if (aramexApiEnv !== undefined) settings.aramexApiEnv = aramexApiEnv;

    await settings.save();
    res.status(200).json({ message: "System settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to modify system settings", error: error.message });
  }
};

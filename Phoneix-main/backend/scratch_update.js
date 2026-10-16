import mongoose from "mongoose";
import SystemSetting from "./models/SystemSetting.js";

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/phreight_commerce");
  const settings = await SystemSetting.findOne({});
  if (settings) {
    settings.aramexAccountEntity = "BOM";
    await settings.save();
    console.log("Updated SystemSetting aramexAccountEntity to BOM successfully.");
  } else {
    console.log("No SystemSetting found in database.");
  }
  process.exit(0);
}

main().catch(err => {
  console.error("Error updating DB:", err);
  process.exit(1);
});

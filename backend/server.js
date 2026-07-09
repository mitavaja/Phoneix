import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";
import { startSyncScheduler } from "./services/syncService.js";

// Connect DB
connectDB();

// Initialize Background Tracking Sync Cron Job
startSyncScheduler();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
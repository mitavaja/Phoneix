import express from "express";
import cors from "cors";
import path from "path";

// Routes imports
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import kycRoutes from "./routes/kycRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import rateRoutes from "./routes/rateRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import pageContentRoutes from "./routes/pageContentRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve uploads statically so labels and attachments are downloadable
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/rates", rateRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/page-content", pageContentRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Phreight E-Commerce Logistics Master API running...", status: "ONLINE" });
});

export default app;
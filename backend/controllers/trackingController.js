import Shipment from "../models/Shipment.js";
import TrackingHistory from "../models/TrackingHistory.js";

export const trackShipment = async (req, res) => {
  try {
    const { shipmentId } = req.params;

    if (!shipmentId) {
      return res.status(400).json({ message: "Shipment ID parameter is required" });
    }

    const shipment = await Shipment.findOne({
      $or: [{ shipmentId }, { courierTrackingNumber: shipmentId }]
    });

    if (!shipment) {
      return res.status(404).json({ message: `Shipment record with tracking ID "${shipmentId}" not found` });
    }

    // Fetch tracking timeline from DB
    const timeline = await TrackingHistory.find({ shipmentId: shipment._id }).sort({ eventTime: 1 });

    res.status(200).json({
      message: "Shipment record located successfully",
      shipment,
      trackingSteps: timeline,
    });
  } catch (error) {
    res.status(500).json({ message: "Error tracking shipment", error: error.message });
  }
};

export const publicVerifyTracking = async (req, res) => {
  try {
    const s = await Shipment.find({ status: { $ne: "Draft" } }).limit(5).select("shipmentId courierTrackingNumber status");
    res.status(200).json({ message: "Active tracking keys", activeKeys: s });
  } catch (err) {
    res.status(500).json({ message: "Error tracking active keys", error: err.message });
  }
};

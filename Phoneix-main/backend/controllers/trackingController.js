import Shipment from "../models/Shipment.js";
import TrackingHistory from "../models/TrackingHistory.js";
import { trackAramexShipment } from "../services/aramexService.js";

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
      return res.status(404).json({ message: `Shipment record not found` });
    }

    // Only hit the live Aramex API if the shipment has an AWB and isn't already finalized
    if (shipment.courierTrackingNumber && !["Delivered", "Cancelled"].includes(shipment.status)) {
      const trackingResult = await trackAramexShipment(shipment.courierTrackingNumber);

      if (trackingResult.success && trackingResult.events.length > 0) {

        // 1. Sync Chronological Events to Database
        for (const event of trackingResult.events) {
          const exists = await TrackingHistory.findOne({
            shipmentId: shipment._id,
            status: event.status,
            eventTime: event.eventTime // Removed the redundant new Date() wrapping
          });

          if (!exists) {
            await TrackingHistory.create({
              shipmentId: shipment._id,
              status: event.status,
              description: event.description,
              location: event.location || "",
              eventTime: event.eventTime // Removed the redundant new Date() wrapping
            });
          }
        }

        // 2. Update Primary Shipment Status if it progressed
        if (shipment.status !== trackingResult.status) {
          shipment.status = trackingResult.status;
          shipment.courierStatus = trackingResult.status;
          shipment.statusHistory.push({ status: trackingResult.status, time: new Date() });

          if (trackingResult.status === "Delivered") {
            shipment.dateDelivered = new Date();
          }
          await shipment.save();
        }
      }
    }

    // Fetch the newly synced timeline (sorted newest to oldest)
    const timeline = await TrackingHistory.find({ shipmentId: shipment._id }).sort({ eventTime: -1 });

    res.status(200).json({
      message: "Tracking synced successfully",
      shipment,
      trackingSteps: timeline,
    });
  } catch (error) {
    console.log(error)
    console.error("Live Tracking Error:", error.message);
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

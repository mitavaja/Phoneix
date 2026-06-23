import cron from "node-cron";
import Shipment from "../models/Shipment.js";
import TrackingHistory from "../models/TrackingHistory.js";
import Notification from "../models/Notification.js";
import { trackAramexShipment } from "./aramexService.js";

/**
 * Sync all active shipment tracking telemetry
 */
export const syncActiveTrackingData = async () => {
  console.log("--- Background Sync: Tracking Sync Service Triggered ---");
  try {
    const activeShipments = await Shipment.find({
      status: {
        $in: [
          "Booked",
          "Pickup Requested",
          "Pickup Scheduled",
          "Picked Up",
          "In Transit",
          "Out For Delivery",
        ],
      },
    });

    console.log(`Located ${activeShipments.length} active shipments to synchronize.`);

    for (const shipment of activeShipments) {
      if (!shipment.courierTrackingNumber) continue;

      const trackingResult = await trackAramexShipment(shipment.courierTrackingNumber);
      if (!trackingResult.success) continue;

      const newStatus = trackingResult.status;
      const prevStatus = shipment.status;

      // Update Shipment status if changed
      if (newStatus !== prevStatus) {
        shipment.status = newStatus;
        shipment.courierStatus = newStatus;
        shipment.statusHistory.push({ status: newStatus, time: new Date() });

        if (newStatus === "Delivered") {
          shipment.dateDelivered = new Date();
          shipment.podRef = `POD-${Math.floor(10000 + Math.random() * 90000)}`;
        }

        await shipment.save();

        // Create alert notification
        await Notification.create({
          userId: shipment.user,
          title: "Tracking Sync Alert",
          message: `Consignment AWB ${shipment.courierTrackingNumber} status has transitioned to: ${newStatus}`,
          type: newStatus === "Delivered" ? "Delivered" : "Shipment Booked",
        });

        console.log(`AWB ${shipment.courierTrackingNumber} updated: ${prevStatus} -> ${newStatus}`);
      }

      // Sync Tracking History logs
      const dbEventsCount = await TrackingHistory.countDocuments({ shipmentId: shipment._id });
      const apiEvents = trackingResult.events || [];

      if (apiEvents.length > dbEventsCount) {
        // Add only newer events
        const newEvents = apiEvents.slice(dbEventsCount);
        for (const ev of newEvents) {
          await TrackingHistory.create({
            shipmentId: shipment._id,
            status: ev.status,
            location: ev.location,
            description: ev.description,
            eventTime: ev.eventTime,
          });
        }
        console.log(`Added ${newEvents.length} tracking steps for AWB ${shipment.courierTrackingNumber}`);
      }
    }
    console.log("--- Background Sync Completed successfully ---");
  } catch (err) {
    console.error("Tracking sync process exception:", err.message);
  }
};

// Cron Schedule: Every 30 minutes
export const startSyncScheduler = () => {
  cron.schedule("*/30 * * * *", async () => {
    await syncActiveTrackingData();
  });
  console.log("Cron scheduler successfully registered: Tracking Sync Service runs every 30 minutes.");
};

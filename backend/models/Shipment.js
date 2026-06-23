import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store: {
      type: String,
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    courierName: {
      type: String,
      default: "Aramex",
    },
    courierShipmentId: {
      type: String,
      default: "",
    },
    courierTrackingNumber: {
      type: String,
      default: "",
    },
    courierStatus: {
      type: String,
      default: "",
    },
    // Backward compatibility for courier field
    courier: {
      type: String,
      default: "Aramex",
    },
    weight: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    volumetricWeight: {
      type: Number,
      default: 0.0,
    },
    chargeableWeight: {
      type: Number,
      default: 0.0,
    },
    shipmentType: {
      type: String,
      enum: ["Document", "Parcel"],
      default: "Parcel",
    },
    productDescription: {
      type: String,
      default: "",
    },
    shipmentValue: {
      type: Number,
      default: 0.0,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    receiverName: {
      type: String,
      default: "",
    },
    receiverMobile: {
      type: String,
      default: "",
    },
    receiverAddress: {
      type: String,
      default: "",
    },
    receiverCity: {
      type: String,
      default: "",
    },
    receiverState: {
      type: String,
      default: "",
    },
    receiverCountry: {
      type: String,
      default: "",
    },
    receiverPincode: {
      type: String,
      default: "",
    },
    pickupAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PickupAddress",
    },
    pickupManifestId: {
      type: String,
      default: "",
    },
    pickupDate: {
      type: Date,
    },
    // Decoupled GST billing
    shippingCharge: {
      type: Number,
      default: 0.0,
    },
    gstAmount: {
      type: Number,
      default: 0.0,
    },
    invoiceTotal: {
      type: Number,
      default: 0.0,
    },
    invoiceNumber: {
      type: String,
      default: "",
    },
    // Legacy charge field (mapped to invoiceTotal or shippingCharge)
    charge: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Booked",
        "Label Generated",
        "Pickup Requested",
        "Pickup Scheduled",
        "Picked Up",
        "In Transit",
        "Out For Delivery",
        "Delivered",
        "Failed Delivery",
        "Returned",
        "Cancelled",
      ],
      default: "Draft",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        time: { type: Date, default: Date.now },
      },
    ],
    deliveryTime: {
      type: String,
      default: "",
    },
    dateBooked: {
      type: Date,
      default: Date.now,
    },
    dateDelivered: {
      type: Date,
    },
    dateCancelled: {
      type: Date,
    },
    podRef: {
      type: String,
      default: "",
    },
    feedback: {
      type: String,
      default: "",
    },
    // Weight Discrepancy fields
    weightDiscrepancy: {
      type: Boolean,
      default: false,
    },
    scannedWeight: {
      type: Number,
      default: 0.0,
    },
    deltaCost: {
      type: Number,
      default: 0.0,
    },
    discrepancyStatus: {
      type: String,
      enum: ["None", "Pending", "Approved (Merchant)", "Approved (Courier)"],
      default: "None",
    },
    discrepancyDetails: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
shipmentSchema.index({ courierTrackingNumber: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ user: 1 });
shipmentSchema.index({ createdAt: 1 });

const Shipment = mongoose.model("Shipment", shipmentSchema);
export default Shipment;

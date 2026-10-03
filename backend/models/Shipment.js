import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
    {
        // ==========================================
        // 1. CORE IDENTIFIERS
        // ==========================================
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

        // ==========================================
        // 2. COURIER & LABEL INFO
        // ==========================================
        courierName: {
            type: String,
            default: "Aramex",
        },
        courier: { // Legacy field for backward compatibility
            type: String,
            default: "Aramex",
        },
        courierShipmentId: { // Aramex Reference (e.g. SHP-1234)
            type: String,
            default: "",
        },
        courierTrackingNumber: { // Live AWB Number
            type: String,
            default: "",
        },
        courierStatus: {
            type: String,
            default: "",
        },
        labelUrl: { // Live URL to the PDF label provided by Aramex
            type: String,
            default: "",
        },
        labelPdfPath: { // Local downloaded path just in case the URL expires
            type: String,
            default: "",
        },

        // ==========================================
        // 3. PACKAGE & DIMENSIONS
        // ==========================================
        weight: {
            type: Number,
            required: true,
        },
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        volumetricWeight: {
            type: Number,
            default: 0.0,
        },
        chargeableWeight: {
            type: Number,
            default: 0.0,
        },
        numberOfPieces: {
            type: Number,
            default: 1,
        },

        // ==========================================
        // 4. SERVICE & CUSTOMS SPECIFICATIONS
        // ==========================================
        shipmentType: { // General internal classification
            type: String,
            enum: ["Document", "Parcel"],
            default: "Parcel",
        },
        productGroup: { // Aramex routing: EXP (Express) or DOM (Domestic)
            type: String,
            default: "EXP",
        },
        productType: { // Aramex service: PPX, PDX, EPX, etc.
            type: String,
            default: "PPX",
        },
        paymentType: { // 'P' (Prepaid), 'C' (Collect), '3' (Third Party)
            type: String,
            default: "P",
        },
        productDescription: {
            type: String,
            default: "",
        },
        goodsOriginCountry: { // 2-Letter ISO where goods were manufactured
            type: String,
            default: "IN",
        },
        shipmentValue: { // Customs Declared Value
            type: Number,
            default: 0.0,
        },
        currency: { // ISO Currency Code for Customs Value (e.g., USD, AED)
            type: String,
            default: "USD",
        },

        // ==========================================
        // 5. RECIPIENT & ORIGIN DETAILS
        // ==========================================
        from: { type: String, required: true },
        to: { type: String, required: true },
        pickupAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PickupAddress", // Or PickupAddress based on your exact model name
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RecipientCustomer",
        },
        customer: { type: String, required: true }, // Name display fallback
        receiverName: { type: String, default: "" },
        receiverMobile: { type: String, default: "" },
        receiverAddress: { type: String, default: "" },
        receiverCity: { type: String, default: "" },
        receiverState: { type: String, default: "" },
        receiverCountry: { type: String, default: "" },
        receiverPincode: { type: String, default: "" },

        // ==========================================
        // 6. PICKUP SCHEDULING DETAILS
        // ==========================================
        pickupReferenceId: { // Aramex Pickup GUID
            type: String,
            default: "",
        },
        manifestCode: { // Aramex Manifest Code for the driver
            type: String,
            default: "",
        },
        pickupDate: {
            type: Date,
        },

        // ==========================================
        // 7. FINANCIAL BREAKDOWN & MARGINS
        // ==========================================
        aramexBaseCost: { // The raw cost we pay to Aramex
            type: Number,
            default: 0.0,
        },
        marginApplied: { // The CRM rule applied (e.g. { type: 'Percentage', value: 10 })
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        marginAmount: { // Our exact profit markup on this shipment
            type: Number,
            default: 0.0,
        },
        shippingCharge: { // Base + Margin (Before GST)
            type: Number,
            default: 0.0,
        },
        gstAmount: { // 18% Tax decoupled
            type: Number,
            default: 0.0,
        },
        invoiceTotal: { // Final amount deducted from seller's wallet
            type: Number,
            default: 0.0,
        },
        invoiceNumber: {
            type: String,
            default: "",
        },
        charge: { // Legacy charge field for backward compatibility
            type: Number,
            required: true,
        },

        // ==========================================
        // 8. STATUS & TRACKING
        // ==========================================
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
        dateBooked: { type: Date, default: Date.now },
        dateDelivered: { type: Date },
        dateCancelled: { type: Date },
        deliveryTime: { type: String, default: "" },
        podRef: { type: String, default: "" },
        feedback: { type: String, default: "" },

        // ==========================================
        // 9. WEIGHT DISCREPANCY & DISPUTES
        // ==========================================
        weightDiscrepancy: { type: Boolean, default: false },
        scannedWeight: { type: Number, default: 0.0 },
        deltaCost: { type: Number, default: 0.0 },
        discrepancyStatus: {
            type: String,
            enum: ["None", "Pending", "Approved (Merchant)", "Approved (Courier)"],
            default: "None",
        },
        discrepancyDetails: { type: String, default: "" },
    },
    {
        timestamps: true,
    }
);

// Indexes for fast querying
shipmentSchema.index({ courierTrackingNumber: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ user: 1 });
shipmentSchema.index({ createdAt: 1 });

const Shipment = mongoose.model("Shipment", shipmentSchema);
export default Shipment;
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import csvParser from "csv-parser";
import { Readable } from "stream";
import mongoose from "mongoose";

import Shipment from "../models/Shipment.js";
import User from "../models/User.js";
import KYC from "../models/KYC.js";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import PickupAddress from "../models/PickupAddress.js";
import WeightDiscrepancy from "../models/WeightDiscrepancy.js";
import TrackingHistory from "../models/TrackingHistory.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import MarginRule from "../models/MarginRule.js";
import RecipientCustomers from "../models/RecipientCustomers.js";
import AdminWallet from "../models/AdminWallet.js";

import { createAramexShipment, createAramexPickup, calculateAramexRate } from "../services/aramexService.js";
import { calculateShipGlobalRate, createShipGlobalOrder, getShipGlobalLabel } from "../services/shipglobalService.js";
import { sendShipmentBookedEmail } from "../services/emailService.js";

// Helper to determine wallet currency and country based on receiverCountry
export const getCurrencyForCountry = (country) => {
  const c = (country || "").toLowerCase().trim();
  if (c === "in" || c === "india") return { country: "India", currency: "INR" };
  if (c === "ae" || c === "uae" || c === "united arab emirates") return { country: "UAE", currency: "AED" };
  if (c === "us" || c === "usa" || c === "united states") return { country: "USA", currency: "USD" };
  if (c === "gb" || c === "uk" || c === "united kingdom") return { country: "UK", currency: "GBP" };
  return { country: "USA", currency: "USD" }; // Fallback
};

// Simple conversion rates from INR to target currencies
export const convertFromINR = (amountInINR, targetCurrency) => {
  const rates = {
    INR: 1.0,
    AED: 1 / 22.5,
    USD: 1 / 83.5,
    GBP: 1 / 106.0
  };
  const rate = rates[targetCurrency] || 1.0;
  return amountInINR * rate;
};

// Helper to evaluate priority margin
const evaluatePriorityMargin = async (countryCode, weight) => {
  const rules = await MarginRule.find({});
  if (rules.length === 0) return { type: "Fixed", value: 100.0 };
  const cleanCountry = (countryCode || "").toLowerCase().trim();

  // Priority 1: Country + Weight
  let matched = rules.find((r) => {
    if (!r.country || r.country.toLowerCase().trim() !== cleanCountry) return false;
    return weight >= r.weightMin && (r.weightMax === 0 || weight <= r.weightMax);
  });
  // Priority 2: Country
  if (!matched) {
    matched = rules.find((r) => r.country && r.country.toLowerCase().trim() === cleanCountry && r.weightMin === 0 && r.weightMax === 0);
  }
  // Priority 3: Weight
  if (!matched) {
    matched = rules.find((r) => !r.country && weight >= r.weightMin && (r.weightMax === 0 || weight <= r.weightMax));
  }
  // Priority 4: Global
  if (!matched) {
    matched = rules.find((r) => !r.country && r.weightMin === 0 && r.weightMax === 0);
  }
  return matched ? { type: matched.type, value: matched.value } : { type: "Fixed", value: 100.0 };
};

// Book Shipment (Merchant) with HOLD Flow
export const bookShipment = async (req, res) => {
  let holdTransaction = null;
  let wallet = null;
  let invoiceTotal = 0;

  try {
    const {
      courier = "aramex",
      pickupAddressId,
      customerId,
      weight,
      length,
      width,
      height,
      numberOfPieces = 1,
      productType = "PPX",
      paymentType = "P",
      productDescription,
      goodsOriginCountry = "IN",
      customsValue,
      customsCurrency,
      shipmentType = "Parcel"
    } = req.body;

    // 1. Strict Validation
    if (!pickupAddressId || !customerId || !weight || !customsValue || !customsCurrency) {
      return res.status(400).json({
        message: "Warehouse origin, recipient, weight, and customs declarations are strictly required."
      });
    }

    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight) || numericWeight <= 0) {
      return res.status(400).json({
        message: "Weight must be a positive number greater than 0."
      });
    }

    const originWarehouse = await PickupAddress.findById(pickupAddressId);
    const dest = await RecipientCustomers.findById(customerId);

    if (!originWarehouse || !dest) {
      return res.status(404).json({
        message: "Origin warehouse or destination customer not found."
      });
    }

    // 2. Weight Calculations
    const l = parseFloat(length || 0);
    const w = parseFloat(width || 0);
    const h = parseFloat(height || 0);
    const volumetricWeight = (l * w * h) / 5000.0;
    const chargeableWeight = Math.max(numericWeight, volumetricWeight);

    // 3. Security Check: Server-Side Rate Validation
    let baseRate = 0;

    if (courier.toLowerCase() === "aramex") {
      const rateRes = await calculateAramexRate({
        originAddress: originWarehouse,
        destinationAddress: dest,
        originCountry: originWarehouse.country || "IN",
        destinationCountry: dest.countryCode,
        weight: numericWeight,
        length: l, width: w, height: h,
        isDocument: shipmentType === "Document",
        productGroup: "EXP",
        productType
      });
      baseRate = parseFloat(rateRes.rate);

    } else if (courier.toLowerCase() === "phreight" || courier.toLowerCase() === "shipglobal") {
      const sgRateRes = await calculateShipGlobalRate({
        weight: numericWeight,
        destinationCountry: dest.countryCode,
        postalCode: dest.postCode || "00000"
      });

      if (!sgRateRes.services || sgRateRes.services.length === 0) {
        return res.status(400).json({
          message: "No Phreight services available for this route."
        });
      }

      const matchedService = sgRateRes.services.find(s => s.title.toLowerCase() === productType.toLowerCase());
      if (!matchedService) {
        return res.status(400).json({
          message: `Selected service '${productType}' is not available.`
        });
      }
      baseRate = parseFloat(matchedService.price?.logistic_fee || matchedService.subtotal_fee);

    } else {
      return res.status(400).json({
        message: `Courier '${courier}' is not currently active for booking.`
      });
    }

    // 4. Financial Calculations
    const marginRule = await evaluatePriorityMargin(dest.countryCode, chargeableWeight);
    let shippingCharge = baseRate;
    let marginAmount = 0;

    if (marginRule.type === "Fixed") {
      marginAmount = marginRule.value;
      shippingCharge = baseRate + marginAmount;
    } else if (marginRule.type === "Percentage") {
      marginAmount = (baseRate * marginRule.value) / 100.0;
      shippingCharge = baseRate + marginAmount;
    }

    const gstAmount = parseFloat((shippingCharge * 0.18).toFixed(2));
    invoiceTotal = parseFloat((shippingCharge + gstAmount).toFixed(2));

    // 5. Wallet Verification & Ledger Hold
    const billingCurrency = "INR";
    wallet = await Wallet.findOne({
      user: req.user._id,
      currency: billingCurrency
    });

    if (!wallet) return res.status(400).json({
      message: "Wallet not found. Please initialize your wallet."
    });

    if (wallet.availableBalance < invoiceTotal) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Total cost is ₹${invoiceTotal.toFixed(2)}, available balance is ₹${wallet.availableBalance.toFixed(2)}.`
      });
    }

    const openingBalance = wallet.availableBalance;
    wallet.availableBalance -= invoiceTotal;
    wallet.holdBalance += invoiceTotal;
    wallet.balance = wallet.availableBalance;
    await wallet.save();

    const shipmentId = `PHX-SH-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    holdTransaction = await WalletTransaction.create({
      walletId: wallet._id,
      userId: req.user._id,
      transactionType: "Hold",
      amount: -invoiceTotal,
      currency: billingCurrency,
      openingBalance,
      closingBalance: wallet.availableBalance,
      referenceId: `HOLD-${shipmentId}`,
      remarks: `Reserved funds for Shipment ${shipmentId}`,
      shipmentId,
      status: "HOLD",
    });

    // 6. Invoke Carrier API (Aramex OR ShipGlobal)
    let courierShipmentId = "";
    let courierTrackingNumber = "";
    let labelUrl = "";
    let labelBufferBase64 = null;

    if (courier.toLowerCase() === "aramex") {
      const aramexPayload = {
        sender: {
          id: req.user._id,
          companyName: wallet.storeName,
          contactPerson: originWarehouse.contactPerson || req.user.name,
          mobile: originWarehouse.mobile || "9876543210",
          email: req.user.email,
          address: originWarehouse.address,
          city: originWarehouse.city,
          state: originWarehouse.state,
          country: originWarehouse.country || "IN",
          pincode: originWarehouse.pincode,
        },
        receiver: {
          name: dest.name,
          contactPerson: dest.name,
          mobile: dest.mobile,
          address: dest.addressLine1,
          city: dest.city,
          state: dest.stateOrProvinceCode,
          country: dest.countryCode,
          postCode: dest.postCode,
          email: dest.email || "recipient@example.com",
        },
        parcel: {
          referenceId: shipmentId,
          weight: numericWeight,
          length: l, width: w, height: h,
          pieces: numberOfPieces,
          productGroup: "EXP",
          productType,
          paymentType,
          productDescription,
          goodsOriginCountry,
          shipmentValue: parseFloat(customsValue),
          currency: customsCurrency,
          type: shipmentType,
        },
      };

      const bookingResult = await createAramexShipment(aramexPayload);
      courierShipmentId = bookingResult.courierShipmentId;
      courierTrackingNumber = bookingResult.courierTrackingNumber;
      labelUrl = bookingResult.labelUrl;
      labelBufferBase64 = bookingResult.labelBufferBase64;

    } else if (courier.toLowerCase() === "phreight" || courier.toLowerCase() === "shipglobal") {
      // Prepare ShipGlobal Data
      const nameParts = dest.name.split(" ");
      const firstName = nameParts[0] || dest.name;
      const lastName = nameParts.slice(1).join(" ") || "Customer";
      const invoiceDate = new Date().toISOString().split('T')[0];

      const sgPayload = {
        invoice_no: invoiceNumber,
        invoice_date: invoiceDate,
        order_reference: shipmentId,
        service: productType,
        package_weight: String(numericWeight),
        package_length: String(l || 10),
        package_breadth: String(w || 10),
        package_height: String(h || 10),
        currency_code: customsCurrency || "USD",
        csb5_status: 1, // Electronic Customs
        customer_shipping_firstname: firstName,
        customer_shipping_lastname: lastName,
        customer_shipping_mobile: dest.mobile,
        customer_shipping_email: dest.email || req.user.email,
        customer_shipping_company: dest.companyName || "",
        customer_shipping_address: dest.addressLine1,
        customer_shipping_address_2: dest.addressLine2 || "",
        customer_shipping_address_3: dest.addressLine3 || "",
        customer_shipping_city: dest.city,
        customer_shipping_postcode: dest.postCode || "00000",
        customer_shipping_country_code: dest.countryCode,
        customer_shipping_state: dest.stateOrProvinceCode || dest.city,
        ioss_number: "",
        customer_nickname: "",
        vendor_order_items: [
          {
            vendor_order_item_name: productDescription,
            vendor_order_item_sku: "ITEM-01",
            vendor_order_item_quantity: String(numberOfPieces),
            vendor_order_item_unit_price: String((parseFloat(customsValue) / numberOfPieces).toFixed(2)),
            vendor_order_item_hsn: "61112000",
            vendor_order_item_tax_rate: "0"
          }
        ]
      };

      console.dir({ payload : sgPayload}, { depth: 3 });

      // 1. Add Order
      const sgOrderResult = await createShipGlobalOrder(sgPayload);
      const orderId = sgOrderResult.order_id || sgOrderResult.data?.order_id;

      // 2. Pay & Get Label
      try {
        const sgLabelResult = await getShipGlobalLabel({ order_id: [orderId] });
        courierShipmentId = String(orderId);
        courierTrackingNumber = sgLabelResult.awb || sgLabelResult.data?.[0]?.awb || sgOrderResult.awb || `SG-${Date.now()}`;
        labelUrl = sgLabelResult.label_url || sgLabelResult.data?.[0]?.label || "";
      } catch (labelErr) {
        console.warn("Failed to auto-fetch ShipGlobal Label:", labelErr.message);
        courierShipmentId = String(orderId);
        courierTrackingNumber = sgOrderResult.awb || `SG-${Date.now()}`;
      }
    }

    // 7. Commit Ledger Debit
    wallet.holdBalance -= invoiceTotal;
    wallet.totalBalance -= invoiceTotal;
    await wallet.save();

    holdTransaction.transactionType = "Debit";
    holdTransaction.status = "Completed";
    holdTransaction.remarks = `Shipping Debit (${courier.toUpperCase()} AWB: ${courierTrackingNumber})`;
    holdTransaction.referenceId = courierTrackingNumber;
    await holdTransaction.save();

    // 8. UPDATE ADMIN WALLET (SEPARATED LIABILITIES)
    let adminWallet = await AdminWallet.findOne({ currency: billingCurrency });
    if (!adminWallet) {
      adminWallet = await AdminWallet.create({ currency: billingCurrency });
    }

    adminWallet.totalGrossRevenue += invoiceTotal;
    adminWallet.gstPayables += gstAmount;
    adminWallet.netProfit += marginAmount;

    // Split the carrier liability buckets
    if (courier.toLowerCase() === "aramex") {
      adminWallet.aramexPayables += baseRate;
    } else {
      adminWallet.shipglobalPayables += baseRate;
    }
    await adminWallet.save();

    // 9. Save Shipment to Database
    const shipment = await Shipment.create({
      shipmentId,
      user: req.user._id,
      store: wallet.storeName,
      customer: dest.name,
      courierName: courier === "aramex" ? "Aramex" : "Phreight",
      courier: courier === "aramex" ? "Aramex" : "Phreight",
      weight: numericWeight,
      length: l, width: w, height: h,
      volumetricWeight: parseFloat(volumetricWeight.toFixed(2)),
      chargeableWeight: parseFloat(chargeableWeight.toFixed(2)),
      numberOfPieces,
      productGroup: "EXP",
      productType,
      paymentType,
      shipmentType,
      productDescription: productDescription || "E-commerce Goods",
      goodsOriginCountry,
      shipmentValue: parseFloat(customsValue || 0.0),
      currency: customsCurrency,
      from: originWarehouse.addressName || originWarehouse.city,
      to: `${dest.addressLine1}, ${dest.city}`,
      receiverName: dest.name,
      receiverMobile: dest.mobile,
      receiverAddress: dest.addressLine1,
      receiverCity: dest.city,
      receiverState: dest.stateOrProvinceCode,
      receiverCountry: dest.countryCode,
      receiverPincode: dest.postCode,
      pickupAddressId: originWarehouse._id,
      customerId: customerId,
      aramexBaseCost: baseRate, // Retained for backward compatibility
      marginApplied: marginRule,
      marginAmount: parseFloat(marginAmount.toFixed(2)),
      shippingCharge: parseFloat(shippingCharge.toFixed(2)),
      gstAmount,
      invoiceTotal,
      charge: invoiceTotal,
      courierShipmentId,
      courierTrackingNumber,
      courierStatus: "Booked",
      status: "Booked",
      invoiceNumber,
      labelUrl,
      statusHistory: [{ status: "Booked", time: new Date() }],
    });

    // 10. Save PDF locally (if base64 is provided by Aramex)
    if (labelBufferBase64) {
      const labelFilename = `label-${courierTrackingNumber}.pdf`;
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, labelFilename), Buffer.from(labelBufferBase64, "base64"));
      shipment.labelPdfPath = `/uploads/${labelFilename}`;
      await shipment.save();
    }

    // 11. Logs and Notifications
    await TrackingHistory.create({
      shipmentId: shipment._id,
      status: "Booked",
      location: originWarehouse.city,
      description: `Shipment registered with ${courier}. Ready for dispatch.`,
      eventTime: new Date(),
    });

    await AuditLog.create({
      userId: req.user._id,
      action: "Merchant Booked Shipment",
      module: "Shipments",
      oldValue: "Draft",
      newValue: "Booked",
      ipAddress: req.ip || "127.0.0.1",
    });

    await Notification.create({
      userId: req.user._id,
      title: "Shipment Booked Successfully",
      message: `Shipment ${shipmentId} booked via ${courier}. AWB: ${courierTrackingNumber}`,
      type: "Shipment Booked",
    });

    if (req.user.email) {
      await sendShipmentBookedEmail(req.user.email, courierTrackingNumber, dest.name, dest.addressLine1).catch(e => console.warn("Email error:", e.message));
    }

    return res.status(201).json({
      success: true,
      message: `Shipment ${shipmentId} booked successfully! AWB: ${courierTrackingNumber}`,
      shipment,
      newBalance: wallet.availableBalance,
    });

  } catch (error) {
    console.error("Booking Execution Error:", error.message);

    if (wallet && holdTransaction && holdTransaction.status === "HOLD") {
      wallet.availableBalance += invoiceTotal;
      wallet.holdBalance -= invoiceTotal;
      wallet.balance = wallet.availableBalance;
      await wallet.save();

      holdTransaction.status = "Released";
      holdTransaction.remarks = `Hold released: Booking error - ${error.message}`;
      await holdTransaction.save();
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to book shipment with carrier."
    });
  }
};

// List all shipments
export const getAllShipments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const skip = (page - 1) * limit;

    const matchStage = {};
    if (req.user && req.user.role === "Seller") {
      matchStage.user = new mongoose.Types.ObjectId(req.user._id);
    }

    if (status !== "all") {
      if (status === "Picked Up") {
        matchStage.status = { $in: ["Picked Up", "In Transit", "Delivered"] };
      } else if (status === "Dispatched") {
        matchStage.status = { $in: ["Pickup Requested", "Pickup Scheduled"] };
      } else if (status === "Exception") {
        matchStage.status = { $in: ["Failed Delivery", "Cancelled"] };
      } else if (status === "Scheduled") {
        matchStage.status = { $in: ["Booked", "Pending", "Label Generated"] };
      }
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "warehouses",
          localField: "pickupAddressId",
          foreignField: "_id",
          as: "pickupDetails"
        }
      },
      {
        $unwind: {
          path: "$pickupDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    if (search) {
      const searchRegex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { shipmentId: searchRegex },
            { manifestCode: searchRegex },
            { pickupReferenceId: searchRegex },
            { "userDetails.companyName": searchRegex },
            { "userDetails.name": searchRegex },
            { "pickupDetails.addressName": searchRegex },
            { "pickupDetails.city": searchRegex }
          ]
        }
      });
    }

    pipeline.push(
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: skip },
              { $limit: limit }
            ]
          }
        }
    );

    const result = await Shipment.aggregate(pipeline);

    const totalItems = result[0].metadata[0]?.total || 0;
    const shipments = result[0].data;

    res.status(200).json({
      shipments,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    console.error("Shipment Aggregation Error:", error.message);
    res.status(500).json({ message: "Error retrieving shipments list", error: error.message });
  }
};

// List for CRM side
export const getAdminShipments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    let query = {};

    if (status && status !== "all") {
      query.status = new RegExp(`^${status}$`, "i");
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { shipmentId: searchRegex },
        { courierTrackingNumber: searchRegex },
        { store: searchRegex },
        { customer: searchRegex }
      ];
    }

    const totalItems = await Shipment.countDocuments(query);

    const shipments = await Shipment.find(query)
        .populate("user", "name email companyName status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      shipments,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    console.error("Admin Shipment Fetch Error:", error.message);
    res.status(500).json({
      message: "Error retrieving admin shipments",
      error: error.message
    });
  }
};

// List delivered shipments
export const getDeliveredShipments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = { status: "Delivered" };

    // Scope data if the requester is a Seller instead of an Admin
    if (req.user && req.user.role === "Seller") {
      query.user = req.user._id;
    }

    // Apply global search query
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { shipmentId: searchRegex },
        { store: searchRegex },
        { customer: searchRegex },
        { podRef: searchRegex }
      ];
    }

    const totalItems = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
        .sort({ dateDelivered: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      shipments,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving delivered shipments register",
      error: error.message
    });
  }
};

// List cancelled shipments
export const getCancelledShipments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = { status: "Cancelled" };

    if (req.user && req.user.role === "Seller") {
      query.user = req.user._id;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { shipmentId: searchRegex },
        { store: searchRegex },
        { customer: searchRegex },
        { discrepancyDetails: searchRegex }
      ];
    }

    const totalItems = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
        .sort({ dateCancelled: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      shipments,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving RTO shipments archive",
      error: error.message
    });
  }
};

// Schedule Pickup Manifest
export const schedulePickup = async (req, res) => {
  try {
    const { shipmentIds, pickupDate, pickupAddressId } = req.body;

    if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0 || !pickupAddressId) {
      return res.status(400).json({ message: "Shipment IDs list and pickup address are required." });
    }

    // 1. Validate Warehouse
    const warehouse = await PickupAddress.findById(pickupAddressId);
    if (!warehouse) {
      return res.status(404).json({ message: "Pickup Address location not found." });
    }

    // 2. Fetch all Shipments to build the PickupItems array
    const shipments = await Shipment.find({ _id: { $in: shipmentIds } });
    if (shipments.length === 0) {
      return res.status(404).json({ message: "No valid shipments found to schedule." });
    }

    // 3. Map Database Shipments to Aramex PickupItems Data Structure
    const pickupItems = shipments.map((sh) => ({
      ProductGroup: "EXP", // Permanently locked to International Express
      ProductType: sh.productType || "PPX",
      NumberOfShipments: 1,
      PackageType: "Box",
      Payment: sh.paymentType || "P",
      ShipmentWeight: { Unit: "KG", Value: sh.weight },
      ShipmentVolume: null,
      NumberOfPieces: sh.numberOfPieces || 1,
      CashAmount: null,
      ExtraCharges: null,
      ShipmentDimensions: (sh.length && sh.width && sh.height)
          ? { Length: sh.length, Width: sh.width, Height: sh.height, Unit: "cm" }
          : null,
      Comments: sh.productDescription || "Ecommerce Pickup",
    }));

    // 4. Call Aramex Service
    const pickupResult = await createAramexPickup({
      pickupDate: pickupDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
      address: warehouse,
      contact: {
        department: "Logistics",
        companyName: warehouse.addressName || req.user.companyName || "Store",
        name: warehouse.contactPerson || req.user.name,
        mobile: warehouse.mobile || req.user.mobileNumber,
        email: req.user.email,
        reference: `MNF-${Date.now().toString().slice(-6)}`,
      },
      pickupItems,
    });

    // 5. Update Shipments in Database using the new Schema fields
    await Shipment.updateMany(
        { _id: { $in: shipmentIds } },
        {
          $set: {
            status: "Pickup Scheduled",
            pickupReferenceId: pickupResult.pickupId,
            manifestCode: pickupResult.manifestCode,
            pickupDate: pickupDate ? new Date(pickupDate) : new Date(Date.now() + 86400000),
          },
          $push: {
            statusHistory: { status: "Pickup Scheduled", time: new Date() },
          },
        }
    );

    // 6. Create Tracking History Entries
    for (const sh of shipments) {
      await TrackingHistory.create({
        shipmentId: sh._id,
        status: "Pickup Scheduled",
        location: warehouse.city,
        description: `Pickup Runner assigned. Manifest code: ${pickupResult.manifestCode}`,
        eventTime: new Date(),
      });
    }

    // 7. Write Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Merchant Scheduled Pickup Manifest",
      module: "Shipments",
      oldValue: "Booked",
      newValue: "Pickup Scheduled",
      ipAddress: req.ip || "127.0.0.1",
    });

    res.status(200).json({
      message: `Success: Scheduled pickup. Manifest code: ${pickupResult.manifestCode}`,
      manifestCode: pickupResult.manifestCode,
    });
  } catch (error) {
    console.error("Schedule Pickup Error:", error.message);
    res.status(500).json({ message: error.message || "Error scheduling pickup manifest" });
  }
};

// Generate and Stream Invoice PDF
export const downloadInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findById(id).populate("pickupAddressId");

    if (!shipment) {
      return res.status(404).json({ message: "Shipment record not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Invoice-${shipment.invoiceNumber || shipment.shipmentId}.pdf`);

    doc.pipe(res);

    // Invoice Header
    doc.fontSize(22).fillColor("#FF6A00").text("PHOENIX COMMERCE", { align: "center" }).moveDown(0.2);
    doc.fontSize(10).fillColor("#687280").text("Courier Shipping Aggregation & Logistics Intermediary", { align: "center" }).moveDown(1.5);

    doc.fontSize(14).fillColor("#0A1F44").text("TAX INVOICE / RECIPIENT BILL", { underline: true }).moveDown(0.5);

    // Invoice Meta Columns
    const startY = doc.y;
    doc.fontSize(9).fillColor("#0A1F44").text(`Invoice Number: ${shipment.invoiceNumber || "N/A"}`, 50, startY);
    doc.text(`Invoice Date: ${new Date(shipment.createdAt).toLocaleDateString()}`, 50, startY + 15);
    doc.text(`AWB / Tracking Number: ${shipment.courierTrackingNumber || "Pending"}`, 50, startY + 30);
    doc.text(`Courier Carrier: ${shipment.courierName}`, 50, startY + 45);

    doc.text(`Shipper Store: ${shipment.store}`, 320, startY);
    doc.text(`Recipient Customer: ${shipment.customer}`, 320, startY + 15);
    doc.text(`Destination Pincode: ${shipment.receiverPincode || "N/A"}`, 320, startY + 30);
    doc.text(`Recipient Contact: ${shipment.receiverMobile || "N/A"}`, 320, startY + 45);

    doc.moveDown(2);
    doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

    // Bill Particulars Table
    doc.fontSize(10).fillColor("#0A1F44").text("Billing Particulars", { bold: true }).moveDown(0.5);
    const tableY = doc.y;
    doc.fontSize(9).text("Item Description", 50, tableY, { bold: true });
    doc.text("Weight", 250, tableY, { bold: true });
    doc.text("Line Amount", 450, tableY, { align: "right", bold: true });

    doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, tableY + 15).lineTo(550, tableY + 15).stroke();

    const rowY = tableY + 25;
    doc.text(`Logistics Delivery charges (${shipment.shipmentType})`, 50, rowY);
    doc.text(`${shipment.weight} kg (Chargeable: ${shipment.chargeableWeight || shipment.weight} kg)`, 250, rowY);
    doc.text(`Rs. ${shipment.shippingCharge.toFixed(2)}`, 450, rowY, { align: "right" });

    const totalY = rowY + 30;
    doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, totalY).lineTo(550, totalY).stroke();

    // Decoupled Taxes summary
    doc.text("Base Shipping Cost:", 300, totalY + 10);
    doc.text(`Rs. ${shipment.shippingCharge.toFixed(2)}`, 450, totalY + 10, { align: "right" });

    doc.text("GST Tax Amount (18%):", 300, totalY + 25);
    doc.text(`Rs. ${shipment.gstAmount.toFixed(2)}`, 450, totalY + 25, { align: "right" });

    doc.fontSize(11).text("Net Invoice Total (Payable):", 300, totalY + 45, { bold: true });
    doc.fillColor("#FF6A00").text(`Rs. ${shipment.invoiceTotal.toFixed(2)}`, 450, totalY + 45, { align: "right", bold: true });

    doc.moveDown(4);
    doc.fontSize(8).fillColor("#687280").text("This is an auto-generated GST tax invoice. No signature is required. Thank you for shipping with Phoenix Commerce.", { align: "center" });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Error downloading PDF invoice", error: error.message });
  }
};

// Stage 1 (Upload & Dry-Run Validate) Bulk Shipments
export const validateBulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV upload file is required" });
    }

    const rows = [];
    const stream = Readable.from(req.file.buffer.toString("utf8"));
    const parser = stream.pipe(csvParser());

    for await (const row of parser) {
      rows.push(row);
    }

    const validRows = [];
    const invalidRows = [];
    let totalEstimatedCost = 0.0;

    // Fetch warehouse lists to validate Pickup Address Name mapping
    const warehouses = await PickupAddress.find({ userId: req.user._id });

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const lineNum = idx + 1;
      const {
        customer,
        receiverMobile,
        receiverAddress,
        receiverCity,
        receiverState,
        receiverCountry,
        receiverPincode,
        weight,
        length,
        width,
        height,
        productDescription,
        shipmentValue,
        pickupWarehouseName,
      } = row;

      // Checks
      const errors = [];
      if (!customer) errors.push("Missing customer name");
      if (!receiverMobile) errors.push("Missing receiver mobile number");
      if (!receiverAddress) errors.push("Missing receiver address line");
      if (!receiverCountry) errors.push("Missing receiver country code");
      if (!weight || isNaN(parseFloat(weight))) errors.push("Invalid or missing dead weight");

      const numericWeight = parseFloat(weight || 0);
      const l = parseFloat(length || 0);
      const w = parseFloat(width || 0);
      const h = parseFloat(height || 0);
      const volumetricWeight = (l * w * h) / 5000.0;
      const chargeableWeight = Math.max(numericWeight, volumetricWeight);

      // Validate pickup warehouse location mapping
      const matchedWarehouse = warehouses.find(
        (wh) => wh.addressName.toLowerCase().trim() === (pickupWarehouseName || "").toLowerCase().trim()
      );
      if (!matchedWarehouse) {
        errors.push(`Pickup warehouse "${pickupWarehouseName || 'empty'}" not found in your saved list`);
      }

      if (errors.length > 0) {
        invalidRows.push({ line: lineNum, row, errors });
      } else {
        // Run simulated rate
        const isDomestic = receiverCountry.toLowerCase() === "in" || receiverCountry.toLowerCase() === "india";
        const baseRate = isDomestic ? 300.0 + chargeableWeight * 60.0 : 1200.0 + chargeableWeight * 200.0;
        
        const marginRule = await evaluatePriorityMargin(receiverCountry, chargeableWeight);
        let shippingCharge = baseRate;
        if (marginRule.type === "Fixed") {
          shippingCharge = baseRate + marginRule.value;
        } else {
          shippingCharge = baseRate * (1 + marginRule.value / 100.0);
        }
        const gstAmount = shippingCharge * 0.18;
        const invoiceTotal = shippingCharge + gstAmount;

        totalEstimatedCost += invoiceTotal;

        validRows.push({
          line: lineNum,
          customer,
          receiverMobile,
          receiverAddress,
          receiverCity,
          receiverState,
          receiverCountry,
          receiverPincode,
          weight: numericWeight,
          length: l,
          width: w,
          height: h,
          volumetricWeight,
          chargeableWeight,
          productDescription: productDescription || "Bulk consignment item",
          shipmentValue: parseFloat(shipmentValue || 0.0),
          pickupAddressId: matchedWarehouse._id,
          pickupWarehouseName: matchedWarehouse.addressName,
          shippingCharge,
          gstAmount,
          invoiceTotal,
        });
      }
    }

    // Verify wallet balance
    const wallet = await Wallet.findOne({ user: req.user._id });
    const hasSufficientFunds = wallet ? wallet.availableBalance >= totalEstimatedCost : false;

    res.status(200).json({
      message: "Bulk upload validated successfully.",
      summary: {
        totalRows: rows.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2)),
        walletAvailable: wallet ? wallet.availableBalance : 0.0,
        hasSufficientFunds,
      },
      validRows,
      invalidRows,
    });
  } catch (error) {
    res.status(500).json({ message: "Error validating bulk upload", error: error.message });
  }
};

// Stage 2: Confirm & Create Bulk Shipments
export const confirmBulkUpload = async (req, res) => {
  try {
    const { validRows } = req.body;
    if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
      return res.status(400).json({ message: "A validated rows list is required to confirm bookings." });
    }

    const firstRow = validRows[0];
    const { country: destCountry, currency: destCurrency } = getCurrencyForCountry(firstRow.receiverCountry);

    let wallet = await Wallet.findOne({ user: req.user._id, currency: destCurrency });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        storeName: req.user.companyName || `${req.user.name}'s Store`,
        country: destCountry,
        currency: destCurrency,
        balance: 0.0,
        totalBalance: 0.0,
        availableBalance: 0.0,
        holdBalance: 0.0,
      });
    }

    // Convert totalCost to target currency
    const totalCostINR = validRows.reduce((sum, r) => sum + r.invoiceTotal, 0);
    const totalCost = convertFromINR(totalCostINR, destCurrency);

    if (wallet.availableBalance < totalCost) {
      return res.status(400).json({
        message: `Insufficient wallet balance in ${destCurrency}. Total batch cost is ${destCurrency} ${totalCost.toFixed(2)}, available balance is ${destCurrency} ${wallet.availableBalance.toFixed(2)}.`,
      });
    }

    // 1. PLACE HOLD on total batch amount
    const openingBalance = wallet.availableBalance;
    wallet.availableBalance = openingBalance - totalCost;
    wallet.holdBalance = wallet.holdBalance + totalCost;
    wallet.balance = wallet.availableBalance;
    await wallet.save();

    const batchId = `BTCH-${Date.now().toString().slice(-6)}`;
    const holdTransaction = await WalletTransaction.create({
      walletId: wallet._id,
      userId: req.user._id,
      transactionType: "Hold",
      amount: -totalCost,
      currency: destCurrency,
      openingBalance,
      closingBalance: wallet.availableBalance,
      referenceId: batchId,
      remarks: `Reserved funds for Bulk Batch ${batchId} (${validRows.length} shipments)`,
      description: `Reserved funds for Bulk Batch ${batchId} (${validRows.length} shipments)`,
      status: "HOLD",
    });

    const successBookings = [];
    const failedBookings = [];
    let processedCost = 0.0;

    // 2. Loop and book shipments
    for (const row of validRows) {
      const shipmentId = `PHX-SH-${Math.floor(100000 + Math.random() * 900000)}`;

      // Create Draft Shipment
      const shipment = await Shipment.create({
        shipmentId,
        user: req.user._id,
        store: wallet.storeName,
        customer: row.customer,
        courierName: "Aramex",
        courier: "Aramex",
        weight: row.weight,
        length: row.length,
        width: row.width,
        height: row.height,
        volumetricWeight: row.volumetricWeight,
        chargeableWeight: row.chargeableWeight,
        shipmentType: "Parcel",
        productDescription: row.productDescription,
        shipmentValue: row.shipmentValue,
        from: `Pickup Warehouse: ${row.pickupWarehouseName}`,
        to: row.receiverAddress,
        receiverName: row.customer,
        receiverMobile: row.receiverMobile,
        receiverAddress: row.receiverAddress,
        receiverCity: row.receiverCity,
        receiverState: row.receiverState,
        receiverCountry: row.receiverCountry,
        receiverPincode: row.receiverPincode,
        pickupAddressId: row.pickupAddressId,
        shippingCharge: row.shippingCharge,
        gstAmount: row.gstAmount,
        invoiceTotal: row.invoiceTotal,
        charge: row.invoiceTotal,
        status: "Draft",
        statusHistory: [{ status: "Draft", time: new Date() }],
      });

      const aramexPayload = {
        sender: {
          id: req.user._id,
          companyName: wallet.storeName,
          contactPerson: req.user.name,
          mobile: req.user.mobileNumber || "9999999999",
          email: req.user.email,
          address: row.receiverAddress, // generic fallback
          city: row.receiverCity || "Delhi",
          state: row.receiverState || "Delhi",
          country: "IN",
          pincode: "110001",
        },
        receiver: {
          name: row.customer,
          mobile: row.receiverMobile,
          address: row.receiverAddress,
          city: row.receiverCity,
          state: row.receiverState,
          country: row.receiverCountry,
          pincode: row.receiverPincode,
        },
        parcel: {
          referenceId: shipmentId,
          weight: row.weight,
          length: row.length,
          width: row.width,
          height: row.height,
          productDescription: row.productDescription,
          shipmentValue: row.shipmentValue,
          type: "Parcel",
        },
      };

      const bookingResult = await createAramexShipment(aramexPayload);

      if (bookingResult.success) {
        shipment.courierShipmentId = bookingResult.courierShipmentId;
        shipment.courierTrackingNumber = bookingResult.courierTrackingNumber;
        shipment.courierStatus = "Booked";
        shipment.status = "Booked";
        shipment.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        shipment.statusHistory.push({ status: "Booked", time: new Date() });

        // Save label locally
        const labelFilename = `label-${bookingResult.courierTrackingNumber}.pdf`;
        const uploadDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(path.join(uploadDir, labelFilename), Buffer.from(bookingResult.labelBufferBase64, "base64"));
        shipment.labelPdfPath = `/uploads/${labelFilename}`;

        await shipment.save();

        // Create Initial Tracking timeline
        await TrackingHistory.create({
          shipmentId: shipment._id,
          status: "Booked",
          location: row.receiverCity || "Hub",
          description: "Bulk uploaded consignment registered. Ready for pickup scheduler.",
          eventTime: new Date(),
        });

        const targetCost = convertFromINR(row.invoiceTotal, destCurrency);
        processedCost += targetCost;
        successBookings.push(shipment);
      } else {
        await Shipment.findByIdAndDelete(shipment._id);
        failedBookings.push({ row, error: bookingResult.error || "Aramex API error" });
      }
    }

    // 3. FINAL DEBIT COMMIT
    const remainingHoldRelease = totalCost - processedCost;

    wallet.holdBalance = wallet.holdBalance - totalCost;
    wallet.totalBalance = wallet.totalBalance - processedCost;
    wallet.availableBalance = wallet.availableBalance + remainingHoldRelease; // restore any failed booking holds
    wallet.balance = wallet.availableBalance;
    await wallet.save();

    if (processedCost > 0) {
      holdTransaction.transactionType = "Debit";
      holdTransaction.status = "Completed";
      holdTransaction.remarks = `Bulk Debit: Completed ${successBookings.length} shipments. Debited ${destCurrency} ${processedCost.toFixed(2)}`;
      holdTransaction.amount = -processedCost;
      await holdTransaction.save();
    } else {
      holdTransaction.status = "Released";
      holdTransaction.remarks = `Bulk Hold released: All bookings failed.`;
      await holdTransaction.save();
    }

    // Write Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Merchant Completed Bulk Shipments Booking",
      module: "Shipments",
      oldValue: "HOLD",
      newValue: `Booked: ${successBookings.length}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    res.status(200).json({
      message: `Batch complete: ${successBookings.length} shipments booked, ${failedBookings.length} failed. Total debited ${destCurrency} ${processedCost.toFixed(2)}.`,
      successBookings,
      failedBookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Error confirming bulk upload batch", error: error.message });
  }
};

// Update shipment status (Admin)
export const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (status === "Out for Delivery") status = "Out For Delivery";

    const allowed = [
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
    ];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: "Valid status value is required" });
    }

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: "Shipment record not found" });
    }

    const prevStatus = shipment.status;
    shipment.status = status;
    shipment.statusHistory.push({ status, time: new Date() });

    if (req.body.pickupDate) {
      shipment.pickupDate = new Date(req.body.pickupDate);
    }
    if (req.body.pickupManifestId) {
      shipment.pickupManifestId = req.body.pickupManifestId;
    }

    if (status === "Delivered") {
      shipment.dateDelivered = new Date();
      shipment.deliveryTime = "3 Days (Fast)";
      shipment.podRef = `POD-${Math.floor(10000 + Math.random() * 90000)}`;
      shipment.feedback = "⭐⭐⭐⭐⭐ (5/5)";
    } else if (status === "Cancelled") {
      shipment.dateCancelled = new Date();
    }

    await shipment.save();

    // Create Tracking History step
    await TrackingHistory.create({
      shipmentId: shipment._id,
      status,
      location: "Transit Hub",
      description: `Logistical state updated to ${status} by admin operations.`,
      eventTime: new Date(),
    });

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Admin Updated Shipment Status",
      module: "Shipments",
      oldValue: prevStatus,
      newValue: status,
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create In-App Notification
    await Notification.create({
      userId: shipment.user,
      title: "Shipment Status Update",
      message: `Your shipment AWB ${shipment.courierTrackingNumber} is now: ${status}`,
      type: status === "Delivered" ? "Delivered" : "Shipment Booked",
    });

    res.status(200).json({ message: `Success: Shipment status updated to ${status}`, shipment });
  } catch (error) {
    res.status(500).json({ message: "Error updating shipment status", error: error.message });
  }
};

// Process shipment cancellation and refund
export const refundShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: "Shipment record not found" });
    }

    if (shipment.status === "Cancelled") {
      return res.status(400).json({ message: "This shipment is already cancelled" });
    }

    const wallet = await Wallet.findOne({ user: shipment.user });
    if (!wallet) {
      return res.status(404).json({ message: "Merchant wallet profile not found" });
    }

    // Process refund
    const openingBalance = wallet.availableBalance;
    wallet.availableBalance = wallet.availableBalance + shipment.invoiceTotal;
    wallet.totalBalance = wallet.totalBalance + shipment.invoiceTotal;
    wallet.balance = wallet.availableBalance;
    await wallet.save();

    // Create refund transaction
    const transaction = await WalletTransaction.create({
      userId: shipment.user,
      transactionType: "Refund",
      amount: shipment.invoiceTotal,
      openingBalance,
      closingBalance: wallet.availableBalance,
      referenceId: shipment.courierTrackingNumber || shipment.shipmentId,
      remarks: `Refund: Cancelled shipment ${shipment.shipmentId}`,
      status: "Completed",
    });

    shipment.status = "Cancelled";
    shipment.statusHistory.push({ status: "Cancelled", time: new Date() });
    shipment.dateCancelled = new Date();
    await shipment.save();

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Shipment Cancelled and Refunded",
      module: "Shipments",
      oldValue: "Booked",
      newValue: "Cancelled",
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create Notification
    await Notification.create({
      userId: shipment.user,
      title: "Shipment Refunded",
      message: `Your cancelled shipment AWB ${shipment.courierTrackingNumber} has been refunded: ₹${shipment.invoiceTotal.toFixed(2)} credited back.`,
      type: "Claim Updated",
    });

    res.status(200).json({ message: `Success: Refunded ₹${shipment.invoiceTotal.toFixed(2)} to wallet.`, shipment });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling shipment", error: error.message });
  }
};

// List Weight Discrepancies
export const getDiscrepancies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const skip = (page - 1) * limit;

    let query = {};

    if (status === "Pending") {
      query.discrepancyStatus = "Pending";
    } else if (status === "Resolved") {
      query.discrepancyStatus = { $ne: "Pending" };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { shipmentId: searchRegex },
        { store: searchRegex },
        { discrepancyDetails: searchRegex }
      ];
    }

    const totalItems = await WeightDiscrepancy.countDocuments(query);
    const discrepancies = await WeightDiscrepancy.find(query)
        .populate("shipmentId")
        .populate("userId", "name email companyName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      discrepancies,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error loading weight discrepancies",
      error: error.message
    });
  }
};

// Resolve Weight Discrepancy (Admin review approve/reject)
export const resolveDiscrepancy = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, remarks } = req.body; // "approve" or "reject"

    const dispute = await WeightDiscrepancy.findById(id);
    if (!dispute || dispute.status !== "Pending") {
      return res.status(404).json({ message: "Pending weight discrepancy not found" });
    }

    const wallet = await Wallet.findOne({ user: dispute.userId });
    if (!wallet) {
      return res.status(404).json({ message: "Merchant wallet not found" });
    }

    if (resolution === "reject") {
      dispute.status = "Rejected";
      dispute.adminRemarks = remarks || "Rejected by admin review.";
      await dispute.save();

      // Create Audit Log
      await AuditLog.create({
        userId: req.user._id,
        action: "Admin Rejected Weight Discrepancy Charge",
        module: "Discrepancy",
        oldValue: "Pending",
        newValue: "Rejected",
        ipAddress: req.ip || "127.0.0.1",
      });

      return res.status(200).json({ message: "Discrepancy charge successfully rejected and waived.", dispute });
    }

    // Approve: Deduct additional charges
    const openingBalance = wallet.availableBalance;
    const charge = dispute.additionalCharge;

    wallet.availableBalance = wallet.availableBalance - charge;
    wallet.totalBalance = wallet.totalBalance - charge;
    wallet.balance = wallet.availableBalance;
    await wallet.save();

    // Create Penalty Transaction
    await WalletTransaction.create({
      userId: dispute.userId,
      transactionType: "Penalty",
      amount: -charge,
      openingBalance,
      closingBalance: wallet.availableBalance,
      referenceId: dispute.shipmentId.toString(),
      remarks: `Weight discrepancy audit penalty charge. Delta: ${dispute.difference} kg`,
      status: "Completed",
    });

    dispute.status = "Deducted";
    dispute.adminRemarks = remarks || "Approved and auto debited from wallet.";
    await dispute.save();

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Admin Approved Weight Discrepancy Wallet Deduction",
      module: "Discrepancy",
      oldValue: "Pending",
      newValue: "Deducted",
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create In-App Notification
    await Notification.create({
      userId: dispute.userId,
      title: "Discrepancy Debit Penalty",
      message: `Discrepancy Approved. Wallet debited ₹${charge.toFixed(2)} for weight delta of ${dispute.difference} kg.`,
      type: "Claim Updated",
    });

    res.status(200).json({ message: `Success: Approved discrepancy. Debited ₹${charge} from seller wallet.`, dispute });
  } catch (error) {
    res.status(500).json({ message: "Error resolving discrepancy", error: error.message });
  }
};

// Retrieve Admin dashboard metrics
export const getAdminMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalPendingUsers = await User.countDocuments({ status: "Pending" });
    const totalShipments = await Shipment.countDocuments({});
    const totalTransactions = await WalletTransaction.countDocuments({ status: "Completed" });
    const totalDiscrepancies = await WeightDiscrepancy.countDocuments({ status: "Pending" });

    // Aggregate total platform revenues (credits from recharges)
    const rechargeAggr = await WalletTransaction.aggregate([
      { $match: { transactionType: "Recharge", status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const revenue = rechargeAggr[0] ? rechargeAggr[0].total : 0.0;

    const totalBlockedUsers = await User.countDocuments({ status: "Blocked" });
    const totalPendingKYC = await KYC.countDocuments({ status: { $in: ["Pending", "Under Review", "Reupload Required"] } });

    res.status(200).json({
      revenue,
      users: totalUsers,
      kycQueue: totalPendingUsers,
      shipmentsCount: totalShipments,
      transactionsCount: totalTransactions,
      discrepanciesCount: totalDiscrepancies,
      blockedUsersCount: totalBlockedUsers,
      pendingKYCCount: totalPendingKYC,
    });
  } catch (err) {
    res.status(500).json({ message: "Error getting statistics metrics", error: err.message });
  }
};

// cancel shipment
export const cancelShipment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find Shipment
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found." });
    }

    // Security Check: Only the owner can cancel it
    if (shipment.user.toString() !== req.user._id.toString() && req.user.role === "Seller") {
      return res.status(403).json({ message: "Unauthorized to cancel this shipment." });
    }

    // 2. Status Validation (Hard-Lock)
    const allowedStatuses = ["Draft", "Booked", "Pickup Scheduled"];
    if (!allowedStatuses.includes(shipment.status)) {
      return res.status(400).json({
        message: `Cannot cancel shipment at status: ${shipment.status}. Once picked up, please contact support for an RTO.`
      });
    }

    const refundAmount = shipment.invoiceTotal;

    // 3. Process Seller Wallet Refund
    const sellerWallet = await Wallet.findOne({ user: shipment.user, currency: "INR" });
    if (sellerWallet) {
      const openingBalance = sellerWallet.availableBalance;
      sellerWallet.availableBalance += refundAmount;
      sellerWallet.totalBalance += refundAmount;
      sellerWallet.balance = sellerWallet.availableBalance;
      await sellerWallet.save();

      await WalletTransaction.create({
        walletId: sellerWallet._id,
        userId: shipment.user,
        transactionType: "Refund",
        amount: refundAmount,
        currency: "INR",
        openingBalance,
        closingBalance: sellerWallet.availableBalance,
        referenceId: `REF-${shipment.shipmentId}`,
        remarks: `Cancellation Refund for AWB: ${shipment.courierTrackingNumber || shipment.shipmentId}`,
        shipmentId: shipment.shipmentId,
        status: "Completed",
      });
    }

    // 4. Reverse Admin Wallet Ledger
    const adminWallet = await AdminWallet.findOne({ currency: "INR" });
    if (adminWallet) {
      adminWallet.totalGrossRevenue -= refundAmount;
      adminWallet.aramexPayables -= shipment.aramexBaseCost;
      adminWallet.gstPayables -= shipment.gstAmount;
      adminWallet.netProfit -= shipment.marginAmount;
      await adminWallet.save();
    }

    // 5. Update Shipment Status
    shipment.status = "Cancelled";
    shipment.courierStatus = "Cancelled";
    shipment.dateCancelled = new Date();
    shipment.statusHistory.push({ status: "Cancelled", time: new Date() });
    await shipment.save();

    // 6. Logs & Tracking
    await TrackingHistory.create({
      shipmentId: shipment._id,
      status: "Cancelled",
      location: "System",
      description: "Shipment cancelled by merchant. Wallet refunded.",
      eventTime: new Date(),
    });

    await AuditLog.create({
      userId: req.user._id,
      action: "Merchant Cancelled Shipment",
      module: "Shipments",
      oldValue: "Booked/Scheduled",
      newValue: "Cancelled",
      ipAddress: req.ip || "127.0.0.1",
    });

    res.status(200).json({
      success: true,
      message: `Shipment cancelled successfully. ₹${refundAmount.toFixed(2)} refunded to your wallet.`
    });

  } catch (error) {
    console.error("Cancellation Error:", error.message);
    res.status(500).json({ message: "Failed to cancel shipment.", error: error.message });
  }
};
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import csvParser from "csv-parser";
import { Readable } from "stream";

import Shipment from "../models/Shipment.js";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import PickupAddress from "../models/PickupAddress.js";
import WeightDiscrepancy from "../models/WeightDiscrepancy.js";
import TrackingHistory from "../models/TrackingHistory.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import MarginRule from "../models/MarginRule.js";

import { createAramexShipment, createAramexPickup } from "../services/aramexService.js";
import { sendShipmentBookedEmail } from "../services/emailService.js";

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
  try {
    const {
      customer,
      receiverName,
      receiverMobile,
      receiverAddress,
      receiverCity,
      receiverState,
      receiverCountry,
      receiverPincode,
      pickupAddressId,
      weight,
      length,
      width,
      height,
      shipmentType,
      productDescription,
      shipmentValue,
    } = req.body;

    if (!customer || !receiverMobile || !receiverAddress || !receiverCountry || !weight || !pickupAddressId) {
      return res.status(400).json({ message: "Recipient details, weight, and pickup warehouse are required." });
    }

    const numericWeight = parseFloat(weight);
    const l = parseFloat(length || 0);
    const w = parseFloat(width || 0);
    const h = parseFloat(height || 0);
    const volumetricWeight = (l * w * h) / 5000.0;
    const chargeableWeight = Math.max(numericWeight, volumetricWeight);

    // 1. Calculate shipping costs & decoupled GST (18%)
    // Simulated base rate: Delhi to receiverCountry (e.g. Domestic ₹300, International ₹1200)
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

    // 2. Fetch merchant wallet & check availableBalance
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: "Merchant wallet profile not found" });
    }

    if (wallet.availableBalance < invoiceTotal) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Total cost is ₹${invoiceTotal.toFixed(2)} (Charge: ₹${shippingCharge.toFixed(2)} + GST: ₹${gstAmount.toFixed(2)}), available balance is ₹${wallet.availableBalance.toFixed(2)}. Please recharge first.`,
      });
    }

    // 3. STEP 2: CREATE HOLD
    const openingBalance = wallet.availableBalance;
    wallet.availableBalance = openingBalance - invoiceTotal;
    wallet.holdBalance = wallet.holdBalance + invoiceTotal;
    wallet.balance = wallet.availableBalance; // legacy sync
    await wallet.save();

    const shipmentId = `PHX-SH-${Date.now().toString().slice(-6)}`;
    const refId = `HOLD-${shipmentId}`;

    const holdTransaction = await WalletTransaction.create({
      userId: req.user._id,
      transactionType: "Hold",
      amount: -invoiceTotal,
      openingBalance,
      closingBalance: wallet.availableBalance,
      referenceId: refId,
      remarks: `Reserved funds for Shipment ${shipmentId}`,
      status: "HOLD",
    });

    // Create Draft Shipment
    const shipment = await Shipment.create({
      shipmentId,
      user: req.user._id,
      store: wallet.storeName,
      customer: customer || receiverName,
      courierName: "Aramex",
      courier: "Aramex",
      weight: numericWeight,
      length: l,
      width: w,
      height: h,
      volumetricWeight,
      chargeableWeight,
      shipmentType: shipmentType || "Parcel",
      productDescription: productDescription || "E-commerce Goods",
      shipmentValue: parseFloat(shipmentValue || 0.0),
      from: "Warehouse Location",
      to: receiverAddress,
      receiverName: receiverName || customer,
      receiverMobile,
      receiverAddress,
      receiverCity,
      receiverState,
      receiverCountry,
      receiverPincode,
      pickupAddressId,
      shippingCharge,
      gstAmount,
      invoiceTotal,
      charge: invoiceTotal, // legacy
      status: "Draft",
      statusHistory: [{ status: "Draft", time: new Date() }],
    });

    // 4. STEP 3: ARX BOOKING
    const pickupWarehouse = await PickupAddress.findById(pickupAddressId);
    const aramexPayload = {
      sender: {
        id: req.user._id,
        companyName: wallet.storeName,
        contactPerson: req.user.name,
        mobile: req.user.mobileNumber || pickupWarehouse?.mobile || "9999999999",
        email: req.user.email,
        address: pickupWarehouse?.address || "Delhi Hub Address",
        city: pickupWarehouse?.city || "Delhi",
        state: pickupWarehouse?.state || "Delhi",
        country: pickupWarehouse?.country || "IN",
        pincode: pickupWarehouse?.pincode || "110001",
      },
      receiver: {
        name: receiverName || customer,
        mobile: receiverMobile,
        address: receiverAddress,
        city: receiverCity,
        state: receiverState,
        country: receiverCountry,
        pincode: receiverPincode,
      },
      parcel: {
        referenceId: shipmentId,
        weight: numericWeight,
        length: l,
        width: w,
        height: h,
        productDescription,
        shipmentValue,
        type: shipmentType,
      },
    };

    const bookingResult = await createAramexShipment(aramexPayload);

    if (bookingResult.success) {
      // Finalize HOLD -> DEBIT
      wallet.holdBalance = wallet.holdBalance - invoiceTotal;
      wallet.totalBalance = wallet.totalBalance - invoiceTotal;
      await wallet.save();

      holdTransaction.transactionType = "Debit";
      holdTransaction.status = "Completed";
      holdTransaction.remarks = `Shipping Debit (Aramex AWB: ${bookingResult.courierTrackingNumber})`;
      holdTransaction.referenceId = bookingResult.courierTrackingNumber;
      await holdTransaction.save();

      // Update shipment
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
        location: pickupWarehouse?.city || "Origin City",
        description: "Voucher details generated on aggregator nodes. Pending pickup request.",
        eventTime: new Date(),
      });

      // Write Audit Log
      await AuditLog.create({
        userId: req.user._id,
        action: "Merchant Booked Shipment",
        module: "Shipments",
        oldValue: "Draft",
        newValue: "Booked",
        ipAddress: req.ip || "127.0.0.1",
      });

      // Send Alert Notification
      await Notification.create({
        userId: req.user._id,
        title: "Shipment Booked",
        message: `Shipment ${shipmentId} successfully booked. AWB: ${bookingResult.courierTrackingNumber}`,
        type: "Shipment Booked",
      });

      // Dispatch Email
      await sendShipmentBookedEmail(req.user.email, bookingResult.courierTrackingNumber, customer, receiverAddress);

      res.status(201).json({
        message: `Success: Shipment ${shipmentId} booked! Wallet debited ₹${invoiceTotal.toFixed(2)}.`,
        shipment,
        newBalance: wallet.availableBalance,
      });
    } else {
      // STEP 4: RELEASE HOLD
      wallet.availableBalance = wallet.availableBalance + invoiceTotal;
      wallet.holdBalance = wallet.holdBalance - invoiceTotal;
      wallet.balance = wallet.availableBalance;
      await wallet.save();

      holdTransaction.status = "Released";
      holdTransaction.remarks = `Hold released: Courier booking failed (${bookingResult.error || "API error"})`;
      await holdTransaction.save();

      // Delete Draft Shipment
      await Shipment.findByIdAndDelete(shipment._id);

      res.status(400).json({
        message: `Courier booking failed: ${bookingResult.error || "Aramex API issue"}. Reserved funds have been restored.`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error booking shipment", error: error.message });
  }
};

// List all shipments
export const getAllShipments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Seller") {
      query.user = req.user._id;
    }
    const shipments = await Shipment.find(query).populate("pickupAddressId").sort({ createdAt: -1 });
    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving shipments list", error: error.message });
  }
};

// List delivered shipments
export const getDeliveredShipments = async (req, res) => {
  try {
    let query = { status: "Delivered" };
    if (req.user.role === "Seller") {
      query.user = req.user._id;
    }
    const shipments = await Shipment.find(query).sort({ dateDelivered: -1 });
    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving delivered shipments register", error: error.message });
  }
};

// List cancelled shipments
export const getCancelledShipments = async (req, res) => {
  try {
    let query = { status: "Cancelled" };
    if (req.user.role === "Seller") {
      query.user = req.user._id;
    }
    const shipments = await Shipment.find(query).sort({ dateCancelled: -1 });
    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving RTO shipments archive", error: error.message });
  }
};

// Schedule Pickup Manifest
export const schedulePickup = async (req, res) => {
  try {
    const { shipmentIds, pickupDate, pickupAddressId } = req.body;

    if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0 || !pickupAddressId) {
      return res.status(400).json({ message: "Shipment IDs list and pickup address are required." });
    }

    const warehouse = await PickupAddress.findById(pickupAddressId);
    if (!warehouse) {
      return res.status(404).json({ message: "Pickup Address location not found." });
    }

    // Call Aramex Service to schedule pickup
    const pickupResult = await createAramexPickup({
      pickupDate: pickupDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      address: warehouse,
      contact: {
        name: req.user.name,
        mobile: req.user.mobileNumber || warehouse.mobile,
        email: req.user.email,
        reference: shipmentIds[0],
      },
    });

    if (pickupResult.success) {
      // Update shipments status
      await Shipment.updateMany(
        { _id: { $in: shipmentIds } },
        {
          $set: {
            status: "Pickup Scheduled",
            pickupManifestId: pickupResult.manifestCode,
            pickupDate: pickupDate || new Date(),
          },
          $push: {
            statusHistory: { status: "Pickup Scheduled", time: new Date() },
          },
        }
      );

      // Create tracking history entries
      for (const shId of shipmentIds) {
        await TrackingHistory.create({
          shipmentId: shId,
          status: "Pickup Scheduled",
          location: warehouse.city,
          description: `Pickup Runner assigned. Manifest code: ${pickupResult.manifestCode}`,
          eventTime: new Date(),
        });
      }

      // Write Audit Log
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
    } else {
      res.status(400).json({ message: `Courier failed pickup scheduling: ${pickupResult.error || "API error"}` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error scheduling pickup manifest", error: error.message });
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
    doc.text(`₹${shipment.shippingCharge.toFixed(2)}`, 450, rowY, { align: "right" });

    const totalY = rowY + 30;
    doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, totalY).lineTo(550, totalY).stroke();

    // Decoupled Taxes summary
    doc.text("Base Shipping Cost:", 300, totalY + 10);
    doc.text(`₹${shipment.shippingCharge.toFixed(2)}`, 450, totalY + 10, { align: "right" });

    doc.text("GST Tax Amount (18%):", 300, totalY + 25);
    doc.text(`₹${shipment.gstAmount.toFixed(2)}`, 450, totalY + 25, { align: "right" });

    doc.fontSize(11).text("Net Invoice Total (Payable):", 300, totalY + 45, { bold: true });
    doc.fillColor("#FF6A00").text(`₹${shipment.invoiceTotal.toFixed(2)}`, 450, totalY + 45, { align: "right", bold: true });

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

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: "Merchant wallet profile not found" });
    }

    const totalCost = validRows.reduce((sum, r) => sum + r.invoiceTotal, 0);
    if (wallet.availableBalance < totalCost) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Total batch cost is ₹${totalCost.toFixed(2)}, available balance is ₹${wallet.availableBalance.toFixed(2)}.`,
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
      userId: req.user._id,
      transactionType: "Hold",
      amount: -totalCost,
      openingBalance,
      closingBalance: wallet.availableBalance,
      referenceId: batchId,
      remarks: `Reserved funds for Bulk Batch ${batchId} (${validRows.length} shipments)`,
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

        processedCost += row.invoiceTotal;
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
      holdTransaction.remarks = `Bulk Debit: Completed ${successBookings.length} shipments. Debited ₹${processedCost.toFixed(2)}`;
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
      message: `Batch complete: ${successBookings.length} shipments booked, ${failedBookings.length} failed. Total debited ₹${processedCost.toFixed(2)}.`,
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
    const { status } = req.body;

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
    const list = await WeightDiscrepancy.find({}).populate("shipmentId").populate("userId", "name email companyName").sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Error loading weight discrepancies", error: error.message });
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

    res.status(200).json({
      revenue,
      users: totalUsers,
      kycQueue: totalPendingUsers,
      shipmentsCount: totalShipments,
      transactionsCount: totalTransactions,
      discrepanciesCount: totalDiscrepancies,
    });
  } catch (err) {
    res.status(500).json({ message: "Error getting statistics metrics", error: err.message });
  }
};

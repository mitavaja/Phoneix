import mongoose from "mongoose";
import SupportTicket from "../models/SupportTicket.js";
import Claim from "../models/Claim.js";
import Shipment from "../models/Shipment.js";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";

// ==================== SUPPORT TICKETS ====================

// Create Support Ticket
export const createTicket = async (req, res) => {
  try {
    const { subject, type, description } = req.body;

    if (!subject || !type || !description) {
      return res.status(400).json({ message: "Subject, type, and description are required." });
    }

    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticket = await SupportTicket.create({
      ticketId,
      userId: req.user._id,
      subject,
      type,
      description,
      messages: [
        {
          sender: "Seller",
          content: description,
          time: new Date(),
        },
      ],
    });

    res.status(201).json({ message: "Support ticket opened successfully.", ticket });
  } catch (error) {
    res.status(500).json({ message: "Error opening ticket", error: error.message });
  }
};

// Get Seller tickets
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error loading tickets", error: error.message });
  }
};

// Get All platform tickets (Operations CRM/Admin)
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({}).populate("userId", "name email companyName").sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error loading all tickets roster", error: error.message });
  }
};

// Reply to support ticket
export const replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    // Determine sender label
    const isOps = ["Admin", "Moderator", "Operations"].includes(req.user.role);
    const sender = isOps ? "Support" : "Seller";

    ticket.messages.push({
      sender,
      content,
      time: new Date(),
    });

    if (isOps) {
      ticket.status = "In Progress";
    }

    await ticket.save();

    // Create Notification if support replied
    if (isOps) {
      await Notification.create({
        userId: ticket.userId,
        title: "Ticket Update Reply Received",
        message: `Support agent replied to ticket: "${ticket.subject}"`,
        type: "Ticket Updated",
      });
    }

    res.status(200).json({ message: "Reply added successfully.", ticket });
  } catch (error) {
    res.status(500).json({ message: "Error sending reply", error: error.message });
  }
};

// Update Ticket Status (Admin/Operations)
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    const prev = ticket.status;
    ticket.status = status;
    await ticket.save();

    // In-App Notification
    await Notification.create({
      userId: ticket.userId,
      title: "Support Ticket Resolved",
      message: `Your ticket "${ticket.subject}" has been marked: ${status}`,
      type: "Ticket Updated",
    });

    res.status(200).json({ message: `Success: Ticket status set to ${status}`, ticket });
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket status", error: error.message });
  }
};

// ==================== INSURANCE CLAIMS ====================

// Submit shipment Claim (Seller)
export const createClaim = async (req, res) => {
  try {
    const { shipmentId, claimType, description, claimAmount, attachment } = req.body;

    if (!shipmentId || !claimType || !claimAmount) {
      return res.status(400).json({ message: "Shipment target, claim type, and claim amount are required." });
    }

    const queryConditions = [{ shipmentId }, { courierTrackingNumber: shipmentId }];
    if (mongoose.Types.ObjectId.isValid(shipmentId)) {
      queryConditions.push({ _id: shipmentId });
    }

    const shipment = await Shipment.findOne({
      $or: queryConditions
    });

    if (!shipment) {
      return res.status(404).json({ message: "Reference Shipment record not found." });
    }

    const claim = await Claim.create({
      shipmentId: shipment._id,
      userId: req.user._id,
      claimType,
      description: description || "Consignment disputed claim description.",
      attachment: attachment || "",
      claimAmount: parseFloat(claimAmount),
      status: "Pending",
    });

    // Write Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Merchant Submitted Shipment Claim",
      module: "Claims",
      oldValue: "None",
      newValue: "Pending",
      ipAddress: req.ip || "127.0.0.1",
    });

    res.status(201).json({ message: "Shipment dispute claim submitted successfully.", claim });
  } catch (error) {
    res.status(500).json({ message: "Error submitting claim", error: error.message });
  }
};

// Get Seller Claims list
export const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.user._id }).populate("shipmentId").sort({ createdAt: -1 });
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: "Error loading claims", error: error.message });
  }
};

// List All platform claims (Admin/Operations)
export const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find({}).populate("userId", "name email companyName").populate("shipmentId").sort({ createdAt: -1 });
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: "Error loading platform claims", error: error.message });
  }
};

// Process Claim Status (Admin/Operations)
export const resolveClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body; // "Investigation", "Approved", "Rejected", "Paid"

    const claim = await Claim.findById(id).populate("shipmentId");
    if (!claim) {
      return res.status(404).json({ message: "Claim record not found." });
    }

    const previousStatus = claim.status;
    claim.status = status;
    claim.adminRemarks = adminRemarks || "";
    await claim.save();

    // Trigger wallet payout if Paid
    if (status === "Paid" && previousStatus !== "Paid") {
      const wallet = await Wallet.findOne({ user: claim.userId });
      if (wallet) {
        const openingBalance = wallet.availableBalance;
        const payout = claim.claimAmount;

        wallet.availableBalance = wallet.availableBalance + payout;
        wallet.totalBalance = wallet.totalBalance + payout;
        wallet.balance = wallet.availableBalance;
        await wallet.save();

        // Create transaction entry
        await WalletTransaction.create({
          userId: claim.userId,
          transactionType: "Refund",
          amount: payout,
          openingBalance,
          closingBalance: wallet.availableBalance,
          referenceId: claim.shipmentId.courierTrackingNumber || claim.shipmentId._id.toString(),
          remarks: `Claim Payout approved for shipment ${claim.shipmentId.shipmentId || claim.shipmentId._id}`,
          status: "Completed",
        });

        // Notification
        await Notification.create({
          userId: claim.userId,
          title: "Claim Reimbursement Disbursed",
          message: `Your insurance claim for ₹${payout.toFixed(2)} has been credited to your store wallet available balance.`,
          type: "Claim Updated",
        });
      }
    }

    // Write Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: `Admin Resolved Claim: ${status}`,
      module: "Claims",
      oldValue: previousStatus,
      newValue: status,
      ipAddress: req.ip || "127.0.0.1",
    });

    // Send Alert Notification
    if (status !== "Paid") {
      await Notification.create({
        userId: claim.userId,
        title: "Claim Status Update",
        message: `Your shipment claim status was set to: ${status}. Admin notes: ${adminRemarks || 'None'}`,
        type: "Claim Updated",
      });
    }

    res.status(200).json({ message: `Success: Claim status set to ${status}`, claim });
  } catch (error) {
    res.status(500).json({ message: "Error updating claim status", error: error.message });
  }
};

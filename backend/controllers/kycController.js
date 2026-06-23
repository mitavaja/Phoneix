import KYC from "../models/KYC.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";
import { sendKYCApprovedEmail, sendKYCReuploadEmail } from "../services/emailService.js";

// Submit KYC (Merchant)
export const submitKYC = async (req, res) => {
  try {
    const { store, owner, taxId, document } = req.body;

    if (!store || !owner || !taxId) {
      return res.status(400).json({ message: "Store name, owner name, and tax ID are required" });
    }

    // Check if user already has a KYC record
    let kycRecord = await KYC.findOne({ user: req.user._id });
    if (kycRecord) {
      // Update existing record and set status back to Pending
      kycRecord.store = store;
      kycRecord.owner = owner;
      kycRecord.taxId = taxId;
      kycRecord.status = "Pending";
      await kycRecord.save();
    } else {
      kycRecord = await KYC.create({
        kycId: `KYC-${Math.floor(100 + Math.random() * 900)}`,
        user: req.user._id,
        store,
        owner,
        taxId,
        document: document || "",
        status: "Pending",
      });
    }

    // Log Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Merchant Submitted KYC",
      module: "KYC",
      oldValue: "None",
      newValue: kycRecord.status,
      ipAddress: req.ip || "127.0.0.1",
    });

    res.status(201).json({ message: "KYC documents successfully queued for audit.", kycRecord });
  } catch (error) {
    res.status(500).json({ message: "Error submitting KYC files", error: error.message });
  }
};

// List Pending KYC (Admin)
export const getPendingKYC = async (req, res) => {
  try {
    const submissions = await KYC.find({ status: { $in: ["Pending", "Under Review", "Reupload Required"] } }).sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving pending KYC folders", error: error.message });
  }
};

// List Verified/Approved KYC (Admin)
export const getVerifiedKYC = async (req, res) => {
  try {
    const submissions = await KYC.find({ status: "Approved" }).sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving approved KYC register", error: error.message });
  }
};

// List Rejected KYC (Admin)
export const getRejectedKYC = async (req, res) => {
  try {
    const submissions = await KYC.find({ status: "Rejected" }).sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving rejected KYC applications", error: error.message });
  }
};

// Approve KYC (Admin)
export const approveKYC = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await KYC.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "KYC request folder not found" });
    }

    const previousStatus = submission.status;
    submission.status = "Approved";
    submission.auditor = req.user.name;
    await submission.save();

    // Set user account as active in system
    const user = await User.findByIdAndUpdate(submission.user, { status: "Active" });

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Admin Approved KYC",
      module: "KYC",
      oldValue: previousStatus,
      newValue: "Approved",
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create In-App Notification
    await Notification.create({
      userId: submission.user,
      title: "KYC Status: Approved",
      message: `Your merchant store "${submission.store}" has been KYC verified and account activated.`,
      type: "KYC Approved",
    });

    // Dispatch Email Notification
    if (user) {
      await sendKYCApprovedEmail(user.email, user.name, submission.store);
    }

    res.status(200).json({ message: `Success: Authorized merchant store "${submission.store}". Compliance folder verified.`, submission });
  } catch (error) {
    res.status(500).json({ message: "Error approving KYC credentials", error: error.message });
  }
};

// Reject KYC (Admin)
export const rejectKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection exception reason is required" });
    }

    const submission = await KYC.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "KYC request folder not found" });
    }

    const previousStatus = submission.status;
    submission.status = "Rejected";
    submission.rejectReason = reason;
    submission.auditor = req.user.name;
    await submission.save();

    // Deactivate user status if previously active
    const user = await User.findByIdAndUpdate(submission.user, { status: "Pending" });

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Admin Rejected KYC",
      module: "KYC",
      oldValue: previousStatus,
      newValue: "Rejected",
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create In-App Notification
    await Notification.create({
      userId: submission.user,
      title: "KYC Status: Rejected",
      message: `Your compliance document scan was rejected: ${reason}`,
      type: "Claim Updated", // Reused generic type
    });

    res.status(200).json({ message: `Success: Declined merchant store "${submission.store}". Reason logged: ${reason}`, submission });
  } catch (error) {
    res.status(500).json({ message: "Error declining compliance folder", error: error.message });
  }
};

// Trigger Re-upload (Admin requests fix)
export const triggerReupload = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reupload request reason details are required" });
    }

    const submission = await KYC.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "KYC request folder not found" });
    }

    const previousStatus = submission.status;
    submission.status = "Reupload Required";
    submission.rejectReason = reason;
    submission.auditor = req.user.name;
    await submission.save();

    // Set user back to Pending
    const user = await User.findByIdAndUpdate(submission.user, { status: "Pending" });

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Admin Requested KYC Reupload",
      module: "KYC",
      oldValue: previousStatus,
      newValue: "Reupload Required",
      ipAddress: req.ip || "127.0.0.1",
    });

    // Create In-App Notification
    await Notification.create({
      userId: submission.user,
      title: "KYC Action Required: Reupload Documents",
      message: `Compliance audit requires you to re-upload documents. Reason: ${reason}`,
      type: "Claim Updated",
    });

    // Dispatch Email Notification
    if (user) {
      await sendKYCReuploadEmail(user.email, user.name, reason);
    }

    res.status(200).json({ message: `Success: Alert sent to "${submission.store}" requesting document re-upload.`, submission });
  } catch (err) {
    res.status(500).json({ message: "Error triggering compliance re-upload", error: err.message });
  }
};

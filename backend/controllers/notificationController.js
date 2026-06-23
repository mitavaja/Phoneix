import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";

// Get user notifications
export const getMyNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Error loading notifications list", error: error.message });
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ message: "Notification alert not found." });
    }
    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
};

// Retrieve administrative audit log history (Admin/Moderator)
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({}).populate("userId", "name email role").sort({ createdAt: -1 }).limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error loading system audit trails", error: error.message });
  }
};

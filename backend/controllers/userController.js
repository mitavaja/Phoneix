import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

// List all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users roster", error: error.message });
  }
};

// List pending users (if they are registered as pending or similar)
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "Pending" }).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving pending users list", error: error.message });
  }
};

// List blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "Blocked" }).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving blocked users list", error: error.message });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role value is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: `Success: Updated user role to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: "Error modifying user role", error: error.message });
  }
};

// Toggle block/unblock status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Active" or "Blocked"

    if (!status || !["Active", "Blocked", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Valid status value is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ message: `Success: User account is now ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: "Error modifying account status", error: error.message });
  }
};

import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Shipment from "../models/Shipment.js";

// Helper function to enrich users with wallet balance and order stats
const enrichUsersWithData = async (users) => {
  const enriched = [];
  for (const user of users) {
    // Find wallet or create a fallback default wallet object
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      // Create wallet if missing for backward compatibility/robustness
      wallet = await Wallet.create({
        user: user._id,
        storeName: user.companyName || `${user.name}'s Store`,
        balance: 0.0,
        totalBalance: 0.0,
        availableBalance: 0.0,
        holdBalance: 0.0,
      });
    }

    // Aggregate shipment stats
    const totalOrders = await Shipment.countDocuments({ user: user._id });
    const deliveredOrders = await Shipment.countDocuments({ user: user._id, status: "Delivered" });
    const pendingOrders = await Shipment.countDocuments({
      user: user._id,
      status: { $in: ["Booked", "In Transit", "Out For Delivery", "Label Generated", "Pickup Requested", "Pickup Scheduled", "Picked Up"] }
    });

    enriched.push({
      ...user.toObject(),
      wallet: {
        balance: wallet.balance,
        availableBalance: wallet.availableBalance,
        totalBalance: wallet.totalBalance,
        holdBalance: wallet.holdBalance,
        storeName: wallet.storeName,
      },
      orders: {
        total: totalOrders,
        delivered: deliveredOrders,
        pending: pendingOrders
      }
    });
  }
  return enriched;
};

// List all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    const enrichedUsers = await enrichUsersWithData(users);
    res.status(200).json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users roster", error: error.message });
  }
};

// List pending users (if they are registered as pending or similar)
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "Pending" }).select("-password").sort({ createdAt: -1 });
    const enrichedUsers = await enrichUsersWithData(users);
    res.status(200).json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving pending users list", error: error.message });
  }
};

// List blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "Blocked" }).select("-password").sort({ createdAt: -1 });
    const enrichedUsers = await enrichUsersWithData(users);
    res.status(200).json(enrichedUsers);
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

// Retrieve detailed order book (shipments) of a single user
export const getUserOrderBook = async (req, res) => {
  try {
    const { id } = req.params;
    const shipments = await Shipment.find({ user: id }).populate("pickupAddressId").sort({ createdAt: -1 });
    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user order book", error: error.message });
  }
};

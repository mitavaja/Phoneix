import PickupAddress from "../models/PickupAddress.js";

// Create Pickup Warehouse Address
export const createAddress = async (req, res) => {
  try {
    const { addressName, contactPerson, mobile, address, city, state, country, pincode, isDefault } = req.body;

    if (!addressName || !contactPerson || !mobile || !address || !city || !state || !country || !pincode) {
      return res.status(400).json({ message: "All address fields are required." });
    }

    // If isDefault is true, set all other user addresses to false first
    if (isDefault) {
      await PickupAddress.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });
    }

    // If this is the user's first address, set it as default
    const count = await PickupAddress.countDocuments({ userId: req.user._id });
    const setAsDefault = count === 0 ? true : isDefault;

    const newAddress = await PickupAddress.create({
      userId: req.user._id,
      addressName,
      contactPerson,
      mobile,
      address,
      city,
      state,
      country,
      pincode,
      isDefault: !!setAsDefault,
    });

    res.status(201).json({ message: "Pickup Address saved successfully.", newAddress });
  } catch (error) {
    res.status(500).json({ message: "Error saving pickup location", error: error.message });
  }
};

// View own addresses
export const getMyAddresses = async (req, res) => {
  try {
    const addresses = await PickupAddress.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Error loading warehouse addresses", error: error.message });
  }
};

// Delete warehouse address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await PickupAddress.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Warehouse address not found." });
    }
    res.status(200).json({ message: "Pickup location deleted successfully.", address });
  } catch (error) {
    res.status(500).json({ message: "Error deleting warehouse address", error: error.message });
  }
};

// Toggle Default Warehouse
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    // Set all other addresses for this user to false
    await PickupAddress.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });

    const address = await PickupAddress.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Warehouse address not found." });
    }

    res.status(200).json({ message: "Default warehouse updated.", address });
  } catch (error) {
    res.status(500).json({ message: "Error updating default address", error: error.message });
  }
};

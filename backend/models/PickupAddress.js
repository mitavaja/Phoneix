import mongoose from "mongoose";

const pickupAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressName: {
      type: String,
      required: true, // e.g. "Warehouse Mumbai"
    },
    contactPerson: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

pickupAddressSchema.index({ userId: 1 });

const PickupAddress = mongoose.model("PickupAddress", pickupAddressSchema);
export default PickupAddress;

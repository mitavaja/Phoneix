import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      default: "",
    },
    ownerName: {
      type: String,
      default: "",
    },
    mobileNumber: {
      type: String,
      default: "",
      trim: true,
    },
    gstType: {
      type: String,
      enum: ["GST Registered", "Non-GST"],
      default: "Non-GST",
    },
    gstNumber: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["Buyer", "Seller", "Moderator", "Admin", "Operations"],
      default: "Seller",
    },
    status: {
      type: String,
      enum: ["Active", "Blocked", "Pending"],
      default: "Pending",
    },
    pin: {
      type: String,
      default: "1234",
      trim: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ mobileNumber: 1 });

const User = mongoose.model("User", userSchema);
export default User;

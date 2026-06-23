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
    },
    gstType: {
      type: String,
      enum: ["GST Registered", "Non-GST"],
      default: "Non-GST",
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
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ mobileNumber: 1 });

const User = mongoose.model("User", userSchema);
export default User;

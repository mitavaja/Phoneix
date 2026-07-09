import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    kycId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    taxId: {
      type: String,
      required: true,
    },
    document: {
      type: String,
      default: "",
    },
    panCard: {
      type: String,
      default: "",
    },
    aadhaarCard: {
      type: String,
      default: "",
    },
    gstCertificate: {
      type: String,
      default: "",
    },
    addressProof: {
      type: String,
      default: "",
    },
    companyRegistration: {
      type: String,
      default: "",
    },
    lightbill: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Approved", "Rejected", "Reupload Required"],
      default: "Pending",
    },
    rejectReason: {
      type: String,
      default: "",
    },
    auditor: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const KYC = mongoose.model("KYC", kycSchema);
export default KYC;

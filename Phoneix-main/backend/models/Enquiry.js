import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    shipmentVolume: {
      type: String,
      required: true, // e.g. "500-1000 kg"
    },
    monthlyShipments: {
      type: Number,
      required: true, // e.g. 50
    },
    message: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

enquirySchema.index({ email: 1 });
enquirySchema.index({ createdAt: 1 });

const Enquiry = mongoose.model("Enquiry", enquirySchema);
export default Enquiry;

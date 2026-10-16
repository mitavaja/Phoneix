import mongoose from "mongoose";

const rateSchema = new mongoose.Schema(
  {
    slabId: {
      type: String,
      required: true,
      unique: true,
    },
    weightLimit: {
      type: Number,
      required: true,
    },
    carrier: {
      type: String,
      required: true,
    },
    zoneA: {
      type: Number,
      required: true,
    },
    zoneB: {
      type: Number,
      required: true,
    },
    zoneC: {
      type: Number,
      required: true,
    },
    zoneD: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Rate = mongoose.model("Rate", rateSchema);
export default Rate;

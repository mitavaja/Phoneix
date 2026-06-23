import mongoose from "mongoose";

const marginRuleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Fixed", "Percentage"],
      default: "Fixed",
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      default: "", // Empty means global or not matched by country
    },
    weightMin: {
      type: Number,
      default: 0.0,
    },
    weightMax: {
      type: Number,
      default: 0.0, // 0.0 means no upper limit or not matched by weight
    },
  },
  {
    timestamps: true,
  }
);

marginRuleSchema.index({ country: 1 });
marginRuleSchema.index({ weightMin: 1, weightMax: 1 });

const MarginRule = mongoose.model("MarginRule", marginRuleSchema);
export default MarginRule;

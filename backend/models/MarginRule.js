import mongoose from "mongoose";

const marginRuleSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
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
            default: "",
        },
        weightMin: {
            type: Number,
            default: 0.0,
        },
        weightMax: {
            type: Number,
            default: 0.0,
        },
    },
    {
        timestamps: true,
    }
);

marginRuleSchema.index({userId: 1, country: 1});
marginRuleSchema.index({weightMin: 1, weightMax: 1});

const MarginRule = mongoose.model("MarginRule", marginRuleSchema);
export default MarginRule;
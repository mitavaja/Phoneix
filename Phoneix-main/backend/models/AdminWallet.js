import mongoose from "mongoose";

const adminWalletSchema = new mongoose.Schema(
    {
        currency: {
            type: String,
            default: "INR",
            unique: true,
        },
        totalGrossRevenue: {
            type: Number,
            default: 0.0,
        },
        // --- Carrier Liabilities ---
        aramexPayables: {
            type: Number,
            default: 0.0,
        },
        shipglobalPayables: {    // <-- NEW FIELD
            type: Number,
            default: 0.0,
        },
        // ---------------------------
        gstPayables: {
            type: Number,
            default: 0.0,
        },
        netProfit: {
            type: Number,
            default: 0.0,
        },
        withdrawnProfit: {
            type: Number,
            default: 0.0,
        },
        aramexPaid: {
            type: Number,
            default: 0.0,
        },
        shipglobalPaid: {       // <-- NEW FIELD
            type: Number,
            default: 0.0,
        }
    },
    {
        timestamps: true,
    }
);

const AdminWallet = mongoose.model("AdminWallet", adminWalletSchema);
export default AdminWallet;
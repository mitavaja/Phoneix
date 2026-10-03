import AdminWallet from "../models/AdminWallet.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import KYC from "../models/KYC.js";

export const getDashboardMetrics = async (req, res) => {
    try {
        // 1. Fetch or initialize the master Admin Wallet
        let adminWallet = await AdminWallet.findOne({ currency: "INR" });
        if (!adminWallet) {
            adminWallet = await AdminWallet.create({ currency: "INR" });
        }

        // 2. Calculate Unspent Seller Liabilities (Money sitting in seller wallets)
        const walletMetrics = await Wallet.aggregate([
            {
                $group: {
                    _id: null,
                    totalUnspentBalance: { $sum: "$availableBalance" }
                }
            }
        ]);
        const sellerLiabilities = walletMetrics[0]?.totalUnspentBalance || 0;

        // 3. Get System Stats for the Dashboard top row
        const activeSellers = await User.countDocuments({ role: "Seller", status: "Active" });
        const pendingKyc = await KYC.countDocuments({ status: "Pending" });

        res.status(200).json({
            ledger: {
                totalGrossRevenue: adminWallet.totalGrossRevenue,
                aramexPayables: adminWallet.aramexPayables,
                gstPayables: adminWallet.gstPayables,
                safeNetProfit: adminWallet.netProfit,
                sellerLiabilities: sellerLiabilities
            },
            system: {
                users: activeSellers,
                kycQueue: pendingKyc
            }
        });
    } catch (error) {
        console.error("Dashboard Metrics Error:", error.message);
        res.status(500).json({ message: "Failed to load dashboard metrics", error: error.message });
    }
};
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import API from "../../services/api";
import { Wallet } from "lucide-react";
import Pagination from "../../components/Pagination";

const WalletLedger = () => {
    const { user, fetchWalletData: refreshGlobalWallet } = useOutletContext();
    const [wallets, setWallets] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState("INR");
    const [transactions, setTransactions] = useState([]);
    const [txPage, setTxPage] = useState(1);
    const [txPagination, setTxPagination] = useState(null);

    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [isFirstTime, setIsFirstTime] = useState(false);

    const [rechargeAmount, setRechargeAmount] = useState("");
    const [rechargeSuccess, setRechargeSuccess] = useState("");
    const [rechargeError, setRechargeError] = useState("");
    const [showRazorpayModal, setShowRazorpayModal] = useState(false);
    const [razorpayOrderData, setRazorpayOrderData] = useState(null);
    const [activeRazorpayTab, setActiveRazorpayTab] = useState("upi");
    const [upiIdInput, setUpiIdInput] = useState("success@razorpay");
    const [isVerifyingRazorpay, setIsVerifyingRazorpay] = useState(false);

    const fetchWalletData = async (page = 1, currency = "INR") => {
        try {
            const res = await API.get(`/wallet/me?page=${page}&limit=10&currency=${currency}`);
            setWallets(res.data.wallets || []);
            setTransactions(res.data.transactions || []);
            setTxPagination(res.data.pagination || null);

            const cRes = await API.get("/coupons/applicable");
            setCoupons(cRes.data.coupons || []);
            setIsFirstTime(cRes.data.isFirstTime || false);
        } catch (err) {}
    };

    useEffect(() => {
        fetchWalletData(txPage, selectedCurrency);
    }, [txPage, selectedCurrency]);

    useEffect(() => {
        setWallet(wallets.find(w => w.currency === selectedCurrency) || wallets[0]);
    }, [selectedCurrency, wallets]);

    const handleRazorpayCheckout = async () => {
        const amountNum = parseFloat(rechargeAmount);
        if (!rechargeAmount || isNaN(amountNum) || amountNum <= 0) {
            setRechargeError("Please enter a valid recharge amount.");
            return;
        }
        if (selectedCoupon && amountNum < 1000) {
            setRechargeError("Promo coupons require a minimum recharge amount of ₹1,000.");
            return;
        }
        setRechargeError("");
        setRechargeSuccess("");

        try {
            const orderRes = await API.post("/wallet/recharge", {
                amount: parseFloat(rechargeAmount),
                currency: selectedCurrency,
                couponCode: selectedCoupon ? selectedCoupon.code : undefined,
            });

            if (orderRes.data.isDemoMode) {
                setRazorpayOrderData({
                    orderId: orderRes.data.orderId,
                    amount: orderRes.data.amount,
                    currency: orderRes.data.currency,
                    keyId: orderRes.data.keyId,
                });
                setShowRazorpayModal(true);
                return;
            }

            const options = {
                key: orderRes.data.keyId,
                amount: Math.round(orderRes.data.amount * 100),
                currency: orderRes.data.currency,
                name: "Phreights",
                description: `Wallet Recharge: ${orderRes.data.currency} ${orderRes.data.amount}`,
                image: `${window.location.origin}/phreights-logo.png`,
                order_id: orderRes.data.orderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await API.post("/wallet/verify-recharge", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: orderRes.data.amount,
                            couponCode: selectedCoupon ? selectedCoupon.code : undefined,
                            currency: orderRes.data.currency,
                        });
                        setRechargeSuccess(verifyRes.data.message || "Wallet recharged successfully!");
                        setRechargeAmount("");
                        setSelectedCoupon(null);
                        await fetchWalletData();
                        if (refreshGlobalWallet) refreshGlobalWallet();
                    } catch (verifyErr) {
                        setRechargeError(verifyErr.response?.data?.message || "Recharge verification failed.");
                    }
                },
                prefill: {
                    name: user?.name || "Merchant",
                    email: user?.email || "",
                    contact: user?.mobileNumber || "",
                },
                theme: {
                    color: "#0A1F44",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                setRechargeError(response.error.description || "Payment failed.");
            });
            rzp.open();
        } catch (err) {
            setRechargeError(err.response?.data?.message || "Failed to initiate recharge order.");
        }
    };

    const handleConfirmSimulatedRazorpay = async () => {
        if (!razorpayOrderData) return;
        setIsVerifyingRazorpay(true);
        try {
            const verifyRes = await API.post("/wallet/verify-recharge", {
                razorpay_order_id: razorpayOrderData.orderId,
                razorpayOrderId: razorpayOrderData.orderId,
                razorpay_payment_id: "pay_" + Date.now().toString().slice(-10),
                razorpayPaymentId: "pay_" + Date.now().toString().slice(-10),
                razorpay_signature: "dummy_signature",
                razorpaySignature: "dummy_signature",
                amount: razorpayOrderData.amount,
                couponCode: selectedCoupon ? selectedCoupon.code : undefined,
                currency: razorpayOrderData.currency,
            });
            setShowRazorpayModal(false);
            setRazorpayOrderData(null);
            setRechargeSuccess(verifyRes.data.message || "Wallet recharged successfully!");
            setRechargeAmount("");
            setSelectedCoupon(null);
            await fetchWalletData();
            if (refreshGlobalWallet) refreshGlobalWallet();
        } catch (err) {
            setRechargeError(err.response?.data?.message || "Recharge verification failed.");
        } finally {
            setIsVerifyingRazorpay(false);
        }
    };

    return (
        <>
            <div className="space-y-6 select-none animate-fade-in">
                {/* Title Header */}
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Wallet & Transaction Ledger</h1>
                    <p className="text-sm text-[#687280]">Review your available balance, recharge funds via Razorpay, and audit all transaction logs.</p>
                </div>

                {/* Wallet Top Section: Balance & Recharge */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Available Balance Card */}
                    <div className="glass-card p-8 rounded-2xl border border-[#687280]/20 shadow-xl flex flex-col justify-between min-h-[240px] relative overflow-hidden group">
                        <div className="absolute right-6 bottom-6 opacity-5 text-[#FF6A00] group-hover:scale-110 transition duration-500 pointer-events-none">
                            <Wallet size={160} />
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs text-[#FF6A00] uppercase tracking-[0.2em] font-extrabold bg-[#FF6A00]/10 px-3.5 py-1.5 rounded-full border border-[#FF6A00]/25 w-fit block">
                                {selectedCurrency} Ledger Status
                            </span>
                            <h3 className="text-xs text-[#687280] font-bold uppercase tracking-wider mt-2">Available Balance</h3>
                        </div>

                        <div className="my-3">
                            <span className="text-4xl lg:text-5xl font-black tracking-tight text-[#0A1F44] font-mono">
                                ₹{wallet ? wallet.availableBalance.toFixed(2) : "0.00"}
                            </span>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-[#E5E7EB]/40 p-2.5 rounded-xl border border-[#687280]/15">
                                    <span className="text-[10px] text-[#687280] block font-semibold">Reserved Holds</span>
                                    <span className="text-xs font-bold text-amber-600">₹{wallet ? wallet.holdBalance.toFixed(2) : "0.00"}</span>
                                </div>
                                <div className="bg-[#E5E7EB]/40 p-2.5 rounded-xl border border-[#687280]/15">
                                    <span className="text-[10px] text-[#687280] block font-semibold">Total Ledger Balance</span>
                                    <span className="text-xs font-bold text-[#0A1F44]">₹{wallet ? wallet.totalBalance.toFixed(2) : "0.00"}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-[#687280] leading-relaxed">
                                Consumable funds reserved or utilized for logistics services in {selectedCurrency}.
                            </p>
                        </div>
                    </div>

                    {/* Razorpay Top Up */}
                    <div className="glass-card p-8 rounded-2xl border border-[#687280]/20 shadow-xl flex flex-col justify-between min-h-[240px] space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#0A1F44] uppercase tracking-wider flex items-center gap-2 border-b border-[#687280]/15 pb-3">
                                <Wallet size={18} className="text-[#FF6A00]" />
                                Razorpay Instant Recharge
                            </h4>
                            <p className="text-xs text-[#687280] pt-1">
                                Add money to your wallet securely using Razorpay gateway.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-[#687280] block mb-1.5 font-bold uppercase tracking-wider">
                                    Recharge Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    placeholder="5000"
                                    value={rechargeAmount}
                                    onChange={(e) => setRechargeAmount(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] text-xs transition duration-300 shadow-sm"
                                />
                            </div>

                            {/* Available Offers & Coupons Section */}
                            {coupons.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[#FF6A00] block font-extrabold uppercase tracking-widest flex justify-between items-center">
                                        <span>Promo Codes & Coupons</span>
                                        {isFirstTime && (
                                            <span className="text-[9px] bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 px-2 py-0.5 rounded-full font-bold">
                                                First Recharge Active
                                            </span>
                                        )}
                                    </label>
                                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                        {coupons.map((coupon) => {
                                            const minRequired = Math.max(1000, Number(coupon.minRecharge) || 1000);
                                            const currentAmount = parseFloat(rechargeAmount) || 0;
                                            const isEligible = currentAmount >= minRequired;
                                            const isSelected = selectedCoupon?._id === coupon._id;

                                            return (
                                                <div
                                                    key={coupon._id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedCoupon(null);
                                                        } else {
                                                            if (currentAmount < minRequired) {
                                                                setRechargeAmount(minRequired.toString());
                                                            }
                                                            setSelectedCoupon(coupon);
                                                        }
                                                    }}
                                                    className={`p-3 rounded-xl border transition duration-300 cursor-pointer flex flex-col justify-between space-y-1.5 ${
                                                        isSelected
                                                            ? "bg-[#FF6A00]/10 border-[#FF6A00] shadow-sm"
                                                            : "bg-[#E5E7EB]/40 border-[#687280]/20 hover:border-[#FF6A00]/40"
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="border border-dashed border-[#FF6A00] text-[#FF6A00] px-2 py-0.5 rounded font-mono font-black text-[10px] tracking-wider bg-[#FF6A00]/5">
                                                                {coupon.code}
                                                            </span>
                                                            {coupon.firstTimeOnly && (
                                                                <span className="bg-purple-100 text-purple-700 border border-purple-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                                    First Time
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[#0A1F44] font-extrabold text-[11px]">
                                                            {coupon.couponType === "Percentage" ? `${coupon.value}% Bonus` : `₹${coupon.value} Flat`}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-[#687280] leading-relaxed">
                                                        {coupon.description}
                                                    </p>
                                                    <div className="flex justify-between items-center text-[9px] pt-1">
                                                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                            Min Recharge: ₹{Math.max(1000, Number(coupon.minRecharge) || 1000).toLocaleString('en-IN')}
                                                        </span>
                                                        <span className="text-[#687280]">
                                                            Min. Recharge: <span className="font-bold text-[#0A1F44]">₹{coupon.minRecharge}</span>
                                                        </span>
                                                        {isSelected ? (
                                                            <span className="text-green-600 font-bold flex items-center gap-0.5">
                                                                ✓ Applied
                                                            </span>
                                                        ) : isEligible ? (
                                                            <span className="text-[#FF6A00] font-medium">
                                                                Click to Apply
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic">
                                                                Click to adjust to ₹{coupon.minRecharge}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Calculated Bonus Visualizer */}
                            {selectedCoupon && (
                                <div className="p-3 rounded-xl bg-green-50 border border-green-200 flex flex-col space-y-1 text-xs">
                                    <div className="flex justify-between text-[#687280]">
                                        <span>Deposit Amount:</span>
                                        <span className="font-bold text-[#0A1F44]">₹{parseFloat(rechargeAmount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-700 font-bold">
                                        <span>Coupon Reward Added:</span>
                                        <span>
                                            +₹{(
                                                selectedCoupon.couponType === "Percentage"
                                                    ? Math.min((parseFloat(rechargeAmount || 0) * selectedCoupon.value) / 100, selectedCoupon.maxDiscountAmount || Infinity)
                                                    : selectedCoupon.value
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="border-t border-green-200 pt-1.5 flex justify-between font-extrabold text-[#0A1F44]">
                                        <span>Final Wallet Credited:</span>
                                        <span className="text-green-700">
                                            ₹{(
                                                parseFloat(rechargeAmount || 0) +
                                                (selectedCoupon.couponType === "Percentage"
                                                    ? Math.min((parseFloat(rechargeAmount || 0) * selectedCoupon.value) / 100, selectedCoupon.maxDiscountAmount || Infinity)
                                                    : selectedCoupon.value)
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleRazorpayCheckout}
                                className="w-full bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-extrabold py-3.5 rounded-xl text-xs transition duration-300 shadow-md shadow-[#FF6A00]/20"
                            >
                                Process Wallet Topup
                            </button>
                        </div>
                    </div>

                </div>

                {rechargeError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl">
                        {rechargeError}
                    </div>
                )}

                {rechargeSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3.5 rounded-xl">
                        {rechargeSuccess}
                    </div>
                )}

                {/* Transactions Ledger Table */}
                <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl space-y-4">
                    <h3 className="text-base font-bold text-[#0A1F44]">Wallet Transaction Audit Ledger</h3>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                            <tr className="border-b border-[#687280]/20 text-[#687280] uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-4 font-semibold">Date</th>
                                <th className="py-3 px-4 text-center font-semibold">Type</th>
                                <th className="py-3 px-4 text-right font-semibold">Amount</th>
                                <th className="py-3 px-4 text-right font-semibold">Opening Balance</th>
                                <th className="py-3 px-4 text-right font-semibold">Closing Balance</th>
                                <th className="py-3 px-4 font-semibold">Reference ID / Remarks</th>
                                <th className="py-3 px-4 text-center font-semibold">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
                            {transactions.map(tx => {
                                const symbol = selectedCurrency === "INR" ? "₹" : selectedCurrency === "AED" ? "AED " : selectedCurrency === "USD" ? "$" : "£";
                                return (
                                    <tr key={tx._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                                        <td className="py-3.5 px-4 text-[#687280]">{new Date(tx.createdAt).toLocaleString()}</td>
                                        <td className="py-3.5 px-4 text-center font-semibold text-[#0A1F44]">{tx.transactionType}</td>
                                        <td className={`py-3.5 px-4 text-right font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                                            {tx.amount > 0 ? `+${symbol}${tx.amount.toFixed(2)}` : `-${symbol}${Math.abs(tx.amount).toFixed(2)}`}
                                        </td>
                                        <td className="py-3.5 px-4 text-right text-[#687280]">{symbol}{tx.openingBalance?.toFixed(2)}</td>
                                        <td className="py-3.5 px-4 text-right font-bold text-[#0A1F44]">{symbol}{tx.closingBalance?.toFixed(2)}</td>
                                        <td className="py-3.5 px-4 text-[#0A1F44]">
                                            <span className="font-mono block text-[10px] text-[#FF6A00] font-bold">{tx.referenceId}</span>
                                            <span className="text-[11px] text-[#687280] block">{tx.remarks}</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                tx.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" :
                                                    tx.status === "HOLD" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-red-100 text-red-700 border-red-200"
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center text-[#687280] font-semibold">
                                        No ledger transactions recorded.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        pagination={txPagination}
                        onPageChange={(newPage) => setTxPage(newPage)}
                    />
                </div>

            </div>

            {/* 💳 RAZORPAY STANDARD CHECKOUT MODAL */}
            {showRazorpayModal && razorpayOrderData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col md:flex-row text-gray-800 font-sans">

                        {/* Left Header Panel */}
                        <div className="w-full md:w-5/12 bg-gradient-to-b from-[#0A1F44] to-[#071630] p-6 text-white flex flex-col justify-between relative overflow-hidden border-r border-[#687280]/20">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <img src="/phreights-logo.png" alt="Phreights Logo" className="h-7 w-auto object-contain" />
                                    <span className="text-[9px] bg-white/15 px-2 py-0.5 rounded-full font-bold text-gray-200">PAYMENT</span>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-300">Payable Amount</span>
                                    <h2 className="text-3xl font-black mt-0.5 text-white">₹{razorpayOrderData.amount.toFixed(2)}</h2>
                                </div>
                            </div>

                            <div className="space-y-1 text-xs text-gray-300 mt-6">
                                <p>Order: <span className="font-mono text-[10px] text-gray-200">{razorpayOrderData.orderId}</span></p>
                                <p>Merchant: <span className="font-semibold text-white">Phreights Logistics</span></p>
                            </div>
                        </div>

                        {/* Right Content Panel */}
                        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A1F44]">Choose Payment Method</h4>
                                    <button onClick={() => setShowRazorpayModal(false)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">✕</button>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-gray-200 text-xs font-semibold mb-4 gap-2">
                                    {["upi", "cards", "netbanking"].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveRazorpayTab(tab)}
                                            className={`pb-2 px-1 text-xs uppercase font-bold transition ${
                                                activeRazorpayTab === tab ? "border-b-2 border-[#FF6A00] text-[#FF6A00]" : "text-gray-400 hover:text-gray-600"
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Contents */}
                                {activeRazorpayTab === "upi" && (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-600 block">Pay with UPI ID / Number</label>
                                            <input
                                                type="text"
                                                value={upiIdInput}
                                                onChange={(e) => setUpiIdInput(e.target.value)}
                                                className="w-full p-2.5 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6A00]"
                                                placeholder="success@razorpay"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeRazorpayTab === "cards" && (
                                    <div className="space-y-2.5 text-xs">
                                        <div className="space-y-1">
                                            <label className="font-semibold text-gray-600 text-[10px]">Card Number</label>
                                            <input type="text" placeholder="4532 •••• •••• 8921" className="w-full p-2 border border-gray-300 rounded-lg outline-none" defaultValue="4532 8900 1234 8921" />
                                        </div>
                                    </div>
                                )}

                                {activeRazorpayTab === "netbanking" && (
                                    <div className="space-y-2 text-xs">
                                        <span className="font-bold text-gray-600 block text-[10px]">Select Popular Bank</span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="p-2 border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] font-bold rounded-lg text-left text-[11px]">HDFC Bank</button>
                                            <button className="p-2 border border-gray-200 rounded-lg text-left font-semibold text-gray-700 text-[11px]">ICICI Bank</button>
                                        </div>
                                    </div>
                                )}

                                {/* Verify and Pay Button */}
                                <button
                                    onClick={handleConfirmSimulatedRazorpay}
                                    disabled={isVerifyingRazorpay}
                                    className="w-full mt-5 bg-[#0A1F44] hover:bg-[#FF6A00] text-white font-extrabold py-3 rounded-xl text-xs transition duration-300 shadow-md flex items-center justify-center gap-2"
                                >
                                    {isVerifyingRazorpay ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Verifying Payment...</span>
                                        </>
                                    ) : (
                                        <span>Verify and Pay ₹{razorpayOrderData.amount.toFixed(2)}</span>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default WalletLedger;
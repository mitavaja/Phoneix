import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import API from "../../services/api";
import { Wallet } from "lucide-react";
import Pagination from "../../components/Pagination";

const WalletLedger = () => {
    const {user, fetchWalletData: refreshGlobalWallet} = useOutletContext();
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
        } catch (err) {
        }
    };

    useEffect(() => {
        fetchWalletData(txPage, selectedCurrency);
    }, [txPage, selectedCurrency]);

    useEffect(() => {
        setWallet(wallets.find(w => w.currency === selectedCurrency) || wallets[0]);
    }, [selectedCurrency, wallets]);

    const handleRazorpayCheckout = async () => {
        if (!rechargeAmount || isNaN(parseFloat(rechargeAmount)) || parseFloat(rechargeAmount) <= 0) {
            setRechargeError("Please enter a valid recharge amount.");
            return;
        }
        setRechargeError("");
        setRechargeSuccess("");

        try {
            const orderRes = await API.post("/wallet/recharge", {
                amount: parseFloat(rechargeAmount),
                currency: selectedCurrency
            });
            const { orderDetails, keyId } = orderRes.data;
            const orderId = orderDetails.id;

            const isPlaceholderKey = !keyId || keyId === "rzp_test_1234567890abcd" || keyId.includes("1234567890");

            if (isPlaceholderKey) {
                setRazorpayOrderData({
                    orderId, amount: parseFloat(rechargeAmount), currency: selectedCurrency, keyId,
                });
                setShowRazorpayModal(true);
                return;
            }

            const loadRazorpayScript = () => {
                return new Promise((resolve) => {
                    if (window.Razorpay) return resolve(true);
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                });
            };

            const isLoaded = await loadRazorpayScript();
            if (!isLoaded || !window.Razorpay) {
                setRazorpayOrderData({ orderId, amount: parseFloat(rechargeAmount), currency: selectedCurrency, keyId });
                setShowRazorpayModal(true);
                return;
            }

            const options = {
                key: keyId,
                amount: orderDetails.amount,
                currency: orderDetails.currency || "INR",
                name: "Phoenix Commerce",
                description: `Wallet Topup - ${selectedCurrency} ${parseFloat(rechargeAmount).toFixed(2)}`,
                image: "https://razorpay.com/favicon.png",
                order_id: orderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await API.post("/wallet/verify-recharge", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            razorpaySignature: response.razorpay_signature,
                            amount: parseFloat(rechargeAmount),
                            couponCode: selectedCoupon ? selectedCoupon.code : undefined,
                            currency: selectedCurrency
                        });
                        setRechargeSuccess(verifyRes.data.message || "Wallet recharged successfully!");
                        setRechargeAmount("");
                        setSelectedCoupon(null);
                        await fetchWalletData();
                    } catch (err) {
                        setRechargeError(err.response?.data?.message || "Recharge verification failed.");
                    }
                },
                prefill: {
                    name: user?.name || "Merchant",
                    email: user?.email || "",
                    contact: user?.mobileNumber || ""
                },
                notes: {
                    storeName: wallet?.storeName || user?.name || "Store",
                    currency: selectedCurrency
                },
                theme: {
                    color: "#FF6A00",
                    backdrop_color: "rgba(10, 31, 68, 0.85)"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                setRazorpayOrderData({ orderId, amount: parseFloat(rechargeAmount), currency: selectedCurrency, keyId });
                setShowRazorpayModal(true);
            });
            rzp.open();
        } catch (err) {
            setRechargeError(err.response?.data?.message || "Failed to initiate Razorpay recharge order.");
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
        } catch (err) {
            setRechargeError(err.response?.data?.message || "Recharge verification failed.");
        } finally {
            setIsVerifyingRazorpay(false);
        }
    };

    return (
        <>
            <div className="space-y-8 animate-fade-in">

                {/*/!* Currency Selector *!/*/}
                {/*<div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">*/}
                {/*    {["INR"].map((curr) => (*/}
                {/*        <button*/}
                {/*            key={curr}*/}
                {/*            onClick={() => {*/}
                {/*                setSelectedCurrency(curr);*/}
                {/*                setTxPage(1); // Reset to page 1 when switching wallets*/}
                {/*            }}*/}
                {/*            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${*/}
                {/*                selectedCurrency === curr*/}
                {/*                    ? "bg-[#FF6A00] text-[#0A1F44] shadow-lg"*/}
                {/*                    : "text-gray-400 hover:text-white hover:bg-white/5"*/}
                {/*            }`}*/}
                {/*        >*/}
                {/*            {curr} Wallet*/}
                {/*        </button>*/}
                {/*    ))}*/}
                {/*</div>*/}

                {/* Wallet Top Section: Balance & Recharge */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Available Balance Card */}
                    <div
                        className="bg-gradient-to-br from-[#0A1F44] to-[#071630] border border-[#687280]/20 rounded-3xl p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
                        {/* Decorative background logo icon */}
                        <div
                            className="absolute right-6 bottom-6 opacity-[0.03] text-[#FF6A00] group-hover:scale-110 transition duration-500 pointer-events-none">
                            <Wallet size={160}/>
                        </div>

                        <div className="space-y-2">
                    <span
                        className="text-xs text-[#FF6A00] uppercase tracking-[0.2em] font-extrabold bg-[#FF6A00]/10 px-3.5 py-1.5 rounded-full border border-[#FF6A00]/25 w-fit block">
                      {selectedCurrency} Ledger Status
                    </span>
                            <h3 className="text-sm text-gray-400 font-semibold uppercase tracking-wider mt-2">Available
                                Balance</h3>
                        </div>

                        <div className="my-4">
                    <span className="text-4xl lg:text-5xl font-black tracking-tight text-white font-mono">
                      {selectedCurrency === "INR" ? "₹" : selectedCurrency === "AED" ? "AED " : selectedCurrency === "USD" ? "$" : "£"}
                        {wallet ? wallet.availableBalance.toFixed(2) : "0.00"}
                    </span>
                            <div className="flex gap-4 mt-2 text-xs text-gray-400 font-semibold">
                                <span>Hold: {selectedCurrency === "INR" ? "₹" : selectedCurrency === "AED" ? "AED " : selectedCurrency === "USD" ? "$" : "£"}{wallet ? wallet.holdBalance.toFixed(2) : "0.00"}</span>
                                <span>Total: {selectedCurrency === "INR" ? "₹" : selectedCurrency === "AED" ? "AED " : selectedCurrency === "USD" ? "$" : "£"}{wallet ? wallet.totalBalance.toFixed(2) : "0.00"}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-[#687280] leading-relaxed">
                                Consumable funds reserved or utilized for logistics services in {selectedCurrency}.
                            </p>
                        </div>
                    </div>

                    {/* Razorpay Top Up */}
                    <div
                        className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-8 flex flex-col justify-between min-h-[220px] space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#687280]/20 pb-3">
                                <Wallet size={18} className="text-[#FF6A00]"/>
                                Razorpay Instant Recharge
                            </h4>
                            <p className="text-xs text-[#687280] pt-1">
                                Add money to your wallet securely using Razorpay gateway.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    className="text-[10px] text-gray-400 block mb-1.5 font-bold uppercase tracking-wider">
                                    Recharge Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    placeholder="5000"
                                    value={rechargeAmount}
                                    onChange={(e) => setRechargeAmount(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-2 focus:ring-[#FF6A00] text-xs transition duration-300"
                                />
                            </div>

                            {/* Available Offers & Coupons Section */}
                            {coupons.length > 0 && (
                                <div className="space-y-2">
                                    <label
                                        className="text-[10px] text-[#FF6A00] block font-extrabold uppercase tracking-widest flex justify-between items-center">
                                        <span>Promo Codes & Coupons</span>
                                        {isFirstTime && (
                                            <span
                                                className="text-[9px] bg-[#FF6A00]/25 text-[#FF6A00] border border-[#FF6A00]/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                              First Recharge Active
                            </span>
                                        )}
                                    </label>
                                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                                        {coupons.map((coupon) => {
                                            const isEligible = (parseFloat(rechargeAmount) || 0) >= coupon.minRecharge;
                                            const isSelected = selectedCoupon?._id === coupon._id;

                                            return (
                                                <div
                                                    key={coupon._id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedCoupon(null);
                                                        } else {
                                                            if (!isEligible) {
                                                                // Auto-adjust recharge amount to minRecharge
                                                                setRechargeAmount(coupon.minRecharge.toString());
                                                            }
                                                            setSelectedCoupon(coupon);
                                                        }
                                                    }}
                                                    className={`p-3 rounded-2xl border transition duration-300 cursor-pointer flex flex-col justify-between space-y-1.5 relative overflow-hidden group ${
                                                        isSelected
                                                            ? "bg-[#FF6A00]/10 border-[#FF6A00] shadow-md shadow-[#FF6A00]/5"
                                                            : "bg-white/5 border-white/10 hover:border-white/20"
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                    <span
                                        className="border border-dashed border-[#FF6A00] text-[#FF6A00] px-2 py-0.5 rounded font-mono font-black text-[10px] tracking-wider bg-[#FF6A00]/5">
                                      {coupon.code}
                                    </span>
                                                            {coupon.firstTimeOnly && (
                                                                <span
                                                                    className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                        First Time
                                      </span>
                                                            )}
                                                        </div>
                                                        <span className="text-white font-extrabold text-[11px]">
                                    {coupon.couponType === "Percentage" ? `${coupon.value}% Bonus` : `₹${coupon.value} Flat`}
                                  </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                                        {coupon.description}
                                                    </p>
                                                    <div className="flex justify-between items-center text-[9px] pt-1">
                                  <span className="text-gray-500">
                                    Min. Recharge: <span
                                      className="font-bold text-gray-300">₹{coupon.minRecharge}</span>
                                  </span>
                                                        {isSelected ? (
                                                            <span
                                                                className="text-green-400 font-bold flex items-center gap-0.5">
                                      ✓ Applied
                                    </span>
                                                        ) : isEligible ? (
                                                            <span
                                                                className="text-gray-400 font-medium group-hover:text-white transition">
                                      Click to Apply
                                    </span>
                                                        ) : (
                                                            <span className="text-gray-500 italic">
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
                                <div
                                    className="p-3 rounded-2xl bg-green-500/5 border border-green-500/15 flex flex-col space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Deposit Amount:</span>
                                        <span
                                            className="font-bold text-white">₹{(parseFloat(rechargeAmount) || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center gap-1">
                            Coupon Bonus ({selectedCoupon.code}):
                              {parseFloat(rechargeAmount) < selectedCoupon.minRecharge && (
                                  <span className="text-[9px] text-amber-500 font-bold">(Ineligible)</span>
                              )}
                          </span>
                                        <span className="font-bold text-green-400">
                            {parseFloat(rechargeAmount) >= selectedCoupon.minRecharge ? (
                                `+₹${(selectedCoupon.couponType === "Percentage"
                                    ? ((parseFloat(rechargeAmount) || 0) * selectedCoupon.value) / 100
                                    : selectedCoupon.value).toFixed(2)}`
                            ) : (
                                "₹0.00"
                            )}
                          </span>
                                    </div>
                                    {parseFloat(rechargeAmount) < selectedCoupon.minRecharge && (
                                        <div className="text-[10px] text-amber-500 pt-1 font-medium leading-tight">
                                            ⚠️ Enter
                                            ₹{(selectedCoupon.minRecharge - (parseFloat(rechargeAmount) || 0)).toFixed(2)} more
                                            to activate coupon.
                                        </div>
                                    )}
                                    {parseFloat(rechargeAmount) >= selectedCoupon.minRecharge && (
                                        <div
                                            className="flex justify-between border-t border-white/5 pt-1.5 font-bold text-sm">
                                            <span className="text-[#FF6A00]">Total Wallet Credit:</span>
                                            <span className="text-white">
                              ₹{(
                                                (parseFloat(rechargeAmount) || 0) +
                                                (selectedCoupon.couponType === "Percentage"
                                                    ? ((parseFloat(rechargeAmount) || 0) * selectedCoupon.value) / 100
                                                    : selectedCoupon.value)
                                            ).toFixed(2)}
                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleRazorpayCheckout}
                                className="w-full bg-[#FF6A00] hover:bg-[#ff7b1a] text-[#0A1F44] font-extrabold py-3.5 rounded-xl text-xs hover:scale-[1.01] active:scale-[0.99] transition duration-300 shadow-lg shadow-[#FF6A00]/20"
                            >
                                Process Wallet Topup
                            </button>
                        </div>
                    </div>

                </div>

                {rechargeError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl">
                        {rechargeError}
                    </div>
                )}

                {rechargeSuccess && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs p-3.5 rounded-xl">
                        {rechargeSuccess}
                    </div>
                )}

                {/* Transactions Ledger Table */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Wallet Transaction Audit Ledger</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                            <tr className="border-b border-[#687280]/20 text-[#687280] uppercase tracking-wider text-[10px]">
                                <th className="py-2.5 px-4">Date</th>
                                <th className="py-2.5 px-4 text-center">Type</th>
                                <th className="py-2.5 px-4 text-right">Amount</th>
                                <th className="py-2.5 px-4 text-right">Opening Balance</th>
                                <th className="py-2.5 px-4 text-right">Closing Balance</th>
                                <th className="py-2.5 px-4">Reference ID / Remarks</th>
                                <th className="py-2.5 px-4 text-center">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-[#687280]/10">
                            {/* Direct mapping (Client-side filtering removed as backend handles it per currency) */}
                            {transactions.map(tx => {
                                const symbol = selectedCurrency === "INR" ? "₹" : selectedCurrency === "AED" ? "AED " : selectedCurrency === "USD" ? "$" : "£";
                                return (
                                    <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                                        <td className="py-3 px-4 text-center font-semibold text-white">{tx.transactionType}</td>
                                        <td className={`py-3 px-4 text-right font-bold ${tx.amount > 0 ? "text-green-500" : "text-red-400"}`}>
                                            {tx.amount > 0 ? `+${symbol}${tx.amount.toFixed(2)}` : `-${symbol}${Math.abs(tx.amount).toFixed(2)}`}
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-500">{symbol}{tx.openingBalance.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right text-white">{symbol}{tx.closingBalance.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-gray-400">
                                        <span
                                            className="font-mono block text-[10px] text-[#FF6A00] font-bold">{tx.referenceId}</span>
                                            <span className="text-[11px] block">{tx.remarks}</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.status === "Completed" ? "bg-green-500/10 text-green-500" :
                                    tx.status === "HOLD" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                            }`}>
                              {tx.status}
                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-6 text-center text-gray-500">No ledger transactions
                                        recorded.
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

            {/* 💳 RAZORPAY STANDARD CHECKOUT MODAL (ORANGE BRAND THEME #FF6A00) */}
            {showRazorpayModal && razorpayOrderData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col md:flex-row text-gray-800 font-sans">

                        {/* Left Header Panel (Orange Theme #FF6A00) */}
                        <div className="w-full md:w-5/12 bg-gradient-to-b from-[#FF6A00] to-[#e05b00] p-6 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-white text-sm">
                                        P
                                    </div>
                                    <span className="font-extrabold text-sm tracking-wide">PHOENIX COMMERCE</span>
                                </div>

                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                                    <span className="text-[10px] text-white/80 block uppercase tracking-wider font-bold">Price Summary</span>
                                    <span className="text-3xl font-black text-white">₹{razorpayOrderData.amount.toFixed(2)}</span>
                                </div>

                                <div className="text-xs text-white/90 space-y-1">
                                    <span className="text-[10px] text-white/70 block">Using as merchant</span>
                                    <span className="font-semibold">{user?.mobileNumber || user?.email || "+91 99999 99999"}</span>
                                </div>
                            </div>

                            <div className="pt-6 relative z-10 flex items-center justify-between text-[11px] text-white/80 border-t border-white/20 mt-4">
                                <span>Secured by <strong>Razorpay</strong></span>
                                <span className="bg-black/20 px-2 py-0.5 rounded font-mono text-[9px]">Live Checkout</span>
                            </div>
                        </div>

                        {/* Right Options & Payment Panel */}
                        <div className="w-full md:w-7/12 bg-white flex flex-col justify-between">

                            {/* Top Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Payment Options</span>
                                <button
                                    onClick={() => setShowRazorpayModal(false)}
                                    className="text-gray-400 hover:text-gray-600 font-bold text-lg px-2"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex flex-1 min-h-[310px]">
                                {/* Method Tabs Sidebar */}
                                <div className="w-1/3 bg-gray-50 border-r border-gray-200 text-xs space-y-1 p-2">
                                    <button
                                        onClick={() => setActiveRazorpayTab("upi")}
                                        className={`w-full text-left p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                                            activeRazorpayTab === "upi" ? "bg-white shadow text-[#FF6A00] border border-[#FF6A00]/20" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span>⚡ UPI QR</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveRazorpayTab("cards")}
                                        className={`w-full text-left p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                                            activeRazorpayTab === "cards" ? "bg-white shadow text-[#FF6A00] border border-[#FF6A00]/20" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span>💳 Cards</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveRazorpayTab("netbanking")}
                                        className={`w-full text-left p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                                            activeRazorpayTab === "netbanking" ? "bg-white shadow text-[#FF6A00] border border-[#FF6A00]/20" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span>🏦 Netbanking</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveRazorpayTab("wallet")}
                                        className={`w-full text-left p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                                            activeRazorpayTab === "wallet" ? "bg-white shadow text-[#FF6A00] border border-[#FF6A00]/20" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span>👛 Wallet</span>
                                    </button>
                                </div>

                                {/* Tab Content Panel */}
                                <div className="w-2/3 p-4 flex flex-col justify-between">
                                    {activeRazorpayTab === "upi" && (
                                        <div className="space-y-3">
                                            <div className="text-center bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                                                <span className="text-[10px] text-gray-500 font-semibold block mb-1.5">Scan QR using any UPI App</span>
                                                <div className="w-24 h-24 mx-auto bg-white p-1.5 border border-gray-300 rounded-xl shadow-sm flex items-center justify-center">
                                                    <img
                                                        src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=phoenixcommerce@razorpay&pn=PhoenixCommerce&am=100.00"
                                                        alt="Razorpay UPI QR Code"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex justify-center gap-1.5 mt-2">
                                                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">GPay</span>
                                                    <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">PhonePe</span>
                                                    <span className="text-[9px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full font-bold">Paytm</span>
                                                </div>
                                            </div>

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
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="font-semibold text-gray-600 text-[10px]">Expiry (MM/YY)</label>
                                                    <input type="text" placeholder="12/28" className="w-full p-2 border border-gray-300 rounded-lg outline-none" defaultValue="08/28" />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-gray-600 text-[10px]">CVV</label>
                                                    <input type="password" placeholder="•••" className="w-full p-2 border border-gray-300 rounded-lg outline-none" defaultValue="123" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeRazorpayTab === "netbanking" && (
                                        <div className="space-y-2 text-xs">
                                            <span className="font-bold text-gray-600 block text-[10px]">Select Popular Bank</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button className="p-2 border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] font-bold rounded-lg text-left text-[11px]">HDFC Bank</button>
                                                <button className="p-2 border border-gray-200 rounded-lg text-left font-semibold text-gray-700 text-[11px]">ICICI Bank</button>
                                                <button className="p-2 border border-gray-200 rounded-lg text-left font-semibold text-gray-700 text-[11px]">State Bank of India</button>
                                                <button className="p-2 border border-gray-200 rounded-lg text-left font-semibold text-gray-700 text-[11px]">Axis Bank</button>
                                            </div>
                                        </div>
                                    )}

                                    {activeRazorpayTab === "wallet" && (
                                        <div className="space-y-2 text-xs">
                                            <span className="font-bold text-gray-600 block text-[10px]">Select Wallet</span>
                                            <div className="space-y-1.5">
                                                <div className="p-2 border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] font-bold rounded-lg flex justify-between text-[11px]">
                                                    <span>Paytm Wallet</span>
                                                    <span>✓ Selected</span>
                                                </div>
                                                <div className="p-2 border border-gray-200 rounded-lg text-gray-700 font-semibold text-[11px]">PhonePe Wallet</div>
                                                <div className="p-2 border border-gray-200 rounded-lg text-gray-700 font-semibold text-[11px]">Mobikwik</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Verify and Pay Button */}
                                    <button
                                        onClick={handleConfirmSimulatedRazorpay}
                                        disabled={isVerifyingRazorpay}
                                        className="w-full mt-3 bg-[#0A1F44] hover:bg-[#FF6A00] text-white font-extrabold py-3 rounded-xl text-xs transition duration-300 shadow-md flex items-center justify-center gap-2"
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
                </div>
            )}
        </>
    );
};

export default WalletLedger;
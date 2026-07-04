import React, { useState, useEffect } from "react";
import API from "../../services/api";

const Cancelled = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCountryCode = (s) => {
    if (s.receiverCountry) return s.receiverCountry;
    const toStr = (s.to || "").toUpperCase().trim();
    if (toStr.endsWith("US") || toStr.includes("UNITED STATES") || toStr.includes("NEW YORK") || toStr.includes("MALIBU") || toStr.includes("LOS ANGELES")) return "US";
    if (toStr.endsWith("IN") || toStr.includes("INDIA") || toStr.includes("DELHI") || toStr.includes("MUMBAI")) return "IN";
    if (toStr.endsWith("UK") || toStr.includes("UNITED KINGDOM") || toStr.includes("LONDON")) return "GB";
    if (toStr.endsWith("JP") || toStr.includes("JAPAN") || toStr.includes("TOKYO")) return "JP";
    if (toStr.endsWith("DE") || toStr.includes("GERMANY") || toStr.includes("FRANKFURT")) return "DE";
    return "IN";
  };

  const formatTariff = (chargeVal, s) => {
    const amount = parseFloat(chargeVal || 0);
    const country = getCountryCode(s).toUpperCase().trim();
    const shouldConvert = amount > 15;

    switch (country) {
      case "IN":
      case "INDIA":
        return `₹${amount.toFixed(2)}`;
      case "US":
      case "USA":
      case "UNITED STATES":
        const usdVal = shouldConvert ? amount * 0.012 : amount;
        return `$${usdVal.toFixed(2)}`;
      case "GB":
      case "UK":
      case "UNITED KINGDOM":
        const gbpVal = shouldConvert ? amount * 0.0094 : amount;
        return `£${gbpVal.toFixed(2)}`;
      case "DE":
      case "FR":
      case "IT":
      case "ES":
      case "NL":
      case "BE":
      case "AT":
      case "IE":
      case "GERMANY":
      case "FRANCE":
        const eurVal = shouldConvert ? amount * 0.011 : amount;
        return `€${eurVal.toFixed(2)}`;
      case "CA":
      case "CANADA":
        const cadVal = shouldConvert ? amount * 0.016 : amount;
        return `C$${cadVal.toFixed(2)}`;
      case "AU":
      case "AUSTRALIA":
        const audVal = shouldConvert ? amount * 0.018 : amount;
        return `A$${audVal.toFixed(2)}`;
      case "JP":
      case "JAPAN":
        const jpyVal = shouldConvert ? amount * 1.88 : amount;
        return `¥${jpyVal.toFixed(2)}`;
      default:
        const defVal = shouldConvert ? amount * 0.012 : amount;
        return `$${defVal.toFixed(2)}`;
    }
  };

  const fetchCancelled = async () => {
    try {
      const res = await API.get("/shipments/cancelled");
      setCancellations(res.data);
    } catch (error) {
      console.warn("Express API cancelled shipments unreachable. Using simulated logs.", error.message);
      setCancellations([
        { _id: "647a3e80f12c9c381a4b9053", shipmentId: "PHX-SH-09378", store: "Zara Store Ind", customer: "Tony Stark", courier: "Delhivery Air", weight: 0.50, discrepancyDetails: "Merchant Out of Stock", discrepancyStatus: "None", deltaCost: 0.0, dateCancelled: "2026-05-21T10:00:00Z", charge: 4.10 },
        { _id: "647a3e80f12c9c381a4b9059", shipmentId: "PHX-SH-09372", store: "Apex Spares", customer: "Dominic Toretto", courier: "BlueDart Express", weight: 3.40, discrepancyDetails: "RTO - Customer Address Untraceable", discrepancyStatus: "Pending", deltaCost: 3.50, dateCancelled: "2026-05-20T10:00:00Z", charge: 12.50 },
        { _id: "647a3e80f12c9c381a4b905a", shipmentId: "PHX-SH-09369", store: "ElectroSphere", customer: "Keanu Reeves", courier: "Delhivery Air", weight: 0.80, discrepancyDetails: "Customer requested cancellation prior to dispatch", discrepancyStatus: "None", deltaCost: 0.0, dateCancelled: "2026-05-18T10:00:00Z", charge: 2.80 },
        { _id: "647a3e80f12c9c381a4b905b", shipmentId: "PHX-SH-09361", store: "Luxe Couture", customer: "Sophia Loren", courier: "BlueDart Express", weight: 1.50, discrepancyDetails: "RTO - COD Payment Rejected on Delivery", discrepancyStatus: "None", deltaCost: 5.00, dateCancelled: "2026-05-15T10:00:00Z", charge: 9.80 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelled();
  }, []);

  const handleProcessRefund = async (id, store, currentStatus) => {
    if (currentStatus === "Approved (Merchant)") {
      alert("This shipment ledger is already successfully refunded.");
      return;
    }
    try {
      await API.post(`/shipments/${id}/refund`);
      alert(`Success: Approved balance refund of shipping charge back to ${store}'s wallet.`);
      fetchCancelled();
    } catch (error) {
      alert(`Error processing refund: ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredCancellations = cancellations.filter(c => {
    return c.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (c.discrepancyDetails && c.discrepancyDetails.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const getRefundStatusText = (c) => {
    if (c.discrepancyStatus === "Approved (Merchant)") return "Refunded";
    if (c.discrepancyStatus === "Pending") return "Processing";
    return "Not Applicable";
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Cancelled & RTO Shipments</h1>
          <p className="text-sm text-[#687280]">Review platform-failed dispatches, manage Return-to-Origin (RTO) penalty charges, and authorize wallet refunds.</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl border border-red-500/20 text-red-600 text-center font-bold text-xs bg-red-500/5">
          {cancellations.length} Cancelled Logs
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Shipment, Store, Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">SHIPMENT ID</th>
                <th className="pb-3 font-semibold">MERCHANT STORE</th>
                <th className="pb-3 font-semibold">CUSTOMER</th>
                <th className="pb-3 font-semibold">COURIER</th>
                <th className="pb-3 font-semibold">CANCELLATION/RTO EXCEPTION DETAIL</th>
                <th className="pb-3 font-semibold">RTO FEE CHARGED</th>
                <th className="pb-3 font-semibold">CANCELLED DATE</th>
                <th className="pb-3 font-semibold text-center">REFUND STATUS</th>
                <th className="pb-3 font-semibold text-right">ADMIN DECISION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">
                    Loading cancelled shipments log...
                  </td>
                </tr>
              ) : (
                filteredCancellations.map((c) => {
                  const rStatusText = getRefundStatusText(c);
                  return (
                    <tr key={c._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                      <td className="py-4 font-mono font-bold text-[#FF6A00]/80">{c.shipmentId}</td>
                      <td className="py-4 font-semibold text-[#0A1F44]">{c.store}</td>
                      <td className="py-4 font-semibold text-[#0A1F44]">{c.customer}</td>
                      <td className="py-4 text-[#687280]">{c.courier}</td>
                      <td className="py-4 font-medium text-red-600/80 leading-relaxed max-w-xs">{c.discrepancyDetails || "Merchant cancelled request"}</td>
                      <td className="py-4 font-mono font-bold text-[#FF6A00]/85">
                        {c.deltaCost > 0 ? `${formatTariff(c.deltaCost, c)} RTO Fee` : "None"}
                      </td>
                      <td className="py-4 text-[#687280]">{c.dateCancelled ? new Date(c.dateCancelled).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                      <td className="py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            rStatusText === "Refunded"
                              ? "bg-green-100 text-green-600"
                              : rStatusText === "Processing"
                              ? "bg-[#FF6A00]/10 text-[#FF6A00] animate-pulse"
                              : "bg-gray-400/10 text-[#687280]"
                          }`}
                        >
                          {rStatusText}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleProcessRefund(c._id, c.store, c.discrepancyStatus)}
                          disabled={rStatusText === "Refunded" || rStatusText === "Not Applicable"}
                          className={`p-1 px-3 rounded text-[10px] font-bold transition-all border ${
                            rStatusText === "Refunded" || rStatusText === "Not Applicable"
                              ? "bg-gray-700/50 text-gray-500 border-transparent cursor-not-allowed"
                              : "bg-[#FF6A00]/10 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-black border-[#FF6A00]/20 hover:border-transparent shadow-md"
                          }`}
                        >
                          {rStatusText === "Refunded" ? "Settled Balance" : rStatusText === "Not Applicable" ? "No Refund" : "Approve Refund"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
              {!loading && filteredCancellations.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500 font-semibold">
                    🎉 Splendid! No cancelled shipments match search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cancelled;

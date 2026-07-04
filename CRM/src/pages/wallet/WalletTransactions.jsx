import React, { useState, useEffect } from "react";
import API from "../../services/api";

const WalletTransactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState(null);

  const [transactions, setTransactions] = useState([
    { id: "TX-90284", store: "ElectroSphere", amount: "+₹2,500.00", type: "Manual Credit", status: "Completed", date: "May 24, 2026", method: "Admin Sophia (Credit Top-up)", ref: "REF-EL893B" },
    { id: "TX-90283", store: "HoloWear Tech", amount: "-₹420.50", type: "Shipment Debit", status: "Completed", date: "May 24, 2026", method: "Automatic API Debit", ref: "REF-HW7291A" },
    { id: "TX-90282", store: "Luxe Couture", amount: "+₹5,000.00", type: "Gateway Deposit", status: "Completed", date: "May 23, 2026", method: "Stripe Checkout", ref: "ch_3M7s8fGj294K" },
    { id: "TX-90281", store: "Zara Store Ind", amount: "-₹150.00", type: "Discrepancy Penalty", status: "Completed", date: "May 22, 2026", method: "Weight Dispute Hold", ref: "REF-ZR8921D" },
    { id: "TX-90280", store: "Aura Essentials", amount: "+₹1,200.00", type: "Gateway Deposit", status: "Pending", date: "May 22, 2026", method: "Bank Wire Transfer", ref: "WIRE-AU920X" },
    { id: "TX-90279", store: "Apex Spares", amount: "+₹3,000.00", type: "Gateway Deposit", status: "Failed", date: "May 20, 2026", method: "Razorpay Gateway", ref: "pay_failed_ap902" },
  ]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await API.get("/wallet/admin/transactions");
        if (res.data && res.data.length > 0) {
          // Normalize models to page representation
          const normalized = res.data.map(tx => {
            const isCredit = tx.amount >= 0;
            return {
              id: tx.referenceId || tx._id,
              store: tx.userId?.companyName || tx.userId?.name || "Unknown Store",
              amount: `${isCredit ? "+" : "-"}${tx.currency || "INR"} ${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              type: tx.transactionType || "Recharge",
              status: tx.status || "Completed",
              date: new Date(tx.createdAt).toLocaleDateString(),
              method: tx.createdBy || "System",
              ref: tx.referenceId || "N/A"
            };
          });
          setTransactions(normalized);
        }
      } catch (error) {
        console.warn("Express API financial ledger unreachable. Using fallback simulated state.", error.message);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = (tx.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (tx.store?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (tx.ref?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || (tx.status?.toLowerCase() || "") === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Financial Transaction Ledger</h1>
          <p className="text-sm text-[#687280]">Track gateway deposits, shipment debits, weight discrepancy adjustments, and manual administrative credits.</p>
        </div>
        <button 
          onClick={() => alert("Exporting full financial ledger to CSV...")}
          className="px-4 py-2 bg-[#FF6A00] text-[#0A1F44] font-bold hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV Ledger
        </button>
      </div>

      {/* Filter Options */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Tx ID, store, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2">
          {["all", "Completed", "Pending", "Failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                statusFilter === status
                  ? "bg-[#FF6A00] text-[#0A1F44] font-bold border-transparent"
                  : "bg-[#E5E7EB]/40 text-[#687280] hover:text-[#0A1F44] border-[#687280]/20"
              }`}
            >
              {status === "all" ? "All Logs" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">TRANSACTION ID</th>
                <th className="pb-3 font-semibold">STORE NAME</th>
                <th className="pb-3 font-semibold">VOLUME</th>
                <th className="pb-3 font-semibold">TRANSACTION TYPE</th>
                <th className="pb-3 font-semibold">PAYMENT METHOD</th>
                <th className="pb-3 font-semibold">LEDGER DATE</th>
                <th className="pb-3 font-semibold text-center">STATUS</th>
                <th className="pb-3 font-semibold text-right">OPERATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {filteredTransactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-[#E5E7EB]/30 transition-colors">
                  <td className="py-4 font-mono font-bold text-[#FF6A00]/80">{tx.id}</td>
                  <td className="py-4 font-semibold text-[#0A1F44]">{tx.store}</td>
                  <td className={`py-4 font-extrabold ${tx.amount.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex px-2 py-0.5 rounded bg-[#E5E7EB]/40 border border-[#687280]/20 text-[10px] text-[#687280] font-medium">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 text-[#687280]">{tx.method}</td>
                  <td className="py-4 text-[#687280]">{tx.date}</td>
                  <td className="py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        tx.status === "Completed"
                          ? "bg-green-100 text-green-600"
                          : tx.status === "Pending"
                          ? "bg-[#FF6A00]/10 text-[#FF6A00]"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-1 px-3 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 hover:text-[#0A1F44] rounded text-[10px] font-bold border border-[#687280]/20 transition-colors"
                    >
                      Audit Record
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 font-semibold">
                    🔍 No transactions found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-[#FF6A00]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#0A1F44] px-6 py-4 border-b border-[#687280]/20 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#0A1F44]">Audit Transaction Log</h3>
                <p className="text-[10px] text-[#FF6A00] font-semibold">{selectedTx.id}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-[#687280] hover:text-[#0A1F44] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Store Name</span>
                  <span className="font-semibold text-[#0A1F44] text-sm">{selectedTx.store}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Transaction Status</span>
                  <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase ${
                    selectedTx.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : selectedTx.status === "Pending"
                      ? "bg-[#FF6A00]/10 text-[#FF6A00]"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {selectedTx.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#687280]/20 pt-3">
                <span className="block text-[10px] text-gray-500 font-bold uppercase">Ledger Amount Change</span>
                <span className={`text-xl font-extrabold ${selectedTx.amount.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                  {selectedTx.amount}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#687280]/20 pt-3">
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Log Category</span>
                  <span className="text-[#0A1F44] font-semibold">{selectedTx.type}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Settled Date</span>
                  <span className="text-[#0A1F44] font-mono">{selectedTx.date}</span>
                </div>
              </div>

              <div className="border-t border-[#687280]/20 pt-3">
                <span className="block text-[10px] text-gray-500 font-bold uppercase">Billing Source / Authorizer</span>
                <span className="text-[#0A1F44] font-semibold">{selectedTx.method}</span>
              </div>

              <div className="border-t border-[#687280]/20 pt-3">
                <span className="block text-[10px] text-gray-500 font-bold uppercase">System Gateway Reference</span>
                <span className="text-[#FF6A00] font-mono font-bold">{selectedTx.ref}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#0A1F44]/50 border-t border-[#687280]/20 flex gap-2">
              <button
                onClick={() => alert(`Re-sending PDF receipt for receipt ${selectedTx.id}...`)}
                className="flex-1 py-2 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 text-[#0A1F44] text-[10px] font-bold rounded-lg border border-[#687280]/20 transition-all text-center"
              >
                Send Invoice Copy
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2 bg-[#FF6A00] text-[#0A1F44] font-bold hover:bg-orange-500 text-[10px] font-bold rounded-lg transition-all text-center"
              >
                Dismiss Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTransactions;

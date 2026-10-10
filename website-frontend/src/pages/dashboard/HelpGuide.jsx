import React, { useState } from "react";
import { Info, Globe, CreditCard, Box, FileText, Search } from "lucide-react";
import { ARAMEX_SUPPORTED_COUNTRIES, ARAMEX_SUPPORTED_CURRENCIES } from "../../utils/countries";

const HelpGuide = () => {
    const [activeSection, setActiveSection] = useState("structure");
    const [countrySearch, setCountrySearch] = useState("");
    const [currencySearch, setCurrencySearch] = useState("");

    const productTypes = [
        { code: "PPX", name: "Priority Parcel Express", desc: "Fastest door-to-door delivery for international parcels." },
        { code: "EPX", name: "Economy Parcel Express", desc: "Cost-effective international shipping for less urgent parcels." },
        { code: "PDX", name: "Priority Document Express", desc: "Dedicated express service for paper documents and letters." }
    ];

    const fileFields = [
        { field: "receiverName", required: true, desc: "Full name of the recipient.", ex: "John Doe" },
        { field: "receiverMobile", required: true, desc: "Contact number with country code.", ex: "+971501234567" },
        { field: "receiverEmail", required: true, desc: "Email address of the recipient.", ex: "customer@example.com" },
        { field: "receiverAddressLine1", required: true, desc: "Primary delivery address.", ex: "123 Sheikh Zayed Road" },
        { field: "receiverCity", required: true, desc: "Destination city.", ex: "Dubai" },
        { field: "receiverState", required: true, desc: "State or province code.", ex: "DU" },
        { field: "receiverCountry", required: true, desc: "2-letter ISO country code.", ex: "AE" },
        { field: "receiverPincode", required: true, desc: "Zip/Postal code.", ex: "00000" },
        { field: "weight", required: true, desc: "Dead weight of the package in kg.", ex: "1.5" },
        { field: "length", required: true, desc: "Length of the package in cm.", ex: "10" },
        { field: "width", required: true, desc: "Width of the package in cm.", ex: "10" },
        { field: "height", required: true, desc: "Height of the package in cm.", ex: "10" },
        { field: "numberOfPieces", required: true, desc: "Total number of boxes/pieces.", ex: "1" },
        { field: "productDescription", required: true, desc: "Brief description of the package contents.", ex: "Electronics and Apparel" },
        { field: "customsValue", required: true, desc: "Declared monetary value for customs.", ex: "150.00" },
        { field: "customsCurrency", required: true, desc: "3-letter currency code for customs value.", ex: "USD" },
        { field: "productType", required: true, desc: "3-letter service code (e.g., PPX).", ex: "PPX" }
    ];

    const filteredCountries = ARAMEX_SUPPORTED_COUNTRIES.filter(c =>
        c.label.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.value.toLowerCase().includes(countrySearch.toLowerCase())
    );

    const filteredCurrencies = ARAMEX_SUPPORTED_CURRENCIES.filter(c =>
        c.label.toLowerCase().includes(currencySearch.toLowerCase()) ||
        c.value.toLowerCase().includes(currencySearch.toLowerCase())
    );

    return (
        <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
            <div className="border-b border-[#687280]/20 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info size={22} className="text-[#FF6A00]" />
                    Bulk Upload Format Guide
                </h3>
                <p className="text-xs text-gray-400 mt-2">
                    Reference the exact codes and column structures required for your Excel and CSV bulk uploads below.
                    Invalid codes or missing mandatory columns will cause row validation to fail.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5 w-fit">
                <button
                    onClick={() => setActiveSection("structure")}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeSection === "structure" ? "bg-[#FF6A00] text-[#0A1F44]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                    <FileText size={14} /> File Structure Guide
                </button>
                <button
                    onClick={() => setActiveSection("countries")}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeSection === "countries" ? "bg-[#FF6A00] text-[#0A1F44]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                    <Globe size={14} /> Country Codes
                </button>
                <button
                    onClick={() => setActiveSection("currencies")}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeSection === "currencies" ? "bg-[#FF6A00] text-[#0A1F44]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                    <CreditCard size={14} /> Currency Codes
                </button>
                <button
                    onClick={() => setActiveSection("products")}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeSection === "products" ? "bg-[#FF6A00] text-[#0A1F44]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                    <Box size={14} /> Product Types
                </button>
            </div>

            {/* Render Content Based on Active Section */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5">

                {activeSection === "countries" && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Supported Country ISO Codes</h4>
                                <p className="text-xs text-gray-400 mt-1">Use the exact 2-letter ISO code in the <code className="text-white bg-black/40 px-1 py-0.5 rounded">receiverCountry</code> column.</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-2.5 text-[#687280]" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search country..."
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-[#0A1F44] border border-white/10 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-[#FF6A00] transition"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2 pt-2">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((c) => (
                                    <div key={c.value} className="p-3 bg-[#0A1F44] border border-white/10 rounded-xl flex flex-col gap-1 hover:border-[#FF6A00]/50 transition">
                                        <span className="font-mono text-[#FF6A00] font-bold">{c.value}</span>
                                        <span className="text-[10px] text-gray-300 truncate" title={c.label}>{c.label}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500 col-span-full py-4 text-center">No countries matched your search.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeSection === "currencies" && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Supported Currency Codes</h4>
                                <p className="text-xs text-gray-400 mt-1">Use the exact 3-letter currency code in the <code className="text-white bg-black/40 px-1 py-0.5 rounded">customsCurrency</code> column.</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-2.5 text-[#687280]" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search currency..."
                                    value={currencySearch}
                                    onChange={(e) => setCurrencySearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-[#0A1F44] border border-white/10 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-[#FF6A00] transition"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2 pt-2">
                            {filteredCurrencies.length > 0 ? (
                                filteredCurrencies.map((c) => (
                                    <div key={c.value} className="p-3 bg-[#0A1F44] border border-white/10 rounded-xl flex flex-col gap-1 hover:border-[#FF6A00]/50 transition">
                                        <span className="font-mono text-[#FF6A00] font-bold">{c.value}</span>
                                        <span className="text-[10px] text-gray-300 truncate" title={c.label}>{c.label}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500 col-span-full py-4 text-center">No currencies matched your search.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeSection === "products" && (
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider border-b border-white/10 pb-4">Supported Product Types (Aramex)</h4>
                        <p className="text-xs text-gray-400 mb-4 pt-2">Use the 3-letter code in the <code className="text-white bg-black/40 px-1 py-0.5 rounded">productType</code> column.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {productTypes.map((pt) => (
                                <div key={pt.code} className="p-4 bg-[#0A1F44] border border-white/10 rounded-xl flex flex-col gap-2">
                                    <span className="font-mono text-[#FF6A00] text-lg font-bold">{pt.code}</span>
                                    <span className="text-xs font-bold text-white">{pt.name}</span>
                                    <span className="text-[10px] text-gray-400 leading-relaxed">{pt.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === "structure" && (
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider border-b border-white/10 pb-4">Excel & CSV Column Structure</h4>
                        <p className="text-xs text-gray-400 mt-2 mb-4">This table explains every required and optional column in your bulk upload file. Columns must match the exact spelling and casing.</p>

                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full text-left text-xs bg-[#0A1F44]">
                                <thead>
                                <tr className="bg-black/30 border-b border-white/10 text-gray-300">
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Column Header</th>
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Required</th>
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Description</th>
                                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Example</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                {fileFields.map((field, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition">
                                        <td className="py-3 px-4 font-mono font-bold text-[#FF6A00]">{field.field}</td>
                                        <td className="py-3 px-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${field.required ? "bg-red-500/10 text-red-400" : "bg-gray-500/20 text-gray-400"}`}>
                                                    {field.required ? "Yes" : "No"}
                                                </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-300">{field.desc}</td>
                                        <td className="py-3 px-4 text-gray-400 italic">{field.ex}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default HelpGuide;
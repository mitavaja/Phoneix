import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select option",
    searchPlaceholder = "Search options...",
    searchable = true,
    disabled = false,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen]);

    // Auto-focus search input when opened
    useEffect(() => {
        if (isOpen && searchable) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 60);
            return () => clearTimeout(timer);
        } else {
            setSearchQuery("");
        }
    }, [isOpen, searchable]);

    // Selected Option
    const selectedOption = useMemo(() => {
        return options.find((opt) => opt.value === value) || { label: placeholder, value: "" };
    }, [options, value, placeholder]);

    // Filtered options based on search query
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase().trim();
        return options.filter((opt) => {
            const matchLabel = opt.label?.toLowerCase().includes(q);
            const matchValue = opt.value?.toString().toLowerCase().includes(q);
            const matchEmail = opt.email?.toLowerCase().includes(q);
            const matchCompany = opt.companyName?.toLowerCase().includes(q);
            return matchLabel || matchValue || matchEmail || matchCompany;
        });
    }, [options, searchQuery]);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`relative w-full cursor-pointer rounded-xl bg-white py-2.5 pl-3.5 pr-10 text-left border transition-all text-xs shadow-sm flex items-center justify-between ${
                    isOpen
                        ? "border-[#FF6A00] ring-1 ring-[#FF6A00]"
                        : "border-[#687280]/25 hover:border-[#687280]/40"
                } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
            >
                <div className="truncate pr-2">
                    <span className="block truncate font-semibold text-[#0A1F44]">
                        {selectedOption.label}
                    </span>
                    {(selectedOption.companyName || selectedOption.email) && (
                        <span className="block truncate text-[10px] text-gray-500 font-normal">
                            {selectedOption.companyName ? `${selectedOption.companyName} • ` : ""}
                            {selectedOption.email}
                        </span>
                    )}
                </div>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-[#FF6A00]" : ""
                        }`}
                    />
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 mt-1.5 w-full rounded-xl bg-white shadow-2xl border border-[#687280]/20 z-[9999] overflow-hidden animate-fade-in">
                    {/* Search Box Header */}
                    {searchable && (
                        <div className="p-2 border-b border-[#687280]/15 bg-gray-50/80">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full bg-white border border-[#687280]/25 focus:border-[#FF6A00] rounded-lg py-1.5 pl-8 pr-7 text-xs text-[#0A1F44] outline-none transition"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto custom-scrollbar p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-4 text-center text-xs text-gray-500 font-medium">
                                No matching results found
                            </div>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = opt.value === value;
                                return (
                                    <div
                                        key={opt.value ?? idx}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`cursor-pointer select-none rounded-lg py-2 pl-8 pr-3 text-xs transition-colors relative flex flex-col justify-center ${
                                            isSelected
                                                ? "bg-[#FF6A00]/10 text-[#FF6A00] font-bold"
                                                : "text-[#0A1F44] hover:bg-gray-100/80 font-medium"
                                        }`}
                                    >
                                        {isSelected && (
                                            <span className="absolute left-2.5 top-2.5 text-[#FF6A00]">
                                                <Check className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                        <span className="truncate">{opt.label}</span>
                                        {(opt.companyName || opt.email) && (
                                            <span className="text-[10px] text-gray-400 font-normal truncate">
                                                {opt.companyName ? `${opt.companyName} • ` : ""}
                                                {opt.email}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer counter */}
                    <div className="px-3 py-1.5 bg-gray-50 border-t border-[#687280]/10 flex justify-between items-center text-[10px] text-gray-500 font-semibold">
                        <span>{filteredOptions.length} of {options.length} options</span>
                        {searchQuery && (
                            <span className="text-[#FF6A00] font-bold">Filtered</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
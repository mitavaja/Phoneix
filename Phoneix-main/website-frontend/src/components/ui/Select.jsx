import React, { useState } from "react";
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

export const Select = ({
    options = [],
    value,
    onChange,
    placeholder = "Search and select...",
    disabled = false,
    className = "",
}) => {
    const [query, setQuery] = useState("");

    const selectedOption = options.find((opt) => opt.value === value) || null;

    const filteredOptions =
        query === ""
            ? options
            : options.filter((opt) =>
                opt.label.toLowerCase().includes(query.toLowerCase())
            );

    return (
        <div className={`relative w-full ${className || ""}`.trim()}>
            <Combobox
                value={selectedOption}
                onChange={(selectedObj) => {
                    if (selectedObj) onChange(selectedObj.value);
                }}
                onClose={() => setQuery("")}
                disabled={disabled}
            >
                <div className="relative">
                    <ComboboxInput
                        className={`w-full py-3 pl-4 pr-10 rounded-xl text-xs outline-none transition-all duration-300 ${
                            disabled
                                ? "bg-[#E5E7EB]/50 border border-[#687280]/20 text-[#687280] cursor-not-allowed"
                                : "bg-white border border-[#687280]/30 text-[#0A1F44] placeholder-[#687280]/60 focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] shadow-sm"
                        }`}
                        displayValue={(opt) => (opt ? opt.label : "")}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={placeholder}
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3 group">
                        <ChevronDown
                            size={16}
                            className={`transition-colors ${
                                disabled ? "text-gray-400" : "text-[#687280] group-hover:text-[#0A1F44]"
                            }`}
                        />
                    </ComboboxButton>
                </div>

                <ComboboxOptions
                    anchor="bottom"
                    transition
                    className="w-[var(--input-width)] z-50 mt-1 max-h-60 overflow-auto rounded-xl bg-white border border-[#687280]/20 shadow-[0_12px_40px_rgba(10,31,68,0.12)] py-1 text-xs focus:outline-none custom-scrollbar transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
                >
                    {filteredOptions.length === 0 && query !== "" ? (
                        <div className="relative cursor-default select-none py-3 px-4 text-[#687280]">
                            No results found.
                        </div>
                    ) : (
                        filteredOptions.map((opt) => (
                            <ComboboxOption
                                key={opt.value}
                                value={opt}
                                className="group relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-[#0A1F44] transition-colors data-[focus]:bg-[#FF6A00]/10 data-[focus]:text-[#FF6A00]"
                            >
                                <span className="block truncate group-data-[selected]:font-bold group-data-[selected]:text-[#FF6A00]">
                                    {opt.label}
                                </span>
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#FF6A00] invisible group-data-[selected]:visible">
                                    <Check size={14} strokeWidth={3} />
                                </span>
                            </ComboboxOption>
                        ))
                    )}
                </ComboboxOptions>
            </Combobox>
        </div>
    );
};
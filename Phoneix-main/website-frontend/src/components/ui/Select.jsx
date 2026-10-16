import React, {useState} from "react";
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from "@headlessui/react";
import {Check, ChevronDown} from "lucide-react";

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
                                ? "bg-[#0A1F44]/50 border border-[#687280]/20 text-gray-500 cursor-not-allowed"
                                : "bg-[#0A1F44] border border-white/10 text-white focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]"
                        }`}
                        displayValue={(opt) => (opt ? opt.label : "")}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={placeholder}
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3 group">
                        <ChevronDown
                            size={16}
                            className={`transition-colors ${
                                disabled ? "text-gray-600" : "text-gray-400 group-hover:text-white"
                            }`}
                        />
                    </ComboboxButton>
                </div>

                <ComboboxOptions
                    anchor="bottom"
                    transition
                    className="w-[var(--input-width)] z-50 mt-1 max-h-60 overflow-auto rounded-xl bg-[#071630] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] py-1 text-xs focus:outline-none custom-scrollbar transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
                >
                    {filteredOptions.length === 0 && query !== "" ? (
                        <div className="relative cursor-default select-none py-3 px-4 text-gray-400">
                            No results found.
                        </div>
                    ) : (
                        filteredOptions.map((opt) => (
                            <ComboboxOption
                                key={opt.value}
                                value={opt}
                                className="group relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-gray-300 transition-colors data-[focus]:bg-[#FF6A00]/10 data-[focus]:text-[#FF6A00]"
                            >
                                <span
                                    className="block truncate group-data-[selected]:font-bold group-data-[selected]:text-[#FF6A00]">
                                    {opt.label}
                                </span>
                                <span
                                    className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#FF6A00] invisible group-data-[selected]:visible">
                                    <Check size={14} strokeWidth={3}/>
                                </span>
                            </ComboboxOption>
                        ))
                    )}
                </ComboboxOptions>
            </Combobox>
        </div>
    );
};
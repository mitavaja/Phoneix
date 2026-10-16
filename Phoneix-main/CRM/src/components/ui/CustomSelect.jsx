import React, {Fragment} from "react";
import {Listbox, Transition} from "@headlessui/react";
import {Check, ChevronDown} from "lucide-react";

export  const CustomSelect = ({options, value, onChange, placeholder = "Select option"}) => {
    const selectedOption = options.find((opt) => opt.value === value) || {label: placeholder, value: ""};

    return (
        <div className="relative z-50">
            <Listbox value={value} onChange={onChange}>
                <div className="relative mt-1">
                    <Listbox.Button
                        className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-[#687280]/20 focus:outline-none focus-visible:border-[#FF6A00] focus-visible:ring-1 focus-visible:ring-[#FF6A00] sm:text-xs text-[#0A1F44]">
                        <span className="block truncate font-semibold">{selectedOption.label}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true"/>
            </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options
                            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-xs z-50 custom-scrollbar">
                            {options.map((opt, optIdx) => (
                                <Listbox.Option
                                    key={optIdx}
                                    className={({active}) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                            active ? "bg-[#FF6A00]/10 text-[#FF6A00]" : "text-[#0A1F44]"
                                        }`
                                    }
                                    value={opt.value}
                                >
                                    {({selected}) => (
                                        <>
                      <span className={`block truncate ${selected ? "font-bold" : "font-semibold"}`}>
                        {opt.label}
                      </span>
                                            {selected ? (
                                                <span
                                                    className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#FF6A00]">
                          <Check className="h-4 w-4" aria-hidden="true"/>
                        </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
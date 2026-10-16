import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

export const Dropdown = ({ buttonLabel, icon: Icon, items = [], buttonClassName = "", menuClassName = "" }) => {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button
                    className={`inline-flex w-full justify-center items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${buttonClassName}`}
                >
                    {Icon && <Icon size={14} />}
                    {buttonLabel}
                    <ChevronDown size={14} className="ml-1 -mr-1" aria-hidden="true" />
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className={`absolute right-0 mt-2 w-56 origin-top-right divide-y divide-[#687280]/10 rounded-xl bg-[#071630] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden ${menuClassName}`}
                >
                    <div className="py-1">
                        {items.map((item, index) => (
                            <Menu.Item key={index}>
                                {({ active }) => (
                                    <button
                                        onClick={item.onClick}
                                        className={`${
                                            active ? "bg-[#FF6A00]/10 text-[#FF6A00]" : "text-gray-300"
                                        } group flex w-full items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors`}
                                    >
                                        {item.icon && <item.icon size={14} className={active ? "text-[#FF6A00]" : "text-gray-400"} />}
                                        {item.label}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};
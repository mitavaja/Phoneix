import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export const Modal = ({
                          isOpen,
                          onClose,
                          onConfirm,
                          title,
                          description,
                          confirmText = "Confirm",
                          cancelText = "Cancel",
                          variant = "confirm",
                          isLoading = false,
                      }) => {
    // Styling configurations based on variant
    const variants = {
        danger: {
            icon: AlertTriangle,
            iconColor: "text-red-500",
            iconBg: "bg-red-500/10",
            border: "border-red-500/20",
            btnClass: "bg-red-500 hover:bg-red-600 text-white",
        },
        success: {
            icon: CheckCircle,
            iconColor: "text-green-500",
            iconBg: "bg-green-500/10",
            border: "border-green-500/20",
            btnClass: "bg-green-500 hover:bg-green-600 text-white",
        },
        info: {
            icon: Info,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-500/10",
            border: "border-blue-500/20",
            btnClass: "bg-blue-500 hover:bg-blue-600 text-white",
        },
        confirm: {
            icon: AlertTriangle,
            iconColor: "text-[#FF6A00]",
            iconBg: "bg-[#FF6A00]/10",
            border: "border-[#FF6A00]/20",
            btnClass: "bg-[#FF6A00] hover:brightness-110 text-[#0A1F44]",
        }
    };

    const config = variants[variant] || variants.confirm;
    const Icon = config.icon;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={isLoading ? () => {} : onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        {/* Modal Panel */}
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-3xl bg-[#0A1F44] border ${config.border} p-6 text-left align-middle shadow-2xl transition-all`}>
                                {/* Header / Icon */}
                                <div className="flex items-start justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}>
                                        <Icon className={`h-6 w-6 ${config.iconColor}`} aria-hidden="true" />
                                    </div>
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="text-gray-400 hover:text-white transition disabled:opacity-50"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="mt-4">
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white">
                                        {title}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {description}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition disabled:opacity-50"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 rounded-xl px-4 py-3 text-xs font-extrabold transition flex items-center justify-center gap-2 disabled:opacity-50 ${config.btnClass}`}
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                    >
                                        {isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>}
                                        {confirmText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
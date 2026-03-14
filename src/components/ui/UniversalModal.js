"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Universal Modal Component
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Function to close the modal
 * @param {string} title - Modal title
 * @param {string} description - Modal content/message
 * @param {string} type - 'success', 'error', 'warning', 'info', or 'confirm'
 * @param {function} onConfirm - Function to run on confirm (for 'confirm' type)
 * @param {string} confirmText - Text for the confirm button
 * @param {string} cancelText - Text for the cancel button
 */
export default function UniversalModal({
    isOpen,
    onClose,
    title,
    description,
    type = "info",
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmDisabled = false
}) {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
        }
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const getIcon = () => {
        switch (type) {
            case "success": return <CheckCircle className="size-5 text-success" />;
            case "error": return <AlertCircle className="size-5 text-danger" />;
            case "warning": return <AlertTriangle className="size-5 text-warning" />;
            case "confirm": return <AlertTriangle className="size-5 text-danger" />;
            case "info":
            default: return <Info className="size-5 text-brand" />;
        }
    };

    const getConfirmButtonStyle = () => {
        switch (type) {
            case "error":
            case "confirm":
                return "bg-danger text-white hover:bg-danger/90 border border-danger";
            case "success":
                return "bg-success text-white hover:bg-success/90 border border-success";
            case "warning":
                return "bg-warning text-white hover:bg-warning/90 border border-warning";
            case "info":
            default:
                return "bg-primary text-obsidian hover:bg-primary/90 border border-primary";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-obsidian/40 backdrop-blur-[2px]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-[440px] bg-[#0c0c0c] border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_12px_34px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                {getIcon()}
                                <h3 className="text-base font-semibold text-primary tracking-tight">
                                    {title}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-secondary hover:text-primary transition-colors p-1.5 -mr-1.5 rounded-md hover:bg-white/5"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 bg-[#0a0a0a]">
                            <p className="text-[14px] text-secondary leading-relaxed whitespace-pre-wrap">
                                {description}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 bg-[#0c0c0c] border-t border-white/5">
                            {type === "confirm" && (
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-primary hover:bg-white/5 border border-white/10 rounded-lg transition-colors"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={type === "confirm" ? onConfirm : onClose}
                                disabled={confirmDisabled}
                                className={`px-4 py-2 text-sm font-medium shadow-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonStyle()}`}
                            >
                                {type === "confirm" ? confirmText : "Close"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

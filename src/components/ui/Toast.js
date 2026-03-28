"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast({
    isOpen,
    onClose,
    title,
    description,
    type = "info",
    position = "bottom-right",
    duration = 3000
}) {
    
    useEffect(() => {
        if (isOpen && duration !== Infinity) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case "success": return <CheckCircle className="size-4 text-success" />;
            case "error": return <AlertCircle className="size-4 text-danger" />;
            case "warning": return <AlertTriangle className="size-4 text-warning" />;
            case "info":
            default: return <Info className="size-4 text-brand" />;
        }
    };

    const positionClasses = position === "top-right" 
        ? "top-4 right-4 items-start" 
        : "bottom-4 right-4 items-end";
    
    const slideY = position === "top-right" ? -20 : 20;

    return (
        <div className={`fixed z-50 flex flex-col pointer-events-none p-4 sm:p-6 w-full max-w-[420px] ${positionClasses}`}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: slideY }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="pointer-events-auto w-full bg-[#0c0c0c]/95 backdrop-blur-md border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden flex flex-col"
                    >
                        <div className="flex gap-3 px-4 py-3 bg-[#0a0a0a] items-start relative">
                            <div className="flex-shrink-0 mt-0.5">
                                {getIcon()}
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-1 pr-6">
                                <h4 className="text-sm font-semibold text-primary tracking-tight">
                                    {title}
                                </h4>
                                {description && (
                                    <p className="text-xs text-secondary leading-relaxed">
                                        {description}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute right-2 top-2 text-secondary hover:text-primary transition-colors p-1.5 rounded-md hover:bg-white/5"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

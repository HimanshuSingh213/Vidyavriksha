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
        ? "top-2 sm:top-4 right-2 sm:right-4 items-start" 
        : "bottom-2 sm:bottom-4 right-2 sm:right-4 items-end";
    
    const slideY = position === "top-right" ? -15 : 15;

    return (
        <div className={`fixed z-50 flex flex-col pointer-events-none p-3 sm:p-6 w-full max-w-[320px] sm:max-w-[400px] ${positionClasses}`}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: slideY }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="pointer-events-auto w-full bg-[#0c0c0c]/95 backdrop-blur-md border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_6px_20px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden flex flex-col"
                    >
                        <div className="flex gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 bg-[#0a0a0a] items-start relative">
                            <div className="flex-shrink-0 mt-0.5">
                                {getIcon()}
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 pr-5 sm:pr-6">
                                <h4 className="text-xs sm:text-sm font-semibold text-primary tracking-tight">
                                    {title}
                                </h4>
                                {description && (
                                    <p className="text-[10px] sm:text-xs text-secondary leading-normal sm:leading-relaxed">
                                        {description}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 text-secondary hover:text-primary transition-colors p-1 sm:p-1.5 rounded-md hover:bg-white/5"
                            >
                                <X className="size-3.5 sm:size-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

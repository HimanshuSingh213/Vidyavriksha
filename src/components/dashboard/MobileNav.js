"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, GraduationCap, Settings, LogOut, Sliders, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LiquidTooltip from "@/components/rareui/LiquidTooltip";
import { signOut } from "next-auth/react";

export default function MobileNav({ navLinks, user, signOutAction, settingsHref }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Auto-close drawer on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white/5 border border-white/8 text-secondary hover:text-primary hover:bg-white/10 transition-colors"
                aria-label="Open navigation menu"
            >
                <Menu size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/60 md:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.aside
                            key="drawer"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 26, stiffness: 300 }}
                            className="fixed top-0 left-0 z-50 h-full w-72 bg-obsidian border-r border-white/8 flex flex-col md:hidden"
                        >
                            {/* Drawer Header */}
                            <div className="h-20 flex items-center justify-between px-6 border-b border-white/8">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded bg-brand flex items-center justify-center mr-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                                        <span className="font-bold text-white tracking-tighter">
                                            <GraduationCap size={20} />
                                        </span>
                                    </div>
                                    <span className="font-semibold tracking-wide text-primary">Vidyavriksha</span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                                    aria-label="Close navigation menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                {navLinks.map((link) => (
                                    <MobileNavItem
                                        key={link.href}
                                        {...link}
                                        active={pathname === link.href}
                                    />
                                ))}
                            </nav>

                            {/* Profile & Actions */}
                            <div className="p-4 border-t border-white/8 space-y-3">
                                {/* User Info */}
                                {user && (
                                    <div className="flex items-center gap-3 px-2 mb-2">
                                        {user.image && (
                                            <Image
                                                src={user.image}
                                                alt="User"
                                                width={32}
                                                height={32}
                                                className="rounded-full border border-white/10"
                                            />
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-primary truncate w-32">
                                                {user.name}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Link
                                    title="GPA Simulator"
                                    href="/dashboard/simulator"
                                    className={`w-full h-8 py-2 px-3 flex items-center gap-2 text-xs font-semibold hover:bg-white/5 border border-white/8 rounded-lg transition-all duration-300 ease-in-out hover:text-primary ${pathname === "/dashboard/simulator" ? "bg-brand/10 border-brand/20 text-brand font-bold" : "text-secondary"}`}
                                >
                                    <Sliders size={18} />
                                    <span>GPA Simulator</span>
                                </Link>

                                {/* Settings & Logout */}
                                <div className="flex flex-row gap-2 w-full">
                                    <Link
                                        title="Settings"
                                        href={settingsHref}
                                        className={`w-1/2 h-8 py-2 flex items-center justify-center text-xs font-medium hover:bg-white/5 border border-white/8 rounded-lg transition-colors duration-300 ease-in-out hover:text-primary ${
                                            pathname === settingsHref
                                                ? "bg-white/5 border border-white/8 text-primary"
                                                : "text-secondary"
                                        }`}
                                    >
                                        <Settings size={18} />
                                    </Link>

                                    <button
                                        onClick={async () => {
                                            await signOut({ callbackUrl: "/login" });
                                        }}
                                        className="w-1/2 h-8 py-2 flex items-center justify-center text-xs font-medium hover:bg-white/5 border border-white/8 rounded-lg transition-colors text-danger/80 hover:text-primary cursor-pointer"
                                        title="logOut"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>

                                <div className="flex justify-center items-center pt-2 border-t border-white/5">
                                    <LiquidTooltip text="GitHub: HimanshuSingh213" placement="top">
                                        <a
                                            href="https://github.com/HimanshuSingh213"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors duration-300 text-[10px] font-sans font-light tracking-wide"
                                        >
                                            <Github size={12} className="opacity-80" />
                                            <span>Created by Himanshu</span>
                                        </a>
                                    </LiquidTooltip>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function MobileNavItem({ href, icon, label, action, active }) {
    return (
        <motion.div whileTap={{ scale: 0.99 }}>
            <Link
                href={href}
                className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors duration-300 ease-in-out text-sm font-medium border ${
                    active
                        ? "bg-brand/10 text-brand border-brand/20"
                        : "text-secondary hover:text-primary hover:bg-white/5 border-transparent"
                }`}
            >
                {icon}
                <div
                    className={`flex flex-col w-full gap-px justify-center items-start transition-colors duration-300 ${
                        active ? "text-primary" : "text-secondary hover:text-primary"
                    }`}
                >
                    {label}
                    {action && (
                        <span className="font-mono text-[10px] font-light">{action}</span>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}

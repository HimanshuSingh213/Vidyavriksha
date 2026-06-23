"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Settings, Sliders, Github, GraduationCap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion } from "framer-motion";
import LiquidTooltip from "@/components/rareui/LiquidTooltip";

export default function SidebarNav({ navLinks, user, signOutAction }) {
    const pathname = usePathname();

    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sidebarCollapsed");
            return saved === "true";
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
    }, [isCollapsed]);

    return (
        <aside
            style={{ width: isCollapsed ? "68px" : "256px" }}
            className="border-r border-white/8 bg-white/1 hidden md:flex flex-col shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center px-4 border-b border-white/8 shrink-0 overflow-hidden justify-between">
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center">
                            <Image
                                src="/logo.svg"
                                alt="Vidyavriksha Logo"
                                width={28}
                                height={28}
                                className="h-7 w-7"
                            />
                            <span className="font-semibold tracking-wide truncate text-primary">Vidyavriksha</span>
                        </div>
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-white/5 transition-colors cursor-pointer"
                            title="Collapse Sidebar"
                        >
                            <PanelLeftClose size={16} />
                        </button>
                    </>
                ) : (
                    <div className="flex justify-center items-center w-full">
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-white/5 transition-colors cursor-pointer"
                            title="Expand Sidebar"
                        >
                            <PanelLeftOpen size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navLinks.map((link) => (
                    <NavItem
                        key={link.href}
                        {...link}
                        active={pathname === link.href}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </nav>

            <div className="flex flex-col gap-2">
                {/* Simulator Button */}
                <div className="mx-2 flex items-center justify-center">
                    <Link
                        title={isCollapsed ? "GPA Simulator" : undefined}
                        href="/dashboard/simulator"
                        className={`flex items-center hover:bg-white/5 border border-white/8 rounded-lg transition-all duration-300 ease-in-out hover:text-primary ${isCollapsed ? "justify-center w-10 h-10 shrink-0" : "w-full h-8 py-2 px-3 gap-2 text-xs font-semibold"
                            } ${pathname === "/dashboard/simulator" ? "bg-brand/10 border-brand/20 text-brand font-bold" : "text-secondary"}`}
                    >
                        <Sliders size={18} />
                        {!isCollapsed && <span className="truncate">GPA Simulator</span>}
                    </Link>
                </div>

                {/* Bottom Section: Profile & Settings */}
                <div className={`p-4 border-t border-white/8 shrink-0 flex flex-col ${isCollapsed ? "items-center gap-3" : "space-y-3"}`}>


                    {/* User Info Display */}
                    {user && (
                        <div className={`flex items-center overflow-hidden w-full ${isCollapsed ? "justify-center mb-1" : "gap-3 px-2 mb-2"}`}>
                            {user.image && (
                                <Image
                                    src={user.image}
                                    alt="User"
                                    width={32}
                                    height={32}
                                    className="rounded-full border border-white/10 shrink-0"
                                />
                            )}
                            {!isCollapsed && (
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-medium text-primary truncate w-32">{user.name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`flex gap-2 ${isCollapsed ? "flex-col items-center justify-center w-full" : "flex-row w-full"}`}>
                        <Link
                            title={isCollapsed ? "Settings" : undefined}
                            href="/dashboard/settings"
                            className={`flex items-center justify-center hover:bg-white/5 border border-white/8 rounded-lg transition-colors duration-300 ease-in-out hover:text-primary ${isCollapsed ? "w-10 h-10 shrink-0" : "w-1/2 h-8 py-2 text-xs font-medium"
                                } ${pathname === "/dashboard/settings" ? "bg-white/5 border border-white/8 text-primary" : "text-secondary"}`}
                        >
                            <Settings size={18} />
                        </Link>

                        <form className={isCollapsed ? "w-10 h-10 shrink-0" : "w-1/2"} action={signOutAction} title="logOut">
                            <button className="w-full h-full py-2 flex items-center justify-center hover:bg-white/5 border border-white/8 rounded-lg transition-colors text-danger/80 hover:text-primary cursor-pointer">
                                <LogOut size={18} />
                            </button>
                        </form>
                    </div>

                    <div className="flex justify-center items-center pt-2 border-t border-white/5 w-full">
                        <LiquidTooltip text="GitHub: HimanshuSingh213" placement={isCollapsed ? "right" : "top"}>
                            <a
                                href="https://github.com/HimanshuSingh213"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center hover:text-primary transition-colors duration-300 text-secondary ${isCollapsed ? "p-1" : "gap-1.5 text-[10px] font-sans font-light tracking-wide"
                                    }`}
                            >
                                <Github size={12} className="opacity-80" />
                                {!isCollapsed && <span>Created by Himanshu</span>}
                            </a>
                        </LiquidTooltip>
                    </div>

                </div>
            </div>

        </aside>
    );
}

function NavItem({ href, icon, label, action, active, isCollapsed }) {
    return (
        <motion.div
            whileTap={{ scale: 0.99 }}
        >
            <Link
                href={href}
                title={isCollapsed ? label : undefined}
                className={`flex items-center rounded-lg transition-colors duration-300 ease-in-out border ${isCollapsed ? "justify-center p-2.5 h-10 w-10 mx-auto" : "gap-3 px-2 py-1.5"
                    } ${active
                        ? "bg-brand/10 text-brand border-brand/20"
                        : "text-secondary hover:text-primary hover:bg-white/5 border-transparent"
                    }`}
            >
                {icon}
                {!isCollapsed && (
                    <div className="flex flex-col w-full gap-px justify-center items-start overflow-hidden transition-colors duration-300">
                        <span className="truncate w-full block text-sm font-medium">{label}</span>
                        {action && <span className="font-mono text-[10px] font-light truncate w-full block">{action}</span>}
                    </div>
                )}
            </Link>
        </motion.div>
    );
}
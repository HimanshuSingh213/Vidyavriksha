"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Settings } from "lucide-react";

export default function SidebarNav({ navLinks, user, signOutAction }) {
    const pathname = usePathname();

    return (
        <>
            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navLinks.map((link) => (
                    <NavItem
                        key={link.href}
                        {...link}
                        active={pathname === link.href}
                    />
                ))}
            </nav>

            {/* Bottom Section: Profile & Settings */}
            <div className="p-4 border-t border-white/8 space-y-3">
                {/* User Info Display */}
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
                            <span className="text-xs font-medium text-primary truncate w-32">{user.name}</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-row gap-2 w-full">
                    <Link
                        title="Settings"
                        href="/dashboard/settings"
                        className="w-1/2 h-8 py-2 flex items-center justify-center text-xs font-medium hover:bg-white/5 border border-white/8 rounded-lg transition-colors duration-300 ease-in-out text-secondary hover:text-primary"
                    >
                        {<Settings size={18} />}
                    </Link>

                    <form className="w-1/2" action={signOutAction} title="logOut">
                        <button className="w-full h-8 py-2 flex items-center justify-center text-xs font-medium hover:bg-white/5 border border-white/8 rounded-lg transition-colors text-danger/80 hover:text-primary">
                            {<LogOut size={18} />}
                        </button>
                    </form>
                </div>

            </div>
        </>
    );
}

function NavItem({ href, icon, label, action, active }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors duration-300 ease-in-out text-sm font-medium border ${active
                ? "bg-brand/10 text-brand border-brand/20"
                : "text-secondary hover:text-primary hover:bg-white/5 border-transparent"
                }`}
        >
            {icon}
            <div className={`flex flex-col w-full gap-px justify-center items-start transition-colors duration-300 ${active ? "text-primary" : "text-secondary hover:text-primary"
                }`}>
                {label}
                {action && <span className="font-mono text-[10px] font-light">{action}</span>}
            </div>
        </Link>
    );
}
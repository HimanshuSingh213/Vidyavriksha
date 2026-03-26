"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useUser } from "@/app/Context/UserContext";

export default function DashboardUIWrapper({ session, children }) {
    const pathname = usePathname();
    const isSettingsPage = pathname === "/dashboard/settings";
    const { displayName } = useUser();
    const effectiveName = displayName || session?.user?.name;

    if (isSettingsPage) {
        return <div className="min-h-full bg-obsidian p-6 md:p-10 font-sans">
            {children}
        </div>;
    }

    return (
        <>
            <header className="flex justify-between items-center px-6 py-3 md:px-10 mt-1 font-sans border-b border-b-secondary/15">
                <DashboardHeader userName={effectiveName} />

                <div className="flex flex-row items-center gap-2">
                    <div className="max-w-60">
                        <p className="text-center">{effectiveName}</p>
                        {/* <div className="flex flex-row justify-center items-center gap-1 text-xs text-success max-w-40 truncate line-clamp-1">
                            <p className="text-[10px]">Btech CSE-DS</p>
                            <span className="text-[10px]">•</span>
                            <p className="text-[10px]">Sem 2</p>
                        </div> */}
                    </div>
                    {session?.user?.image && (
                        <Image
                            src={session?.user.image}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="rounded-full border border-white/8"
                        />
                    )}
                </div>
            </header>
            {children}
        </>
    );
}
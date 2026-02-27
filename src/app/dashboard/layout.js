import { auth, signOut } from "../../../auth";
import { GraduationCap, LayoutDashboard, CalendarDays, FolderArchive, TrendingUp } from "lucide-react";
import SidebarNav from "@/components/dashboard/SideBarNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Image from "next/image";

export default async function DashboardLayout({ children }) {
    const session = await auth();

    // Server Action for Sign Out
    async function handleSignOut() {
        "use server";
        await signOut({ redirectTo: "/login" });
    }

    const navLinks = [
        { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Command Center", action: "Dashboard" },
        { href: "/dashboard/timetable", icon: <CalendarDays size={18} />, label: "Daily Operations", action: "TimeTable and Attendance" },
        { href: "/dashboard/vault", icon: <FolderArchive size={18} />, label: "Academic Vault", action: "Historical Data" },
        { href: "/dashboard/analytics", icon: <TrendingUp size={18} />, label: "Deep Analytics", action: "Charts and Insights" },
    ];

    return (
        <div className="h-screen bg-obsidian flex font-sans text-primary">
            {/* THE SIDEBAR */}
            <aside className="w-64 border-r border-white/8 bg-white/1 hidden md:flex flex-col">

                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-white/8">
                    <div className="w-8 h-8 rounded bg-brand flex items-center justify-center mr-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                        <span className="font-bold text-white tracking-tighter"><GraduationCap /></span>
                    </div>
                    <span className="font-semibold tracking-wide">Vidyavriksha</span>
                </div>

                {/* Client Side Logic for Nav & Bottom Profile */}
                <SidebarNav
                    navLinks={navLinks}
                    user={session?.user}
                    signOutAction={handleSignOut}
                />
            </aside>

            {/* THE MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto relative ">
                {/* HEADER */}
                <header className="flex justify-between items-center px-6 py-3 md:px-10 mt-1 font-sans border-b border-b-secondary/15">

                    <DashboardHeader userName={session?.user?.name} />

                    <div className="flex flex-row items-center gap-2">
                        <div className="max-w-60">
                            <p className="text-center">{session?.user?.name}</p>
                            <div className="flex flex-row justify-center items-center gap-1 text-xs text-success max-w-40 truncate line-clamp-1">
                                <p className="text-[10px] max-w-2/3 truncate">Btech CSE-DS</p>
                                <span className="text-[10px]">•</span>
                                <p className="text-[10px]">Sem 2</p>
                            </div>
                        </div>
                        <div>
                            {/* Display Google Profile Picture */}
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

                    </div>

                </header>
                {children}
            </main>
        </div>
    );
}

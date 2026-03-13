import { auth, signOut } from "@/auth";
import { GraduationCap, LayoutDashboard, CalendarDays, FolderArchive, TrendingUp } from "lucide-react";
import SidebarNav from "@/components/dashboard/SideBarNav";
import DashboardUIWrapper from "@/components/dashboard/DashboardUIWrapper";
import { UserProvider } from "../Context/UserContext";
import { getUserSettings } from "@/actions/userSettings";

export default async function DashboardLayout({ children }) {
    const session = await auth();
    const userSettings = await getUserSettings();

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
            {/* sidebar */}
            <aside className="w-64 border-r border-white/8 bg-white/1 hidden md:flex flex-col">

                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-white/8">
                    <div className="w-8 h-8 rounded bg-brand flex items-center justify-center mr-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                        <span className="font-bold text-white tracking-tighter"><GraduationCap /></span>
                    </div>
                    <span className="font-semibold tracking-wide">Vidyavriksha</span>
                </div>

                {/* Nav & Bottom Profile */}
                <SidebarNav
                    navLinks={navLinks}
                    user={session?.user}
                    signOutAction={handleSignOut}
                />
            </aside>

            {/* THE MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto relative">

                <UserProvider session={session} initialData={userSettings}>
                    <DashboardUIWrapper session={session}>
                        {children}
                    </DashboardUIWrapper>
                </UserProvider>

            </main>
        </div>
    );
}

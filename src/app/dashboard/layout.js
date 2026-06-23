import { auth, signOut } from "@/auth";
import { LayoutDashboard, CalendarDays, FolderArchive, TrendingUp } from "lucide-react";
import SidebarNav from "@/components/dashboard/SideBarNav";
import MobileNav from "@/components/dashboard/MobileNav";
import DashboardUIWrapper from "@/components/dashboard/DashboardUIWrapper";
import { UserProvider } from "../Context/UserContext";
import { getUserSettings } from "@/actions/userSettings";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const userSettings = await getUserSettings();

    // Server Action for Sign Out
    async function handleSignOut() {
        "use server";
        await signOut({ redirectTo: "/login" });
    }

    const navLinks = [
        { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Command Center", action: "Dashboard" },
        { href: "/dashboard/timetable", icon: <CalendarDays size={18} />, label: "Daily Operations", action: "Weekly Timetable" },
        { href: "/dashboard/vault", icon: <FolderArchive size={18} />, label: "Academic Vault", action: "Historical Data" },
        { href: "/dashboard/analytics", icon: <TrendingUp size={18} />, label: "Deep Analytics", action: "Charts and Insights" },
    ];

    return (
        <div className="h-screen bg-obsidian flex font-sans text-primary">
            {/* Mobile Navigation Drawer */}
            <MobileNav
                navLinks={navLinks}
                user={session?.user}
                signOutAction={handleSignOut}
                settingsHref="/dashboard/settings"
            />

            {/* sidebar */}
            <SidebarNav
                navLinks={navLinks}
                user={session?.user}
                signOutAction={handleSignOut}
            />

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

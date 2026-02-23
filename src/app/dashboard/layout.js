import { auth, signOut } from "../../../auth";
import { GraduationCap, LayoutDashboard, CalendarDays, FolderArchive, TrendingUp } from "lucide-react";
import SidebarNav from "@/components/dashboard/SideBarNav";

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
            <main className="flex-1 overflow-y-auto relative">
                {children}
            </main>
        </div>
    );
}
// export default function DashboardLayout({ children }) {
//     const pathname = usePathname();
//     return (
//         <div className="min-h-screen bg-obsidian flex font-sans text-primary">

//             {/* THE SIDEBAR */}
//             <aside className="w-64 border-r border-white/8 bg-white/1 hidden md:flex flex-col">

//                 {/* Logo Area */}
//                 <div className="h-20 flex items-center px-6 border-b border-white/8">
//                     <div className="w-8 h-8 rounded bg-brand flex items-center justify-center mr-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
//                         <span className="font-bold text-white tracking-tighter">{<GraduationCap />}</span>
//                     </div>
//                     <span className="font-semibold tracking-wide">Vidyavriksha</span>
//                 </div>

//                 {/* Navigation Links */}
//                 <nav className="flex-1 px-4 py-6 space-y-2">
//                     <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Command Center" action="Dashboard" active={pathname === "/dashboard"} />
//                     <NavItem href="/dashboard/timetable" icon={<CalendarDays size={18} />} label="Daily Operations" action="TimeTable and Attendace" active={pathname === "/dashboard/timetable"} />
//                     <NavItem href="/dashboard/vault" icon={<FolderArchive size={18} />} label="Academic Vault" action="Historical Data" active={pathname === "/dashboard/vault"} />
//                     <NavItem href="/dashboard/analytics" icon={<TrendingUp size={18} />} label="Deep Analytics" action="Charts and Insights" active={pathname === "/dashboard/analytics"} />
//                 </nav>

//                 {/* Bottom Settings Link */}
//                 <div className="p-2 border-t border-white/8">
//                     <div>
//                         {/* Display Google Profile Picture */}
//                         {session?.user?.image && (
//                             <Image
//                                 src={session.user.image}
//                                 alt="Profile"
//                                 width={40}
//                                 height={40}
//                                 className="rounded-full border border-white/8"
//                             />
//                         )}
//                     </div>
//                     <div>
//                         <NavItem href="/dashboard/settings" icon={<Settings size={18} />} label="System Settings" />
//                         {/* Server-side Sign Out Form */}
//                         <form action={async () => {
//                             "use server";
//                             await signOut({ redirectTo: "/login" });
//                         }}>
//                             <button className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg transition-colors text-danger">
//                                 System Disconnect
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             </aside>

//             {/* THE MAIN CONTENT AREA */}
//             <main className="flex-1 overflow-y-auto relative">
//                 {children}
//             </main>

//         </div>
//     );
// }


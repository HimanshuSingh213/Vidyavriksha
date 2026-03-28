"use client";

import { usePathname } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["600", "700"],
    display: "swap",
});

const routeHeadings = [
    {
        match: "/dashboard",
        heading: "Command Center",
        subHeading: null,
    },
    {
        match: "/dashboard/timetable",
        heading: "Daily Operation",
        subHeading: "Timetable & attendance tracking",
    },
    {
        match: "/dashboard/vault",
        heading: "Academic Vault",
        subHeading: "Historical semester data & marks breakdown",
    },
    {
        match: "/dashboard/analytics",
        heading: "Deep Analytics",
        subHeading: "Performance charts & insights",
    },
];

function getMatchedRoute(pathname) {
    const matches = routeHeadings.filter(
        ({ match }) => pathname === match || pathname.startsWith(`${match}/`)
    );

    if (matches.length === 0) {
        return routeHeadings[0];
    }

    return matches.sort((a, b) => b.match.length - a.match.length)[0];
}

function getHeadingForRoute(route, userName) {
    if (route.match === "/dashboard") {
        return {
            heading: route.heading,
            subHeading: `Welcome back, ${userName || "Engineer"}.`,
        };
    }

    return {
        heading: route.heading,
        subHeading: route.subHeading,
    };
}

export default function DashboardHeader({ userName }) {
    const pathname = usePathname();
    const currentRoute = useMemo(() => getMatchedRoute(pathname), [pathname]);
    const { heading, subHeading } = getHeadingForRoute(currentRoute, userName);

    return (
        <div className="min-h-[52px] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentRoute.match}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{
                        duration: 0.35,
                        ease: [0.3, 1, 0.4, 1],
                    }}
                >
                    <h1 className={`${spaceGrotesk.className} text-xl font-bold tracking-tight`}>{heading}</h1>
                    <p className="text-secondary text-xs font-sans">{subHeading}</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

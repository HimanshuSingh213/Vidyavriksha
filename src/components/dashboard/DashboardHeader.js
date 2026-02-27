"use client";

import { usePathname } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

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

const headingVariants = {
    enter: (direction) => ({
        y: direction >= 0 ? 14 : -14,
        opacity: 0,
    }),
    center: {
        y: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        y: direction >= 0 ? -14 : 14,
        opacity: 0,
    }),
};

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
    const currentIndex = useMemo(
        () => routeHeadings.findIndex(({ match }) => match === currentRoute.match),
        [currentRoute.match]
    );

    const previousIndexRef = useRef(currentIndex);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const previousIndex = previousIndexRef.current;

        if (currentIndex > previousIndex) {
            setDirection(1);
        } else if (currentIndex < previousIndex) {
            setDirection(-1);
        } else {
            setDirection(0);
        }

        previousIndexRef.current = currentIndex;
    }, [currentIndex]);

    const { heading, subHeading } = getHeadingForRoute(currentRoute, userName);

    return (
        <div className="min-h-[52px] overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                    key={currentRoute.match}
                    custom={direction}
                    variants={headingVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
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

"use client";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { CircleCheck, CircleX, Monitor, FlaskConical, Ban } from "lucide-react";
import { markAttendance } from "@/actions/Attendance";

export default function ModernLectureItem({
    subjectId,
    slotId,
    startTime,
    endTime,
    subject,
    code,
    teacher,
    room,
    type = "Lecture", // Default to Lecture
    initialStatus,
    currentDateIso
}) {
    const isLab = subject?.toLowerCase().includes("lab") || code?.toLowerCase().endsWith("p");
    const displayType = isLab ? "Lab" : "Lecture";

    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, addOptimisticStatus] = useOptimistic(
        initialStatus,
        (currentState, newStatus) => newStatus
    );

    const handleMarkAttendance = (status) => {
        const newStatus = optimisticStatus === status ? "" : status;
        startTransition(async () => {
            addOptimisticStatus(newStatus);
            try {
                await markAttendance(subjectId, slotId, newStatus, currentDateIso);
            } catch (error) {
                console.error("Failed to save attendance:", error);
            }
        });
    };

    function formatTime(mins) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }

    const [currentTime, setCurrentTime] = useState(0);
    
    useEffect(() => {
        const now = new Date();
        setCurrentTime(now.getHours() * 60 + now.getMinutes());
        
        const interval = setInterval(() => {
            const d = new Date();
            setCurrentTime(d.getHours() * 60 + d.getMinutes());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const isTodayLecture =
        new Date(currentDateIso).toDateString() === new Date().toDateString();

    const isOngoing = isTodayLecture && currentTime >= startTime && currentTime < endTime;

    return (
        <div className={`group relative flex items-center p-4 mb-3 rounded-2xl border transition-all duration-500 overflow-hidden
            ${isOngoing ? "bg-brand/5 border-brand/60 shadow-[0_0_20px_rgba(var(--brand-rgb),0.1)] ring-1 ring-brand/20" : "bg-white/2 border-white/5 hover:border-white/20"}
        `}>
            {/* Background Glow for Ongoing */}
            {isOngoing && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none animate-pulse"></div>
            )}

            {/* left section */}
            <div className="flex flex-col items-center justify-center min-w-[70px] pr-4 border-r border-white/10">
            <div className="flex flex-row items-center gap-2">
                 <span className="text-lg font-mono font-bold text-primary/80 tracking-tighter">
                    {formatTime(startTime)}
                </span>
                -
                <span className="text-lg font-mono font-bold text-primary/80 tracking-tighter">
                    {formatTime(endTime)}
                </span>
            </div>
               
                {isOngoing && (
                    <div className="mt-2 px-2 py-0.5 bg-brand text-primary text-[10px] font-semibold rounded-xl uppercase tracking-tighter">
                        LIVE
                    </div>
                )}
            </div>

            {/* content Section */}
            <div className="grow pl-6">
                <div className="flex items-center gap-2 mb-1.5">
                    {displayType === "Lab" ? (
                        <FlaskConical size={12} className="text-brand" />
                    ) : (
                        <Monitor size={12} className="text-brand" />
                    )}
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
                        {displayType}
                    </span>
                </div>
                
                <h3 className="text-lg font-semibold font-sans text-primary tracking-tight leading-tight">
                    {subject}
                </h3>
                
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-secondary/80">{code}</span>
                    <span className="text-[10px] text-white/10">•</span>
                    <span className="text-xs text-secondary/80">{room}</span>
                    <span className="text-[10px] text-white/10">•</span>
                    <span className="text-xs text-secondary/80">{teacher}</span>
                </div>
            </div>

            {/* right section */}
            <div className="flex items-center gap-3">
                {/* Status Badge */}
                {optimisticStatus && (
                    <div className={`hidden md:flex px-2 py-1 rounded-full text-[10px] font-semibold uppercase border
                        ${optimisticStatus === "Attended" ? "bg-success/10 border-success/30 text-success" : ""}
                        ${optimisticStatus === "Missed" ? "bg-warning/10 border-warning/30 text-warning" : ""}
                        ${optimisticStatus === "Cancelled" ? "bg-danger/10 border-danger/30 text-danger" : ""}
                    `}>
                        {optimisticStatus}
                    </div>
                )}

                {/* Control Group */}
                <div className="flex items-center p-1 gap-2">
                    {/* Attended Button */}
                    <button
                        onClick={() => handleMarkAttendance("Attended")}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 
                            ${optimisticStatus === "Attended" ? "bg-success/20 text-success" : "text-secondary hover:text-success bg-white/5 rounded-lg hover:bg-success/10"}
                        `}
                    >
                        <CircleCheck size={18} />
                    </button>

                    {/* Missed Button */}
                    <button
                        onClick={() => handleMarkAttendance("Missed")}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 
                            ${optimisticStatus === "Missed" ? "bg-warning/20 text-warning" : "text-secondary hover:text-warning bg-white/5 rounded-lg hover:bg-warning/10"}
                        `}
                    >
                        <CircleX size={18} />
                    </button>

                    {/* Cancelled Button */}
                    <button
                        onClick={() => handleMarkAttendance("Cancelled")}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 
                            ${optimisticStatus === "Cancelled" ? "bg-danger/20 text-danger" : "text-secondary hover:text-danger bg-white/5 hover:bg-danger/10"}
                        `}
                    >
                        <Ban size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

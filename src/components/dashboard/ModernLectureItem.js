"use client";
import { useEffect, useState } from "react";
import { Monitor, FlaskConical, Trash2, Loader2 } from "lucide-react";
import { deleteTimetableSlot } from "@/actions/subject";
import { useRouter } from "next/navigation";

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
    currentDateIso,
    setToastConfig = () => {},
    setModalConfig = () => {}
}) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setModalConfig({
            isOpen: true,
            title: "Delete Class Slot",
            description: `Are you sure you want to remove this scheduled class slot for ${subject} (${code})?`,
            type: "confirm",
            confirmText: "Delete",
            confirmDisabled: false,
            onConfirm: async () => {
                try {
                    setModalConfig(prev => ({ ...prev, confirmDisabled: true, description: "Deleting..." }));
                    setIsDeleting(true);
                    const res = await deleteTimetableSlot(slotId);
                    if (res && res.success) {
                        setToastConfig({
                            isOpen: true,
                            title: "Success",
                            description: "Class slot removed successfully!",
                            type: "success"
                        });
                        router.refresh();
                    } else {
                        setToastConfig({
                            isOpen: true,
                            title: "Database Error",
                            description: res?.error || "Failed to delete slot",
                            type: "error"
                        });
                    }
                } catch (err) {
                    console.error("Delete error:", err);
                    setToastConfig({
                        isOpen: true,
                        title: "Error",
                        description: err.message || "Something went wrong.",
                        type: "error"
                    });
                } finally {
                    setIsDeleting(false);
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };
    const isLab = subject?.toLowerCase().includes("lab") || code?.toLowerCase().endsWith("p");
    const displayType = isLab ? "Lab" : "Lecture";

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
        <div className={`group relative flex flex-col sm:flex-row items-start sm:items-center p-3 md:p-4 mb-3 rounded-2xl border transition-all duration-500 overflow-hidden
            ${isOngoing ? "bg-brand/5 border-brand/60 shadow-[0_0_20px_rgba(var(--brand-rgb),0.1)] ring-1 ring-brand/20" : "bg-white/2 border-white/5 hover:border-white/20"}
        `}>
            {/* Background Glow for Ongoing */}
            {isOngoing && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none animate-pulse"></div>
            )}

            {/* left section */}
            <div className="flex flex-col items-center justify-center min-w-[70px] pr-4 pb-3 sm:pb-0 border-b sm:border-b-0 sm:border-r border-white/10 w-full sm:w-auto">
            <div className="flex flex-row items-center gap-2">
                 <span className="text-base sm:text-lg font-mono font-bold text-primary/80 tracking-tighter">
                    {formatTime(startTime)}
                </span>
                -
                <span className="text-base sm:text-lg font-mono font-bold text-primary/80 tracking-tighter">
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
            <div className="grow pl-0 sm:pl-6 pt-3 sm:pt-0">
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
                
                <h3 className="text-base sm:text-lg font-semibold font-sans text-primary tracking-tight leading-tight">
                    {subject}
                </h3>
                
                <div className="flex items-center flex-wrap gap-1 sm:gap-2 mt-1">
                    <span className="text-xs font-mono text-secondary/80">{code}</span>
                    <span className="text-[10px] text-white/10">•</span>
                    <span className="text-xs text-secondary/80">{room}</span>
                    <span className="text-[10px] text-white/10">•</span>
                    <span className="text-xs text-secondary/80">{teacher}</span>
                </div>
            </div>

            {/* Delete button */}
            <div className="flex items-center justify-end w-full sm:w-auto mt-3 sm:mt-0 sm:pl-4">
                <button
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="p-2 text-secondary hover:text-red-400 disabled:opacity-40 transition-colors duration-200 rounded-lg hover:bg-white/5"
                    title="Delete Class Slot"
                >
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                </button>
            </div>

        </div>
    );
}

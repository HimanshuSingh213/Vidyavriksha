"use client";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { markAttendance } from "@/actions/Attendance";

export default function LectureItem({
    subjectId,
    slotId,
    startTime,
    endTime,
    subject,
    code,
    teacher,
    initialStatus,
}) {

    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, addOptimisticStatus] = useOptimistic(
        initialStatus,
        (currentState, newStatus) => newStatus
    );

    const handleMarkAttendance = (status) => {
        // Instantly update the UI
        addOptimisticStatus(status);

        // Fire the Server Action in the background
        startTransition(async () => {
            try {
                await markAttendance(subjectId, slotId, status, currentDateIso);
            } catch (error) {
                console.error("Failed to save attendance:", error);
                // If the server fails, useOptimistic automatically reverts the UI
            }
        });
    };

    function formatTime(mins) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }

    function getCurrentMinutes() {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }

    const currentTime = getCurrentMinutes();
    const [timeStatus, setTimeStatus] = useState("");
    const [isOngoing, setIsOngoing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isUpcoming, setIsUpcoming] = useState(false);

    useEffect(() => {
        if (currentTime >= formatTime(startTime) && currentTime <= formatTime(endTime)) {
            setTimeStatus("Ongoing");
        }
        else if (currentTime >= formatTime(endTime)) {
            setTimeStatus("Completed");
        }
        else {
            setTimeStatus("Upcoming");
        }

        if(timeStatus === "Ongoing") setIsOngoing(true);
        else if(timeStatus === "Completed") setIsCompleted(true);
        else setIsUpcoming(true);
    }, []);


    return (
        <div className={`p-4 border rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] col-span-1 transition-all duration-300
            ${isOngoing ? "border-brand/30 bg-brand/5" : ""}
            ${isCompleted ? "border-white/10 bg-white/2 opacity-50 hover:opacity-100" : ""}
            ${timeStatus === "Upcoming" ? "border-white/10 bg-white/2" : ""}
        `}>

            {/* Header */}
            <div className="flex justify-between items-start mb-2">

                <span className={`text-xs font-mono flex items-center gap-2 ${isOngoing ? "text-brand" : "text-secondary"}`}>
                    {isOngoing && <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>}
                    {timeStatus}
                </span>

                <span className="text-xs font-mono text-secondary">{formatTime(startTime)} - {formatTime(endTime)}</span>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-row justify-between items-center w-full">
                <div>
                    <p className="font-medium">{subject}</p>
                    <p className="text-xs text-secondary mt-1">{code} • {teacher}</p>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex justify-center items-center gap-2">

                    {/* Attended Button */}
                    <button
                        onClick={() => handleMarkAttendance("Attended")}
                        disabled={isPending}
                        className={`group size-8 rounded-lg flex items-center justify-center transition duration-200 ease-in-out ${optimisticStatus === "Attended"
                            ? "bg-success/20 ring-1 ring-success shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            : "bg-white/5 hover:bg-success/10 cursor-pointer"
                            }`}
                    >
                        <CircleCheck size={18} className={`${optimisticStatus === "Attended" ? "text-success" : "text-secondary"} transition duration-200 ease-in-out group-hover:text-success`} />
                    </button>

                    {/* Missed Button */}
                    <button
                        onClick={() => handleMarkAttendance("Missed")}
                        disabled={isPending}
                        className={`group size-8 rounded-lg flex items-center justify-center transition duration-200 ease-in-out ${optimisticStatus === "Missed"
                            ? "bg-warning/20 ring-1 ring-warning shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            : "bg-white/5 hover:bg-warning/10 cursor-pointer"
                            }`}
                    >
                        <CircleX size={18} className={`${optimisticStatus === "Missed" ? "text-warning" : "text-secondary"} transition duration-200 ease-in-out group-hover:text-warning`} />
                    </button>

                </div>
            </div>
        </div>
    );
}
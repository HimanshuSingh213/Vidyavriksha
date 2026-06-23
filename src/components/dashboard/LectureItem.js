"use client";
import { useEffect, useState, } from "react";

export default function LectureItem({
    subjectId,
    slotId,
    startTime,
    endTime,
    subject,
    code,
    teacher,
    currentDateIso
}) {

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
    const [timeStatus, setTimeStatus] = useState("Upcoming");
    const [statusFlags, setStatusFlags] = useState({
        isOngoing: false,
        isCompleted: false,
        isUpcoming: true
    });

    useEffect(() => {
        let currentStatus = "Upcoming";
        
        if (currentTime >= startTime && currentTime <= endTime) {
            currentStatus = "Ongoing";
        } else if (currentTime > endTime) {
            currentStatus = "Completed";
        }

        setTimeStatus(currentStatus);
        setStatusFlags({
            isOngoing: currentStatus === "Ongoing",
            isCompleted: currentStatus === "Completed",
            isUpcoming: currentStatus === "Upcoming"
        });
    }, [currentTime, startTime, endTime]);

    const { isOngoing, isCompleted } = statusFlags;


    return (
        <div className={`p-3 md:p-4 border rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] col-span-1 transition-all duration-300
            ${isOngoing ? "border-brand/30 bg-brand/5" : ""}
            ${isCompleted ? "border-white/10 bg-white/2 opacity-50 hover:opacity-100" : ""}
            ${timeStatus === "Upcoming" ? "border-white/10 bg-white/2" : ""}
        `}>

            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-secondary">{formatTime(startTime)} - {formatTime(endTime)}</span>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-row justify-between items-center w-full">
                <div>
                    <p className="font-medium text-sm md:text-base">{subject}</p>
                    <p className="text-xs text-secondary mt-1">{code} • {teacher}</p>
                </div>

            </div>
        </div>
    );
}
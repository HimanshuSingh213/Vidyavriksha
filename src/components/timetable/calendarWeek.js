import { Space_Grotesk } from "next/font/google";
import React from "react";
import { auth } from "../../../auth";
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Timetable } from "@/models/timetable.model";
import { subject } from "@/models/subject.model";
import { attendance } from "@/models/Attendance.model";
import CalendarUI from "./CalendarUI";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["600", "700"],
    display: "swap",
});

// Helper to get all 7 days of the current week with their exact start/end times
const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const week = [];
    for (let i = 0; i < 7; i++) {
        const startOfDay = new Date(monday);
        startOfDay.setDate(monday.getDate() + i);

        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);

        week.push({
            dayName: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
            dayOfWeek: startOfDay.getDay(),
            startOfDay,
            endOfDay,
            isToday: startOfDay.toDateString() === today.toDateString()
        });
    }
    return week;
};

const CalendarWeek = async () => {

    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    // Handling Attended/Total classes
    await dbConnect();

    const weekDays = getCurrentWeekDates();
    const startOfWeek = weekDays[0].startOfDay // Monday Morning 
    const endOfWeek = weekDays[6].endOfDay; // Sunday Night

    const [allSchedule, weekAttendance] = await Promise.all([
        Timetable.find({ userId }).populate('subjectId').lean(),
        attendance.find({
            userId,
            date: { $gte: startOfWeek, $lte: endOfWeek }
        }).lean()
    ]);

    const weekStats = weekDays.map((dayInfo) => {

        const scheduledClasses = allSchedule.filter(
            (slot) => slot.dayOfWeek === dayInfo.dayOfWeek
        );

        const attendanceForThisDate = weekAttendance.filter(
            (a) => a.date >= dayInfo.startOfDay && a.date <= dayInfo.endOfDay
        );

        const attendanceMapForDay = new Map(
            attendanceForThisDate.map((a) => [a.slotId?.toString(), a.status])
        );

        const literalTotalClasses = scheduledClasses.length; // total scheduled, before cancellations
        let attendedClasses = 0;
        let cancelledClasses = 0;

        attendanceForThisDate.forEach((record) => {
            if (record.status === "Attended") attendedClasses += 1;
            else if (record.status === "Cancelled") cancelledClasses += 1;
        });

        const currentTotalClasses = Math.max(0, literalTotalClasses - cancelledClasses);

        const lectures = scheduledClasses
            .sort((a, b) => a.startMinutes - b.startMinutes)
            .map((lecture) => {
                const subjectDoc = lecture.subjectId;
                const subjectName = subjectDoc?.name || lecture.subject || "Unknown Subject";
                const subjectCode = subjectDoc?.code || lecture.code || "N/A";

                return {
                    id: lecture._id.toString(),
                    slotId: lecture._id.toString(),
                    subjectId: subjectDoc?._id?.toString?.() || subjectDoc?.toString?.(),
                    subject: subjectName,
                    code: subjectCode,
                    teacher: lecture.teacher || "TBA",
                    room: lecture.room || "TBA",
                    startTime: lecture.startMinutes,
                    endTime: lecture.endMinutes,
                    initialStatus: attendanceMapForDay.get(lecture._id.toString()) || ""
                };
            });

        return {
            ...dayInfo,
            totalClasses: literalTotalClasses,
            literalTotalClasses,
            currentTotalClasses,
            attendedClasses,
            cancelledClasses,
            lectures
        };
    });

    return (
        <div>
            <CalendarUI weekStats={weekStats} />
        </div>
    );
};

export default CalendarWeek
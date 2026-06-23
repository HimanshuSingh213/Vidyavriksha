import { Space_Grotesk } from "next/font/google";
import React from "react";
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Timetable } from "@/models/timetable.model";
import { subject } from "@/models/subject.model";
import { Semester } from "@/models/semester.model";
import { User } from "@/models/user.model";
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

    const [allSchedule, userSettings] = await Promise.all([
        Timetable.find({ userId }).populate('subjectId').lean(),
        User.findById(userId).lean()
    ]);

    const currentSemNum = userSettings?.currentSem || 1;
    const activeSemDoc = await Semester.findOne({ userId, semester: currentSemNum }).lean();

    let subjects = [];
    if (activeSemDoc) {
        subjects = await subject.find({ userId, semester: activeSemDoc._id }).lean();
    }

    const scheduledSubjectIds = new Set(allSchedule.map(slot => slot.subjectId?._id?.toString() || slot.subjectId?.toString()));
    const unscheduledSubjects = subjects
        .filter(sub => !scheduledSubjectIds.has(sub._id.toString()))
        .map(sub => ({
            id: sub._id.toString(),
            name: sub.name,
            code: sub.code,
            credits: sub.credits
        }));

    const allSubjectsFormatted = subjects.map(sub => ({
        id: sub._id.toString(),
        name: sub.name,
        code: sub.code
    }));

    const weekStats = weekDays.map((dayInfo) => {

        const scheduledClasses = allSchedule.filter(
            (slot) => slot.dayOfWeek === dayInfo.dayOfWeek
        );

        const literalTotalClasses = scheduledClasses.length; // total scheduled, before cancellations
        let cancelledClasses = 0;

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
                };
            });

        return {
            ...dayInfo,
            totalClasses: literalTotalClasses,
            literalTotalClasses,
            currentTotalClasses,
            lectures
        };
    });

    return (
        <div>
            <CalendarUI 
                weekStats={weekStats} 
                unscheduledSubjects={unscheduledSubjects}
                allSubjects={allSubjectsFormatted}
            />
        </div>
    );
};

export default CalendarWeek
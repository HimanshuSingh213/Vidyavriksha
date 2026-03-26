"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Exam } from "@/models/exam.model";
import { Timetable } from "@/models/timetable.model";
import { attendance } from "@/models/Attendance.model";

export const getDashboardData = async () => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userId = session?.user?.id;

  // Handling Exams 
  await dbConnect();

  const rawExams = await Exam.find({
    date: { $gte: new Date() } // Only grab exams from today onwards
  })
    .populate('subjectId') // ensure subject details are available
    .sort({ date: 1 }) // Sort by closest date first
    .limit(8) // Only show the next 8 upcoming exams
    .lean();

  // Map to plain JSON-friendly values for the client component
  const upcomingExams = rawExams.map((exam) => ({
    id: exam._id.toString(),
    subject: exam.subjectId?.name || "Unknown Subject",
    code: exam.subjectId?.code || "N/A",
    type: exam.title,
    examDateString: exam.date.toISOString(),
  }));

  // Handling TimeTable
  const today = new Date().getDay(); // calculating today's date to get correct schedule

  // Get current date range (today)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [rawSchedule, todayAttendance] = await Promise.all([
    Timetable.find({ userId, dayOfWeek: today }).populate('subjectId').sort({ startMinutes: 1 }).lean(),
    attendance.find({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).lean()
  ]);

  // Map attendance status to slotId (which corresponds to the Timetable item _id)
  const attendanceMap = new Map(
    todayAttendance.map(a => [a.slotId?.toString(), a.status])
  );

  const todaySchedule = rawSchedule.map(lecture => ({
    _id: lecture._id.toString(),
    subjectId: lecture.subjectId?._id?.toString() || lecture.subjectId?.toString() || null,
    subject: lecture.subjectId?.name || lecture.subject || "Unknown Subject",
    code: lecture.subjectId?.code || lecture.code || "N/A",
    teacher: lecture.teacher || "",
    startMinutes: lecture.startMinutes,
    endMinutes: lecture.endMinutes,
    initialStatus: attendanceMap.get(lecture._id.toString()) || ""
  }));

  return { upcomingExams, todaySchedule, startOfDayIso: startOfDay.toISOString() };
};

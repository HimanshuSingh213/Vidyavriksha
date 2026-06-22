"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Exam } from "@/models/exam.model";
import { Timetable } from "@/models/timetable.model";
import { attendance } from "@/models/Attendance.model";
import { unstable_cache } from "next/cache";

const fetchDashboardFromDb = async (userId, todayDayOfWeek, startOfDayTime, endOfDayTime) => {
  await dbConnect();

  const startOfDay = new Date(startOfDayTime);
  const endOfDay = new Date(endOfDayTime);

  const rawExams = await Exam.find({ userId, date: { $gte: startOfDay } })
    .populate("subjectId")
    .sort({ date: 1 })
    .limit(8)
    .lean();

  const upcomingExams = rawExams.map((exam) => ({
    id: exam._id.toString(),
    subject: exam.subjectId?.name || "Unknown Subject",
    code: exam.subjectId?.code || "N/A",
    type: exam.title,
    examDateString: exam.date.toISOString(),
  }));

  const [rawSchedule, todayAttendance] = await Promise.all([
    Timetable.find({ userId, dayOfWeek: todayDayOfWeek }).populate('subjectId').sort({ startMinutes: 1 }).lean(),
    attendance.find({ userId, date: { $gte: startOfDay, $lte: endOfDay } }).lean()
  ]);

  const attendanceMap = new Map(todayAttendance.map(a => [a.slotId?.toString(), a.status]));

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

  return { upcomingExams, todaySchedule };
};

const getCachedDashboard = (userId, todayDayOfWeek, startOfDayTime, endOfDayTime, startOfDayIso) => {
  return unstable_cache(
    async () => fetchDashboardFromDb(userId, todayDayOfWeek, startOfDayTime, endOfDayTime),
    [`dashboard-${userId}`, startOfDayIso],
    {
      tags: [`dashboard-${userId}`],
      revalidate: 86400
    }
  )();
};

export const getDashboardData = async () => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userId = session?.user?.id;

  // Handling TimeTable Dates
  const today = new Date(); 
  const todayDayOfWeek = today.getDay();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Execute the cache
  const cachedData = await getCachedDashboard(
    userId,
    todayDayOfWeek,
    startOfDay.getTime(),
    endOfDay.getTime(),
    startOfDay.toISOString()
  );

  return { ...cachedData, startOfDayIso: startOfDay.toISOString() };
};
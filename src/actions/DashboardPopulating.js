"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Exam } from "@/models/exam.model";
import { Timetable } from "@/models/timetable.model";
import { attendance } from "@/models/Attendance.model";
import { unstable_cache } from "next/cache";

const fetchCachedDashboardDB = unstable_cache(
  async (userId, todayDayOfWeek, startOfDayStr, endOfDayStr) => {
    await dbConnect();

    const startOfDay = new Date(startOfDayStr);
    const endOfDay = new Date(endOfDayStr);

    const rawExams = await Exam.find({ date: { $gte: startOfDay } })
      .populate("subjectId")
      .sort({ date: 1 })
      .limit(8)
      .lean();

    const upcomingExams = rawExams.map((exam) => ({
      id: exam._id.toString(),
      subject: exam.SubjectId?.name || "Unknown Subject",
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
  },
  ["dashboard-data"], // Base cache key
  { tags: ["dashboard"] } // Tag used for manual invalidation
)

export const getDashboardData = async () => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userId = session?.user?.id;

  // Handling TimeTable
  const today = new Date(); // calculating today's date to get correct schedule
  const todayDayOfWeek = today.getDay();

  // Get current date range (today)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Call the cached function. If the date changes, the arguments change, creating a new cache!
  const cachedData = await fetchCachedDashboardDB(
    userId,
    todayDayOfWeek,
    startOfDay.toISOString(),
    endOfDay.toISOString()
  );

  return { ...cachedData, startOfDayIso: startOfDay.toISOString() };
};

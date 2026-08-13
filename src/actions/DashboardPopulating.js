"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Timetable } from "@/models/timetable.model";
import { User } from "@/models/user.model";
import { Semester } from "@/models/semester.model";
import { subject } from "@/models/subject.model";


const fetchDashboardFromDb = async (userId, todayDayOfWeek, startOfDayTime, endOfDayTime) => {
  await dbConnect();

  const userSettings = await User.findById(userId).lean();
  const currentSemNum = userSettings?.currentSem || 1;
  const activeSemDoc = await Semester.findOne({ userId, semester: currentSemNum }).lean();

  let currentSemSubjectIds = [];
  if (activeSemDoc) {
    const semSubjects = await subject.find({ userId, semester: activeSemDoc._id }).select('_id').lean();
    currentSemSubjectIds = semSubjects.map(s => s._id);
  }

  const rawSchedule = await Timetable.find({
    userId,
    dayOfWeek: todayDayOfWeek,
    subjectId: { $in: currentSemSubjectIds }
  }).populate('subjectId').sort({ startMinutes: 1 }).lean();

  const todaySchedule = rawSchedule.map(lecture => ({
    _id: lecture._id.toString(),
    subjectId: lecture.subjectId?._id?.toString() || lecture.subjectId?.toString() || null,
    subject: lecture.subjectId?.name || lecture.subject || "Unknown Subject",
    code: lecture.subjectId?.code || lecture.code || "N/A",
    teacher: lecture.teacher || "",
    startMinutes: lecture.startMinutes,
    endMinutes: lecture.endMinutes,
  }));

  return { todaySchedule };
};

const getCachedDashboard = (userId, todayDayOfWeek, startOfDayTime, endOfDayTime, startOfDayIso) => {
  return fetchDashboardFromDb(userId, todayDayOfWeek, startOfDayTime, endOfDayTime);
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
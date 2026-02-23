import { BookOpen, Clock } from "lucide-react";
import { auth } from "../../../auth";
import Image from "next/image";
import SgpaChart from "@/components/dashboard/SgpaChart";
import LectureItem from "@/components/dashboard/LectureItem";
import UpcomingExamItem from "@/components/dashboard/UpcomingExamItem";
import dbConnect from "@/lib/db";
import { Exam } from "@/models/exam.model";
import { Timetable } from "@/models/timetable.model";

export default async function DashboardPage() {
  // Fetching logged-in user's session securely on the server
  const session = await auth();
  const userId = session?.user?.id; // getting userId from the LoggedIn user's session

  // Handling Exams 
  await dbConnect();

  const rawExams = await Exam.find({
     date: { $gte: new Date() } // Only grab exams from today onwards
  })
    .sort({ date: 1 }) // Sort by closest date first
    .limit(8) // Only show the next 8 upcoming exams
    .lean();


  const upcomingExams = rawExams.map((exam) => ({
    id: exam._id.toString(),
    subject: exam.subjectId,
    code: exam.code,
    type: exam.title,
    examDateString: exam.date.toISOString(),
  }));

  // Handling TimeTable
  const today = new Date().getDay(); // calculating today's date to get correct schedule

  const todaySchedule = await Timetable.find({
    userId, dayOfWeek: today
  })
    .sort({ startMinutes: 1 })
    .lean();
  console.log(todaySchedule)

  return (
    <div className="min-h-screen bg-obsidian text-primary p-6 md:p-10 font-sans">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-secondary mt-1">
            Welcome back, {session?.user?.name || "Engineer"}.
          </p>
        </div>

        <div className="flex flex-row items-center gap-2">
          <div className="max-w-60">
            <p className="text-center">{session.user.name}</p>
            <div className="flex flex-row justify-center items-center gap-1 text-xs text-success max-w-40 truncate line-clamp-1">
              <p className="text-[10px] max-w-2/3 truncate">Btech CSE-DS</p>
              <span className="text-[10px]">•</span>
              <p className="text-[10px]">Sem 2</p>
            </div>
          </div>
          <div>
            {/* Display Google Profile Picture */}
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full border border-white/8"
              />
            )}
          </div>

        </div>

      </header>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* The Headline Card */}
        <div className="md:col-span-2 bg-white/2 backdrop-blur-xl border border-white/8 rounded-2xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] rounded-full pointer-events-none"></div>

          <h2 className="text-secondary text-sm font-medium uppercase tracking-wider mb-2">Current Trajectory</h2>
          <div className="flex items-end gap-4">
            {/* Monospace font for data points */}
            <span className="text-6xl font-mono font-bold tracking-tighter text-white">8.42</span>
            <span className="text-xl text-secondary mb-2 font-mono">CGPA</span>
          </div>

          <div className="mt-6 flex gap-4">
            <div className="px-3 py-1 bg-success/10 border border-success/20 rounded text-success text-xs font-mono">
              Target: 9.00
            </div>
            <div className="px-3 py-1 bg-warning/10 border border-warning/20 rounded text-warning text-xs font-mono">
              Deficit: 0.58
            </div>
          </div>
        </div>

        {/* SGPA Chart */}
        <SgpaChart />

      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">

        <div className="md:col-span-2 bg-white/2 backdrop-blur-xl border border-white/8 rounded-2xl p-6 mt-2 hover:-translate-y-1 transition-transform duration-300">
          <header className="flex flex-row gap-2 justify-start items-center mb-4">
            {<Clock size={18} className="text-brand" />}
            <h2 className="text-secondary text-sm font-medium uppercase tracking-wider">Todays Schedule</h2>
          </header>

          {/* Subjects - Schedule Wise */}
          <div className="grid md:grid-cols-1 grid-flow-row grid-cols-3 gap-4 w-full">
            {todaySchedule.map((lecture) => (
              <LectureItem
                key={lecture._id}
                slotId={lecture.slotId}
                subjectId={lecture.subjectId}
                subject={lecture.subject}
                code={lecture.code}
                teacher={lecture.teacher}
                startTime={lecture.startMinutes}
                endTime={lecture.endMinutes}
                initialStatus={lecture.initialStatus}
                timeStatus={lecture.timeStatus}
              />
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="md:col-span-2 bg-white/2 backdrop-blur-xl border border-white/8 rounded-2xl p-6 mt-2 hover:-translate-y-1 transition-transform duration-300">
          <header className="flex flex-row gap-2 justify-start items-center mb-4">
            {<BookOpen size={18} className="text-brand" />}
            <h2 className="text-secondary text-sm font-medium uppercase tracking-wider">Upcoming Exams</h2>
          </header>

          <div className="grid md:grid-cols-1 grid-flow-row grid-cols-3 gap-4 w-full">
            {upcomingExams.length === 0 ? (
              <p className="text-secondary text-sm font-mono text-center py-4">No upcoming exams found.</p>
            ) : (
              upcomingExams.map((exam) => (
                <UpcomingExamItem
                  key={exam.id}
                  subject={exam.subject}
                  code={exam.code}
                  examType={exam.type}
                  examDateString={exam.examDateString}
                />
              ))
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
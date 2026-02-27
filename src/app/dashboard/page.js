import { BookOpen, Clock } from "lucide-react";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import SgpaChart from "@/components/dashboard/SgpaChart";
import LectureItem from "@/components/dashboard/LectureItem";
import UpcomingExamItem from "@/components/dashboard/UpcomingExamItem";
import dbConnect from "@/lib/db";
import { Exam } from "@/models/exam.model";
import { Timetable } from "@/models/timetable.model";
import { attendance } from "@/models/Attendance.model";
import { subject } from "@/models/subject.model";

export default async function DashboardPage() {
  // Fetching logged-in user's session securely on the server
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
    ...lecture,
    subject: lecture.subjectId?.name || lecture.subject || "Unknown Subject",
    code: lecture.subjectId?.code || lecture.code || "N/A",
    initialStatus: attendanceMap.get(lecture._id.toString()) || ""
  }));

  return (
    <div className="min-h-screen bg-obsidian text-primary p-6 md:p-10 font-sans">

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* The Headline Card */}
        <div className="md:col-span-2 bg-white/2 backdrop-blur-xl border border-white/8 rounded-2xl p-8 relative overflow-hidden hover:-translate-y-1 transition duration-300 hover:shadow-xl shadow-brand/5 ease-in-out">
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

        <div className="md:col-span-2 bg-white/2 backdrop-blur-xl border border-white/8 rounded-2xl hover:shadow-xl shadow-brand/5 p-6 mt-2 hover:-translate-y-1 transition duration-300 ease-in-out">
          <header className="flex flex-row gap-2 justify-start items-center mb-4">
            {<Clock size={18} className="text-brand" />}
            <h2 className="text-secondary text-sm font-medium uppercase tracking-wider">Todays Schedule</h2>
          </header>

          {/* Subjects - Schedule Wise */}
          <div className="grid md:grid-cols-1 grid-flow-row grid-cols-3 gap-4 w-full">
            {todaySchedule.length === 0 ? (
              <p className="text-secondary text-sm font-mono text-center py-4 hover:shadow-xl shadow-brand/5 transition duration-300 ease-in-out">No classes scheduled for today.</p>
            ) : (
              todaySchedule.map((lecture) => (
                <LectureItem
                  key={lecture._id.toString()}
                  slotId={lecture._id.toString()}
                  subjectId={lecture.subjectId?._id?.toString() || lecture.subjectId?.toString()}
                  subject={lecture.subject}
                  code={lecture.code}
                  teacher={lecture.teacher}
                  startTime={lecture.startMinutes}
                  endTime={lecture.endMinutes}
                  initialStatus={lecture.initialStatus}
                  currentDateIso={startOfDay.toISOString()}
                />
              ))
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="md:col-span-2 bg-white/2 backdrop-blur-xl border border-white/8 hover:shadow-xl shadow-brand/5 rounded-2xl p-6 mt-2 hover:-translate-y-1 transition duration-300">
          <header className="flex flex-row gap-2 justify-start items-center mb-4">
            {<BookOpen size={18} className="text-brand" />}
            <h2 className="text-secondary text-sm font-medium uppercase tracking-wider">Upcoming Exams</h2>
          </header>

          <div className="grid md:grid-cols-1 grid-flow-row grid-cols-3 w-full">
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
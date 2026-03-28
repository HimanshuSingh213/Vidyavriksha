"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Clock, Loader2 } from "lucide-react";
import SgpaChart from "@/components/dashboard/SgpaChart";
import LectureItem from "@/components/dashboard/LectureItem";
import UpcomingExamItem from "@/components/dashboard/UpcomingExamItem";
import { useUser } from "../Context/UserContext";
import { getDashboardData } from "@/actions/DashboardPopulating";

export default function DashboardPage() {

  const { targetCGPA, currentCGPA } = useUser();
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [startOfDayIso, setStartOfDayIso] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData();
        if (data) {
          setUpcomingExams(data.upcomingExams);
          setTodaySchedule(data.todaySchedule);
          setStartOfDayIso(data.startOfDayIso);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 className="animate-spin text-brand w-8 h-8" />
      </div>
    );
  }

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
            <span className="text-6xl font-mono font-bold tracking-tighter text-white">{currentCGPA}</span>
            <span className="text-xl text-secondary mb-2 font-mono">CGPA</span>
          </div>

          <div className="mt-6 flex gap-4">
            <div className="px-3 py-1 bg-success/10 border border-success/20 rounded text-success text-xs font-mono">
              Target: {targetCGPA}
            </div>
            <div className={`px-3 py-1 border rounded ${currentCGPA !== 0 && targetCGPA > currentCGPA?"text-warning bg-warning/10 border-warning/20": "text-success bg-success/10 border-success/20"} text-xs font-mono`}>
               {currentCGPA !== 0 && targetCGPA > currentCGPA? (`Deficit: ${Number(targetCGPA-currentCGPA).toFixed(2)}`): (`Surplus: ${Number(currentCGPA-targetCGPA).toFixed(2)}`)}
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
              <p className="text-secondary text-sm font-mono text-center py-4">No classes scheduled for today.</p>
            ) : (
              todaySchedule.map((lecture) => (
                <LectureItem
                  key={lecture._id.toString()}
                  slotId={lecture._id.toString()}
                  subjectId={lecture.subjectId}
                  subject={lecture.subject}
                  code={lecture.code}
                  teacher={lecture.teacher}
                  startTime={lecture.startMinutes}
                  endTime={lecture.endMinutes}
                  initialStatus={lecture.initialStatus}
                  currentDateIso={startOfDayIso}
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
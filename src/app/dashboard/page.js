"use client";

import React, { useEffect, useState } from "react";
import { Clock, Loader2, Rocket, AlertTriangle, TrendingUp, Sparkles, Sliders } from "lucide-react";
import SgpaChart from "@/components/dashboard/SgpaChart";
import LectureItem from "@/components/dashboard/LectureItem";
import { useUser } from "../Context/UserContext";
import { getDashboardData } from "@/actions/DashboardPopulating";
import Link from "next/link";

export default function DashboardPage() {

  const { targetCGPA, currentCGPA, currentSem } = useUser();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [startOfDayIso, setStartOfDayIso] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData();
        if (data) {
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

  const completedSems = Math.max(0, Number(currentSem) - 1);
  const totalProgramSems = 8;
  const remainingSems = Math.max(1, totalProgramSems - completedSems);
  
  const currentTotalPoints = (currentCGPA || 0) * completedSems;
  const targetTotalPoints = (targetCGPA || 0) * totalProgramSems;
  const neededPoints = targetTotalPoints - currentTotalPoints;
  const requiredSGPA = Number((neededPoints / remainingSems).toFixed(2));
  
  const isDeficit = currentCGPA !== null && currentCGPA > 0 && targetCGPA > currentCGPA;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 className="animate-spin text-brand w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-primary p-4 md:p-10 font-sans">

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

        {/* The Headline Card */}
        <div className="md:col-span-2 bg-white/2 backdrop-blur-xl border border-white/8 rounded-2xl p-5 md:p-8 relative overflow-hidden hover:-translate-y-1 transition duration-300 hover:shadow-xl shadow-brand/5 ease-in-out">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] rounded-full pointer-events-none"></div>

          <h2 className="text-secondary text-sm font-medium uppercase tracking-wider mb-2">Current Trajectory</h2>
          <div className="flex items-end gap-2 md:gap-4">
            {/* Monospace font for data points */}
            <span className="text-4xl md:text-6xl font-mono font-bold tracking-tighter text-white">
              {currentCGPA !== null && currentCGPA > 0 ? currentCGPA.toFixed(2) : "0.00"}
            </span>
            <span className="text-base md:text-xl text-secondary mb-2 font-mono">CGPA</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 md:gap-4 items-center">
            <div className="px-3 py-1 bg-success/10 border border-success/20 rounded text-success text-xs font-mono">
              Target: {targetCGPA}
            </div>
            <div className={`px-3 py-1 border rounded ${currentCGPA !== null && currentCGPA > 0 && targetCGPA > currentCGPA?"text-warning bg-warning/10 border-warning/20": "text-success bg-success/10 border-success/20"} text-xs font-mono`}>
               {currentCGPA !== null && currentCGPA > 0 && targetCGPA > currentCGPA? (`Deficit: ${Number(targetCGPA-currentCGPA).toFixed(2)}`): (`Surplus: ${Number(Math.max(0, (currentCGPA || 0)-targetCGPA)).toFixed(2)}`)}
            </div>
          </div>

          {/* Target Deficit Alert System */}
          <div className="mt-6 p-4 rounded-xl border bg-white/1 border-white/8 font-mono text-xs text-secondary/90">
            {completedSems === 0 ? (
              <p className="text-brand flex items-center gap-1.5">
                <Rocket size={14} className="shrink-0 text-brand" />
                <span>Starting Semester 1: Maintain an average of <span className="text-white font-bold">{targetCGPA.toFixed(2)} SGPA</span> over {totalProgramSems} semesters to hit your goal.</span>
              </p>
            ) : requiredSGPA > 10 ? (
              <p className="text-danger flex items-center gap-1.5">
                <AlertTriangle size={14} className="shrink-0 text-danger" />
                <span>Target Out of Reach: Required average SGPA is <span className="text-white font-bold font-mono">{requiredSGPA.toFixed(2)}</span>. To hit your target, you will need extra credits or to revise your goals.</span>
              </p>
            ) : isDeficit ? (
              <p className="text-warning flex items-center gap-1.5">
                <TrendingUp size={14} className="shrink-0 text-warning" />
                <span>Action Needed: You have a deficit of <span className="text-white font-bold">{Number(targetCGPA - currentCGPA).toFixed(2)}</span>. You must maintain an average of <span className="text-white font-bold">{requiredSGPA.toFixed(2)} SGPA</span> across the remaining {remainingSems} semesters to meet your {targetCGPA.toFixed(2)} CGPA target.</span>
              </p>
            ) : (
              <p className="text-success flex items-center gap-1.5">
                <Sparkles size={14} className="shrink-0 text-success" />
                <span>On Track: You have a surplus of <span className="text-white font-bold">{Number(Math.max(0, (currentCGPA || 0) - targetCGPA)).toFixed(2)}</span>! Maintain an average of <span className="text-white font-bold">{Math.max(0, requiredSGPA).toFixed(2)} SGPA</span> in the remaining {remainingSems} semesters to lock in your goal.</span>
              </p>
            )}
          </div>

          {/* Launch GPA Simulator Action */}
          <div className="mt-4 flex justify-end">
            <Link 
              href="/dashboard/simulator" 
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-secondary hover:text-brand bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl transition duration-200"
            >
              <Sliders size={12} /> Launch GPA Simulator
            </Link>
          </div>
        </div>

        {/* SGPA Chart */}
        <SgpaChart />

      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mt-3 md:mt-4">

        <div className="md:col-span-4 bg-white/2 backdrop-blur-xl border border-white/8 rounded-2xl hover:shadow-xl shadow-brand/5 p-4 md:p-6 mt-2 hover:-translate-y-1 transition duration-300 ease-in-out font-sans">
          <header className="flex flex-row gap-2 justify-start items-center mb-4">
            {<Clock size={18} className="text-brand" />}
            <h2 className="text-secondary text-sm font-medium uppercase tracking-wider">Todays Schedule</h2>
          </header>

          {/* Subjects - Schedule Wise */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {todaySchedule.length === 0 ? (
              <p className="text-secondary text-sm font-mono text-center py-4 md:col-span-2">No classes scheduled for today.</p>
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
                  currentDateIso={startOfDayIso}
                />
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
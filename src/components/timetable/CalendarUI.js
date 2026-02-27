"use client";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import { CircleCheck, CircleX, Ban } from "lucide-react";
import React, { useState } from "react";
import ModernLectureItem from "../dashboard/ModernLectureItem";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export default function CalendarUI({ weekStats }) {
  // 1. Defaults to today's date automatically
  const todayStats = weekStats.find((day) => day.isToday);
  const defaultDay = todayStats ? todayStats.dayName : "Mon";

  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const fullDayNames = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };

  const selectedDayStats =
    weekStats.find((day) => day.dayName === selectedDay) || weekStats[0] || {
      attendedClasses: 0,
      totalClasses: 0, // literal total
      literalTotalClasses: 0,
      currentTotalClasses: 0,
      cancelledClasses: 0,
      lectures: [],
    };


  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. The Calendar Row */}
      <ul className='rounded-2xl bg-white/2 border border-white/8 backdrop-blur-2xl w-full min-h-10 min-w-40 p-2 grid grid-cols-7 gap-2 items-center'>
        {weekStats.map((day) => {
          const isSelected = selectedDay === day.dayName;
          
          return (
            <div
              key={day.dayName}
              onClick={() => setSelectedDay(day.dayName)}
              className={`flex flex-col gap-1 items-center justify-center group rounded-lg transition-all duration-300 ease-in-out p-2 relative cursor-pointer ${
                isSelected ? "bg-brand/15" : "hover:bg-white/5"
              }`}
            >
              <li className='flex flex-col gap-1 items-center justify-center '>
               
                <p className={`text-[10px] font-medium uppercase tracking-widest transition-all duration-300 ease-in-out ${geistMono.className} ${
                  isSelected 
                    ? "text-primary" 
                    : "text-secondary group-hover:text-primary"
                }`}>
                  {day.dayName}
                </p>

                <p className={`${spaceGrotesk.className} text-[9px] transition-colors duration-300 text-secondary`}>
                  {day.attendedClasses} / {day.totalClasses}
                </p>

                {/* Pulsing dot ALWAYS stays on today, even if not selected */}
                {day.isToday && (
                  <span className='absolute top-0 right-0 size-2 rounded-full bg-brand animate-pulse'></span>
                )}
              </li>
            </div>
          );
        })}
      </ul>

      {/* Bar to show the Day and total classes - Attended/Missed/Cancelled */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 flex-row items-center justify-start">
          <h2 className="text-lg font-semibold text-primary">
            {fullDayNames[selectedDay]}
          </h2>
          <ul className="flex flex-row items-center gap-3">
            <li className="flex flex-row gap-1 items-center text-[12px] text-success">
              <CircleCheck className="size-3" /> {selectedDayStats.attendedClasses}
            </li>
            <li className="flex flex-row gap-1 items-center text-[12px] text-warning">
              <CircleX className="size-3" />{" "}
              {Math.max(
                0,
                (selectedDayStats.currentTotalClasses || selectedDayStats.totalClasses) -
                  selectedDayStats.attendedClasses
              )}
            </li>
            <li className="flex flex-row gap-1 items-center text-[12px] text-danger">
              <Ban className="size-3" /> {selectedDayStats.cancelledClasses}
            </li>
            <li className="text-xs text-secondary">
              of {selectedDayStats.literalTotalClasses} classes
            </li>
          </ul>
        </div>

        {/*  Schedule View for the selected day */}
        <div className="p-4 rounded-xl border border-white/10 bg-white/2 text-primary font-sans text-sm">
          <p className="text-secondary mb-3 text-xs font-mono uppercase tracking-[0.2em]">
            Classes on {fullDayNames[selectedDay]}
          </p>

          {selectedDayStats.lectures && selectedDayStats.lectures.length > 0 ? (
            <div className="flex flex-col gap-3">
              {selectedDayStats.lectures.map((lecture) => (
                <ModernLectureItem
                  key={lecture.slotId}
                  slotId={lecture.slotId}
                  subjectId={lecture.subjectId}
                  subject={lecture.subject}
                  code={lecture.code}
                  teacher={lecture.teacher}
                  room={lecture.room}
                  startTime={lecture.startTime}
                  endTime={lecture.endTime}
                  initialStatus={lecture.initialStatus}
                  currentDateIso={selectedDayStats.startOfDay}
                />
              ))}
            </div>
          ) : (
            <p className="text-secondary text-sm font-mono">
              No classes scheduled for this day.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import React, { useState } from "react";
import ModernLectureItem from "../dashboard/ModernLectureItem";
import { addTimetableSlot } from "@/actions/subject";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays, AlertTriangle } from "lucide-react";
import UniversalModal from "@/components/ui/UniversalModal";
import Toast from "@/components/ui/Toast";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export default function CalendarUI({ weekStats, unscheduledSubjects = [], allSubjects = [] }) {
  const router = useRouter();
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    subjectId: "",
    dayOfWeek: "1",
    startTime: "",
    endTime: "",
    room: "",
    teacher: ""
  });

  // Modal and Toast States
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
    confirmText: "Confirm",
    confirmDisabled: false,
    onConfirm: () => {}
  });

  const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
    type: "info"
  });

  const closeToast = () => setToastConfig(prev => ({ ...prev, isOpen: false }));
  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

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
      literalTotalClasses: 0,
      currentTotalClasses: 0,
      cancelledClasses: 0,
      lectures: [],
    };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.subjectId) {
      setToastConfig({
        isOpen: true,
        title: "Validation Error",
        description: "Please select a subject.",
        type: "error"
      });
      return;
    }
    if (!scheduleForm.startTime || !scheduleForm.endTime) {
      setToastConfig({
        isOpen: true,
        title: "Validation Error",
        description: "Start and End times are required.",
        type: "error"
      });
      return;
    }
    if (scheduleForm.startTime >= scheduleForm.endTime) {
      setToastConfig({
        isOpen: true,
        title: "Validation Error",
        description: "End Time must be after Start Time.",
        type: "error"
      });
      return;
    }

    try {
      setIsSaving(true);
      const res = await addTimetableSlot(scheduleForm);
      if (res && res.success) {
        setScheduleForm({
          subjectId: "",
          dayOfWeek: "1",
          startTime: "",
          endTime: "",
          room: "",
          teacher: ""
        });
        setIsSchedulingOpen(false);
        setToastConfig({
          isOpen: true,
          title: "Success",
          description: "Timetable slot added successfully!",
          type: "success"
        });
        router.refresh();
      } else {
        setToastConfig({
          isOpen: true,
          title: "Database Error",
          description: res?.error || "Failed to add timetable slot.",
          type: "error"
        });
      }
    } catch (err) {
      console.error(err);
      setToastConfig({
        isOpen: true,
        title: "Error",
        description: err.message || "Something went wrong.",
        type: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <UniversalModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        description={modalConfig.description}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        confirmDisabled={modalConfig.confirmDisabled}
        onConfirm={modalConfig.onConfirm}
      />

      <Toast 
        isOpen={toastConfig.isOpen}
        onClose={closeToast}
        title={toastConfig.title}
        description={toastConfig.description}
        type={toastConfig.type}
      />

      <div className="flex flex-col gap-6 w-full text-primary">
      {/* Header bar with title and Add Class Button */}
      <div className="flex flex-row justify-between items-center w-full">
        <h1 className="text-xl sm:text-2xl font-bold font-sans text-primary">Weekly Timetable</h1>
        <button
          onClick={() => setIsSchedulingOpen(!isSchedulingOpen)}
          className="px-3 py-2 text-xs text-obsidian bg-primary rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 flex items-center gap-1.5"
        >
          <Plus size={14} />
          Add Class Slot
        </button>
      </div>

      {/* General Schedule Form Card */}
      {isSchedulingOpen && (
        <form onSubmit={handleScheduleSubmit} className="p-3 md:p-4 rounded-xl border border-white/10 bg-white/2 text-primary font-sans space-y-3 md:space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-semibold text-xs sm:text-sm text-primary uppercase tracking-wider flex items-center gap-2">
              <CalendarDays size={16} className="text-brand" />
              Schedule Class Slot
            </h3>
            <span onClick={() => setIsSchedulingOpen(false)} className="text-[11px] sm:text-xs text-secondary hover:text-primary cursor-pointer">Cancel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* Subject selector */}
            <div className="flex flex-col">
              <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-1">Select Subject</label>
              <select
                required
                value={scheduleForm.subjectId}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, subjectId: e.target.value }))}
                className="w-full text-[11px] sm:text-xs px-2 py-1 h-8 sm:h-10 bg-white/5 border border-white/10 rounded-lg text-primary appearance-none cursor-pointer"
              >
                <option value="" className="bg-obsidian text-secondary"> Choose Subject </option>
                {allSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-obsidian text-secondary">
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Day Selector */}
            <div className="flex flex-col">
              <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-1">Day of Class</label>
              <select
                value={scheduleForm.dayOfWeek}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                className="w-full text-[11px] sm:text-xs px-2 py-1 h-8 sm:h-10 bg-white/5 border border-white/10 rounded-lg text-primary appearance-none cursor-pointer"
              >
                <option value="1" className="bg-obsidian text-secondary">Monday</option>
                <option value="2" className="bg-obsidian text-secondary">Tuesday</option>
                <option value="3" className="bg-obsidian text-secondary">Wednesday</option>
                <option value="4" className="bg-obsidian text-secondary">Thursday</option>
                <option value="5" className="bg-obsidian text-secondary">Friday</option>
                <option value="6" className="bg-obsidian text-secondary">Saturday</option>
                <option value="0" className="bg-obsidian text-secondary">Sunday</option>
              </select>
            </div>

            {/* Timings */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-1">Start Time</label>
                <input
                  required
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className={`w-full text-[11px] sm:text-xs px-2 py-1 h-8 sm:h-10 bg-white/5 border border-white/10 rounded-lg focus:outline-none transition-all duration-200 ${scheduleForm.startTime ? "text-primary" : "text-primary/30"}`}
                />
              </div>
              <div>
                <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-1">End Time</label>
                <input
                  required
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className={`w-full text-[11px] sm:text-xs px-2 py-1 h-8 sm:h-10 bg-white/5 border border-white/10 rounded-lg focus:outline-none transition-all duration-200 ${
                    scheduleForm.endTime ? "text-primary" : "text-primary/30"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Room */}
            <div className="flex flex-col">
              <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-1">Room / Location</label>
              <input
                type="text"
                placeholder="e.g. Room 302, Lab A"
                value={scheduleForm.room}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, room: e.target.value }))}
                className="w-full text-[11px] sm:text-xs px-2 py-1 h-8 sm:h-10 bg-white/5 border border-white/10 rounded-lg text-primary"
              />
            </div>

            {/* Teacher */}
            <div className="flex flex-col">
              <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-1">Instructor / Teacher</label>
              <input
                type="text"
                placeholder="e.g. Prof. Anuradha Chug"
                value={scheduleForm.teacher}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, teacher: e.target.value }))}
                className="w-full text-[11px] sm:text-xs px-2 py-1 h-8 sm:h-10 bg-white/5 border border-white/10 rounded-lg text-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold text-obsidian bg-primary rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
          >
            {isSaving ? "Adding..." : "Add Class Slot"}
          </button>
        </form>
      )}

      {/* 1. The Calendar Row */}
      <ul className='rounded-2xl bg-white/2 border border-white/8 backdrop-blur-2xl w-full min-h-10 min-w-40 p-1 sm:p-2 grid grid-cols-7 gap-0.5 sm:gap-2 items-center'>
        {weekStats.map((day) => {
          const isSelected = selectedDay === day.dayName;
          
          return (
            <div
              key={day.dayName}
              onClick={() => setSelectedDay(day.dayName)}
              className={`flex flex-col gap-1 items-center justify-center group rounded-lg transition-all duration-300 ease-in-out p-1 sm:p-2 relative cursor-pointer ${
                isSelected ? "bg-brand/15" : "hover:bg-white/5"
              }`}
            >
              <li className='flex flex-col gap-0.5 sm:gap-1 items-center justify-center'>
               
                <p className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider sm:tracking-widest transition-all duration-300 ease-in-out ${geistMono.className} ${
                  isSelected 
                    ? "text-primary" 
                    : "text-secondary group-hover:text-primary"
                }`}>
                  {day.dayName}
                </p>

                <p className={`${spaceGrotesk.className} text-[8px] sm:text-[9px] transition-colors duration-300 text-secondary`}>
                  {day.lectures?.length || 0}<span className="hidden sm:inline"> Classes</span>
                </p>

                {/* Pulsing dot ALWAYS stays on today, even if not selected */}
                {day.isToday && (
                  <span className='absolute top-0 right-0 size-1.5 sm:size-2 rounded-full bg-brand animate-pulse'></span>
                )}
              </li>
            </div>
          );
        })}
      </ul>

      {/* Bar to show the Day and total classes */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 sm:gap-3 flex-row flex-wrap items-center justify-start">
          <h2 className="text-base sm:text-lg font-semibold text-primary">
            {fullDayNames[selectedDay]}
          </h2>
          <span className="text-xs text-secondary">
            ({selectedDayStats.lectures?.length || 0} scheduled classes)
          </span>
        </div>

        {/*  Schedule View for the selected day */}
        <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/2 text-primary font-sans text-sm">
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
                  currentDateIso={selectedDayStats.startOfDay}
                  setToastConfig={setToastConfig}
                  setModalConfig={setModalConfig}
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

      {/* Unscheduled Subjects configuration helper */}
      {unscheduledSubjects.length > 0 && (
        <div className="p-3 sm:p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-primary font-sans mt-4">
          <div className="flex items-center gap-2 text-yellow-500 mb-2 md:mb-3">
            <AlertTriangle className="h-4.5 w-4.5 md:h-5 md:w-5" />
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider">Unscheduled Subjects</h3>
          </div>
          <p className="text-secondary text-[11px] sm:text-xs mb-3 md:mb-4 leading-relaxed">
            The following subjects in your current semester do not have any class timings configured. Configure their days and timings below to add them to your weekly timetable:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {unscheduledSubjects.map((sub) => (
              <div key={sub.id} className="p-3 sm:p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-2.5 md:gap-3">
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-primary">{sub.name}</h4>
                  <p className="text-[10px] sm:text-xs text-secondary font-mono">{sub.code} • {sub.credits} Credits</p>
                </div>
                
                {/* Inline scheduler form */}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const targetForm = e.target;
                  const day = targetForm.dayOfWeek.value;
                  const start = targetForm.startTime.value;
                  const end = targetForm.endTime.value;
                  const room = targetForm.room.value;
                  const teacher = targetForm.teacher.value;

                  if (!start || !end) {
                    setToastConfig({
                      isOpen: true,
                      title: "Validation Error",
                      description: "Start and End times are required.",
                      type: "error"
                    });
                    return;
                  }
                  if (start >= end) {
                    setToastConfig({
                      isOpen: true,
                      title: "Validation Error",
                      description: "End Time must be after Start Time.",
                      type: "error"
                    });
                    return;
                  }

                  try {
                    setIsSaving(true);
                    const res = await addTimetableSlot({
                      subjectId: sub.id,
                      dayOfWeek: day,
                      startTime: start,
                      endTime: end,
                      room,
                      teacher
                    });
                    if (res && res.success) {
                      setToastConfig({
                        isOpen: true,
                        title: "Success",
                        description: "Class schedule configured successfully!",
                        type: "success"
                      });
                      router.refresh();
                    } else {
                      setToastConfig({
                        isOpen: true,
                        title: "Database Error",
                        description: res?.error || "Failed to save class slot.",
                        type: "error"
                      });
                    }
                  } catch (err) {
                    setToastConfig({
                      isOpen: true,
                      title: "Error",
                      description: err.message || "Something went wrong.",
                      type: "error"
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }} className="space-y-2.5 md:space-y-3 pt-2.5 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-0.5">Day of class</label>
                      <select name="dayOfWeek" className="w-full text-[11px] sm:text-xs px-2 py-1 h-7 sm:h-8 bg-white/5 border border-white/10 rounded-lg text-primary appearance-none cursor-pointer">
                        <option value="1" className="bg-obsidian text-secondary">Monday</option>
                        <option value="2" className="bg-obsidian text-secondary">Tuesday</option>
                        <option value="3" className="bg-obsidian text-secondary">Wednesday</option>
                        <option value="4" className="bg-obsidian text-secondary">Thursday</option>
                        <option value="5" className="bg-obsidian text-secondary">Friday</option>
                        <option value="6" className="bg-obsidian text-secondary">Saturday</option>
                        <option value="0" className="bg-obsidian text-secondary">Sunday</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-0.5">Start</label>
                        <input required type="time" name="startTime" className="w-full text-[11px] sm:text-xs px-1.5 py-1 h-7 sm:h-8 bg-white/5 border border-white/10 rounded-lg focus:outline-none transition-all duration-200" />
                      </div>
                      <div>
                        <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-0.5">End</label>
                        <input required type="time" name="endTime" className="w-full text-[11px] sm:text-xs px-1.5 py-1 h-7 sm:h-8 bg-white/5 border border-white/10 rounded-lg focus:outline-none transition-all duration-200" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-0.5">Room</label>
                      <input type="text" name="room" placeholder="e.g. Room 302" className="w-full text-[11px] sm:text-xs px-2 py-1 h-7 sm:h-8 bg-white/5 border border-white/10 rounded-lg text-primary" />
                    </div>
                    <div>
                      <label className="text-[9px] md:text-[10px] text-secondary uppercase block mb-0.5">Instructor</label>
                      <input type="text" name="teacher" placeholder="Teacher Name" className="w-full text-[11px] sm:text-xs px-2 py-1 h-7 sm:h-8 bg-white/5 border border-white/10 rounded-lg text-primary" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full h-7 sm:h-8 text-[11px] sm:text-xs font-semibold text-obsidian bg-primary rounded-lg hover:bg-primary/90 transition-colors duration-200">
                    {isSaving ? "Saving..." : "Save Class Schedule"}
                  </button>
                </form>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
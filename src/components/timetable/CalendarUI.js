"use client";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import React, { useState, useRef } from "react";
import ModernLectureItem from "../dashboard/ModernLectureItem";
import { addTimetableSlot } from "@/actions/subject";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays, AlertTriangle, Trash2, Clock, MapPin, UserCheck, ArrowUpRight } from "lucide-react";
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

const DAYS_LIST = [
  { label: "Mon", full: "Monday", value: 1 },
  { label: "Tue", full: "Tuesday", value: 2 },
  { label: "Wed", full: "Wednesday", value: 3 },
  { label: "Thu", full: "Thursday", value: 4 },
  { label: "Fri", full: "Friday", value: 5 },
  { label: "Sat", full: "Saturday", value: 6 },
  { label: "Sun", full: "Sunday", value: 0 },
];

const createEmptySlot = (defaultRoom = "", defaultTeacher = "") => ({
  id: Math.random().toString(36).substring(2, 9),
  days: [1], // Default to Monday
  startTime: "",
  endTime: "",
  room: defaultRoom,
  teacher: defaultTeacher,
});

export default function CalendarUI({ weekStats, unscheduledSubjects = [], allSubjects = [] }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [slotBlocks, setSlotBlocks] = useState([createEmptySlot()]);

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

  const handleSubjectChange = (subjectId) => {
    setSelectedSubjectId(subjectId);
    const sub = allSubjects.find(s => s.id === subjectId);
    if (sub) {
      setSlotBlocks(prev => prev.map(block => ({
        ...block,
        room: block.room || sub.defaultRoom || "",
        teacher: block.teacher || sub.defaultTeacher || ""
      })));
    }
  };

  const handleStartSchedulingSubject = (subjectId) => {
    const sub = allSubjects.find(s => s.id === subjectId) || unscheduledSubjects.find(s => s.id === subjectId);
    setSelectedSubjectId(subjectId);
    setSlotBlocks([createEmptySlot(sub?.defaultRoom || "", sub?.defaultTeacher || "")]);
    setIsSchedulingOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const toggleDayInSlot = (slotIndex, dayValue) => {
    setSlotBlocks(prev => {
      const updated = [...prev];
      const targetSlot = { ...updated[slotIndex] };
      const currentDays = [...targetSlot.days];
      
      if (currentDays.includes(dayValue)) {
        if (currentDays.length > 1) {
          targetSlot.days = currentDays.filter(d => d !== dayValue);
        } else {
          setToastConfig({
            isOpen: true,
            title: "Selection Error",
            description: "Each slot must have at least one day selected.",
            type: "error"
          });
          return prev;
        }
      } else {
        targetSlot.days = [...currentDays, dayValue].sort((a, b) => {
          const aNorm = a === 0 ? 7 : a;
          const bNorm = b === 0 ? 7 : b;
          return aNorm - bNorm;
        });
      }
      updated[slotIndex] = targetSlot;
      return updated;
    });
  };

  const updateSlotField = (slotIndex, field, value) => {
    setSlotBlocks(prev => {
      const updated = [...prev];
      updated[slotIndex] = { ...updated[slotIndex], [field]: value };
      return updated;
    });
  };

  const addAnotherSlotBlock = () => {
    const sub = allSubjects.find(s => s.id === selectedSubjectId);
    setSlotBlocks(prev => [
      ...prev,
      createEmptySlot(sub?.defaultRoom || "", sub?.defaultTeacher || "")
    ]);
  };

  const removeSlotBlock = (slotIndex) => {
    if (slotBlocks.length <= 1) return;
    setSlotBlocks(prev => prev.filter((_, idx) => idx !== slotIndex));
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      setToastConfig({
        isOpen: true,
        title: "Validation Error",
        description: "Please select a subject to schedule.",
        type: "error"
      });
      return;
    }

    // Validate all slot blocks
    for (let i = 0; i < slotBlocks.length; i++) {
      const block = slotBlocks[i];
      if (!block.days || block.days.length === 0) {
        setToastConfig({
          isOpen: true,
          title: "Validation Error",
          description: `Please select at least one day for Timing #${i + 1}.`,
          type: "error"
        });
        return;
      }
      if (!block.startTime || !block.endTime) {
        setToastConfig({
          isOpen: true,
          title: "Validation Error",
          description: `Start and End times are required for Timing #${i + 1}.`,
          type: "error"
        });
        return;
      }
      if (block.startTime >= block.endTime) {
        setToastConfig({
          isOpen: true,
          title: "Validation Error",
          description: `End time must be after Start time for Timing #${i + 1}.`,
          type: "error"
        });
        return;
      }
    }

    try {
      setIsSaving(true);
      const res = await addTimetableSlot({
        subjectId: selectedSubjectId,
        slots: slotBlocks
      });

      if (res && res.success) {
        setSelectedSubjectId("");
        setSlotBlocks([createEmptySlot()]);
        setIsSchedulingOpen(false);
        setToastConfig({
          isOpen: true,
          title: "Success",
          description: res.message || "Class schedule saved successfully!",
          type: "success"
        });
        router.refresh();
      } else {
        setToastConfig({
          isOpen: true,
          title: "Database Error",
          description: res?.error || "Failed to add timetable slots.",
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
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-sans text-primary">Weekly Timetable</h1>
            <p className="text-xs text-secondary hidden sm:block">Manage your class slots and weekly routine</p>
          </div>
          <button
            onClick={() => {
              setIsSchedulingOpen(!isSchedulingOpen);
              if (!isSchedulingOpen && slotBlocks.length === 0) {
                setSlotBlocks([createEmptySlot()]);
              }
            }}
            className="px-3 py-2 text-xs text-obsidian bg-primary rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} />
            Add Class Slot
          </button>
        </div>

        {/* Multi-Day & Multi-Slot Schedule Form Card */}
        {isSchedulingOpen && (
          <form 
            ref={formRef}
            onSubmit={handleScheduleSubmit} 
            className="p-4 md:p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl text-primary font-sans space-y-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-primary uppercase tracking-wider">
                    Schedule Subject Timetable
                  </h3>
                  <p className="text-[10px] sm:text-xs text-secondary">
                    Assign multiple days and timing slots for this subject in one go
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsSchedulingOpen(false)} 
                className="text-[11px] sm:text-xs text-secondary hover:text-primary transition-colors cursor-pointer px-2 py-1"
              >
                Cancel
              </button>
            </div>

            {/* Subject Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] sm:text-[11px] font-semibold text-secondary uppercase tracking-wider">
                Select Subject <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 h-9 sm:h-10 bg-white/5 border border-white/10 rounded-xl text-primary appearance-none cursor-pointer focus:outline-none focus:border-brand/40 transition-colors"
              >
                <option value="" className="bg-obsidian text-secondary"> Choose a Subject to Schedule </option>
                {[...allSubjects].sort((a, b) => {
                  const aIsLab = /lab|practical|laboratory|workshop/i.test(`${a.name || ""} ${a.code || ""}`);
                  const bIsLab = /lab|practical|laboratory|workshop/i.test(`${b.name || ""} ${b.code || ""}`);
                  return aIsLab === bIsLab ? 0 : aIsLab ? 1 : -1;
                }).map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-obsidian text-secondary">
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Slot Groups (Multiple Days + Multiple Timings) */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={13} className="text-brand" />
                  Class Timings & Days ({slotBlocks.length} {slotBlocks.length === 1 ? 'Slot Group' : 'Slot Groups'})
                </span>
                <button
                  type="button"
                  onClick={addAnotherSlotBlock}
                  className="text-[11px] sm:text-xs font-semibold text-brand hover:text-brand/80 transition-colors flex items-center gap-1 bg-brand/10 hover:bg-brand/15 border border-brand/20 px-2.5 py-1 rounded-lg"
                >
                  <Plus size={13} />
                  Add Another Timing
                </button>
              </div>

              {slotBlocks.map((slot, index) => (
                <div 
                  key={slot.id} 
                  className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/2 space-y-3 relative group"
                >
                  {slotBlocks.length > 1 && (
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono uppercase text-secondary font-semibold">
                        Timing Option #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSlotBlock(index)}
                        className="text-rose-400/70 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors p-1"
                        title="Remove timing block"
                      >
                        <Trash2 size={13} />
                        <span className="text-[10px]">Remove</span>
                      </button>
                    </div>
                  )}

                  {/* Day Pills Selector (Multi-select) */}
                  <div>
                    <label className="text-[9px] sm:text-[10px] text-secondary uppercase block mb-1.5">
                      Days of the Week <span className="text-secondary/60 lowercase font-normal">(select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {DAYS_LIST.map((day) => {
                        const isSelected = slot.days.includes(day.value);
                        return (
                          <button
                            type="button"
                            key={day.value}
                            onClick={() => toggleDayInSlot(index, day.value)}
                            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium font-mono transition-all duration-150 border ${
                              isSelected
                                ? "bg-primary text-obsidian font-bold border-primary shadow-sm"
                                : "bg-white/5 text-secondary hover:text-primary border-white/10 hover:border-white/20"
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timing Inputs & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                    <div>
                      <label className="text-[9px] sm:text-[10px] text-secondary uppercase block mb-1">Start Time</label>
                      <input
                        required
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlotField(index, "startTime", e.target.value)}
                        className={`w-full text-xs px-2.5 py-1.5 h-8 sm:h-9 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand/40 transition-colors ${
                          slot.startTime ? "text-primary" : "text-primary/30"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] sm:text-[10px] text-secondary uppercase block mb-1">End Time</label>
                      <input
                        required
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlotField(index, "endTime", e.target.value)}
                        className={`w-full text-xs px-2.5 py-1.5 h-8 sm:h-9 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand/40 transition-colors ${
                          slot.endTime ? "text-primary" : "text-primary/30"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] sm:text-[10px] text-secondary uppercase block mb-1">Room / Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Room 302, Lab A"
                        value={slot.room}
                        onChange={(e) => updateSlotField(index, "room", e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 h-8 sm:h-9 bg-white/5 border border-white/10 rounded-lg text-primary placeholder:text-secondary/40 focus:outline-none focus:border-brand/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] sm:text-[10px] text-secondary uppercase block mb-1">Instructor</label>
                      <input
                        type="text"
                        placeholder="Teacher Name"
                        value={slot.teacher}
                        onChange={(e) => updateSlotField(index, "teacher", e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 h-8 sm:h-9 bg-white/5 border border-white/10 rounded-lg text-primary placeholder:text-secondary/40 focus:outline-none focus:border-brand/40 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-obsidian bg-primary rounded-xl hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 shadow-sm flex items-center gap-1.5"
              >
                {isSaving ? "Saving..." : `Save Class Schedule (${slotBlocks.reduce((acc, b) => acc + (b.days?.length || 0), 0)} Slots)`}
              </button>
              <button
                type="button"
                onClick={() => setIsSchedulingOpen(false)}
                className="px-3 py-2 text-xs text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
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

          {/* Schedule View for the selected day */}
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
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-secondary text-xs sm:text-sm font-mono mb-2">
                  No classes scheduled for {fullDayNames[selectedDay]}.
                </p>
                <button
                  onClick={() => {
                    const dayObj = DAYS_LIST.find(d => d.label === selectedDay);
                    setSlotBlocks([createEmptySlot("", "")]);
                    if (dayObj) {
                      setSlotBlocks([{ ...createEmptySlot("", ""), days: [dayObj.value] }]);
                    }
                    setIsSchedulingOpen(true);
                  }}
                  className="text-xs text-brand hover:underline font-medium flex items-center gap-1"
                >
                  <Plus size={13} />
                  Add a class for this day
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Unscheduled Subjects Helper Cards */}
        {unscheduledSubjects.length > 0 && (
          <div className="p-3 sm:p-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 text-primary font-sans mt-2">
            <div className="flex items-center gap-2 text-yellow-500 mb-1.5 md:mb-2">
              <AlertTriangle className="h-4 w-4 md:h-4.5 md:w-4.5" />
              <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Unscheduled Subjects ({unscheduledSubjects.length})
              </h3>
            </div>
            <p className="text-secondary text-[11px] sm:text-xs mb-3 md:mb-4 leading-relaxed">
              The following subjects in your current semester do not have any class timings set on your weekly calendar yet:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unscheduledSubjects.map((sub) => (
                <div 
                  key={sub.id} 
                  className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/3 flex flex-col justify-between gap-3 hover:border-white/20 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-xs sm:text-sm text-primary line-clamp-1">{sub.name}</h4>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-white/5 border border-white/10 text-secondary shrink-0">
                        {sub.credits} Cr
                      </span>
                    </div>
                    <p className="text-[10px] text-secondary font-mono">{sub.code}</p>
                    
                    {(sub.defaultRoom || sub.defaultTeacher) && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-secondary/80">
                        {sub.defaultRoom && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} className="text-secondary/50" /> {sub.defaultRoom}
                          </span>
                        )}
                        {sub.defaultTeacher && (
                          <span className="flex items-center gap-1">
                            <UserCheck size={10} className="text-secondary/50" /> {sub.defaultTeacher}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartSchedulingSubject(sub.id)}
                    className="w-full h-8 text-[11px] font-semibold text-obsidian bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus size={13} />
                    Schedule Classes
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
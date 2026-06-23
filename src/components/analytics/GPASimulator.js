"use client";
import React, { useState, useEffect } from "react";
import { Sliders, AlertCircle, CheckCircle } from "lucide-react";

export default function GPASimulator({ totalSems, targetCgpa, currentCgpa, currentSem }) {
  const maxSems = 8;
  
  const getInitialSemesters = () => {
    const list = [];
    for (let i = 1; i <= maxSems; i++) {
      const existing = totalSems.find((s) => s.semester === i);
      const isSemLocked = existing && existing.semester !== currentSem && existing.status !== "Ongoing";
      
      if (existing) {
        list.push({
          semester: i,
          sgpa: existing.sgpa || 0,
          credits: existing.credits || 20, // use database credit counts if available
          isCompleted: isSemLocked,
        });
      } else {
        list.push({
          semester: i,
          sgpa: 8.0, // default expected SGPA for simulated sems
          credits: 20,
          isCompleted: false,
        });
      }
    }
    return list;
  };

  const [semesters, setSemesters] = useState(getInitialSemesters());
  const [simulatedCgpa, setSimulatedCgpa] = useState(currentCgpa || 0);

  // Recalculate simulated CGPA whenever semesters change
  useEffect(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    semesters.forEach((sem) => {
      totalPoints += sem.sgpa * sem.credits;
      totalCredits += sem.credits;
    });

    const cgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
    setSimulatedCgpa(cgpa);
  }, [semesters]);

  const handleSgpaChange = (index, value) => {
    const updated = [...semesters];
    updated[index].sgpa = Number(value);
    setSemesters(updated);
  };

  const handleCreditsChange = (index, value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    const updated = [...semesters];
    updated[index].credits = num;
    setSemesters(updated);
  };

  const deficit = targetCgpa - simulatedCgpa;
  const isGoalAchieved = simulatedCgpa >= targetCgpa;

  return (
    <div className="mt-4 md:mt-8 bg-white/2 border border-white/8 backdrop-blur-xl rounded-2xl p-4 md:p-8 hover:shadow-2xl transition-all duration-300">
      
      {/* Header */}
      <header className="flex items-center gap-3 mb-4 md:mb-6 border-b border-white/5 pb-3 md:pb-4">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
          <Sliders size={18} />
        </div>
        <div>
          <h3 className="text-white text-sm md:text-base font-semibold tracking-wide">
            GPA Forecaster & Simulator
          </h3>
          <p className="text-secondary text-[10px] md:text-xs mt-0.5">
            Slide future semester targets to project cumulative GPA pathways.
          </p>
        </div>
      </header>

      {/* Simulator Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        
        {/* Simulated CGPA Indicator */}
        <div className="bg-white/1 border border-white/5 rounded-xl p-3 md:p-4 flex flex-col justify-center relative overflow-hidden">
          <span className="text-secondary text-[9px] md:text-[10px] uppercase font-mono tracking-wider">Simulated CGPA</span>
          <div className="flex items-end gap-2 mt-1.5">
            <span className="text-2xl md:text-3xl font-bold font-mono text-white leading-none">
              {simulatedCgpa.toFixed(2)}
            </span>
            <span className="text-secondary text-[10px] md:text-xs font-mono mb-0.5">/ {targetCgpa} Target</span>
          </div>
          {/* Subtle progress bar */}
          <div className="w-full bg-white/5 h-1 md:h-1.5 rounded-full mt-3 md:mt-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${isGoalAchieved ? "bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-brand animate-pulse"}`}
              style={{ width: `${Math.min(100, (simulatedCgpa / 10) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Target Deficit Alerts */}
        <div className="md:col-span-2 bg-white/1 border border-white/5 rounded-xl p-3 md:p-4 flex flex-col justify-center">
          <span className="text-secondary text-[9px] md:text-[10px] uppercase font-mono tracking-wider">Goal Alignment Status</span>
          
          <div className="flex items-start gap-2.5 md:gap-3 mt-2 md:mt-3">
            {isGoalAchieved ? (
              <>
                <CheckCircle className="text-success shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-success text-[11px] md:text-xs font-semibold uppercase tracking-wide">Goal Secured</p>
                  <p className="text-secondary text-[10px] md:text-[11px] font-mono mt-0.5">
                    Your simulated pathway hits your {targetCgpa} target! You have a surplus of <span className="text-success font-bold font-mono">+{Math.abs(deficit).toFixed(2)}</span>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="text-warning shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-warning text-[11px] md:text-xs font-semibold uppercase tracking-wide">Deficit Warning</p>
                  <p className="text-secondary text-[10px] md:text-[11px] font-mono mt-0.5">
                    You are short by <span className="text-warning font-bold font-mono">-{Math.abs(deficit).toFixed(2)}</span>. Increase your future SGPA sliders to map a successful recovery trajectory.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Simulator Sliders */}
      <div className="space-y-3">
        <h4 className="text-secondary text-[10px] md:text-xs uppercase font-mono tracking-wider mb-1 md:mb-2">Semester Projections Ledger</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {semesters.map((sem, index) => {
            return (
              <div 
                key={sem.semester}
                className={`p-3 md:p-4 rounded-xl border transition-all duration-300 ${
                  sem.isCompleted 
                    ? "bg-white/1 border-white/5 opacity-75 hover:opacity-100" 
                    : "bg-white/2 border-white/10 ring-1 ring-brand/10 hover:border-brand/40"
                }`}
              >
                {/* Semester Heading */}
                <div className="flex justify-between items-center mb-2 md:mb-3">
                  <span className="font-semibold text-[11px] md:text-xs text-white">
                    Semester {sem.semester} 
                    {!sem.isCompleted && <span className="ml-2 text-[9px] md:text-[10px] px-1 py-0.5 rounded bg-brand/20 text-brand border border-brand/20 font-mono">SIMULATED</span>}
                    {sem.isCompleted && <span className="ml-2 text-[9px] md:text-[10px] px-1 py-0.5 rounded bg-success/15 text-success border border-success/10 font-mono font-light">LOCKED (DB)</span>}
                  </span>
                  
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-[10px] md:text-xs text-secondary font-mono">Credits:</span>
                    <input
                      type="number"
                      value={sem.credits}
                      onChange={(e) => handleCreditsChange(index, e.target.value)}
                      disabled={sem.isCompleted}
                      className="w-9 md:w-12 bg-obsidian border border-white/10 rounded px-1 py-0.5 text-center text-[10px] md:text-xs font-mono text-white focus:outline-none focus:border-brand disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Slider Row */}
                <div className="flex items-center gap-3 md:gap-4">
                  <input
                    type="range"
                    min="0.0"
                    max="10.0"
                    step="0.1"
                    value={sem.sgpa}
                    onChange={(e) => handleSgpaChange(index, e.target.value)}
                    disabled={sem.isCompleted}
                    className="grow h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-xs md:text-sm font-bold font-mono min-w-[32px] text-right text-white">
                    {sem.sgpa.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

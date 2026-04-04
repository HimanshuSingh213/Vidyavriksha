"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/8 bg-obsidian/90 p-3 shadow-xl backdrop-blur-md">
        <p className="mb-1 text-xs text-secondary">{label}</p>
        <p className="text-sm font-medium text-primary">
          SGPA: <span className="font-mono">{payload[0].value.toFixed(2)}</span>
        </p>
      </div>
    );
  }

  return null;
};

export default function SGPAProgressionChart({ data, targetCgpa = 8.0 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-white/8 bg-white/2 p-6 text-center text-sm text-secondary backdrop-blur-xl">
        No SGPA data available.
      </div>
    );
  }

  // 1. Calculate Statistics (Ignoring 0 values for uncompleted semesters)
  const validSgpas = data.filter((d) => d.sgpa > 0).map((d) => d.sgpa);
  
  const highestSgpa = validSgpas.length > 0 ? Math.max(...validSgpas).toFixed(2) : "N/A";
  const lowestSgpa = validSgpas.length > 0 ? Math.min(...validSgpas).toFixed(2) : "N/A";
  
  const totalSgpa = validSgpas.reduce((sum, val) => sum + val, 0);
  const currentCgpa = validSgpas.length > 0 ? (totalSgpa / validSgpas.length).toFixed(2) : "0.00";

  // 2. Helper function for color coding the semester blocks
  const getScoreColor = (sgpa) => {
    if (sgpa === 0) return "border-white/8 bg-white/4 text-secondary";
    if (sgpa >= 8.0) return "border-success/20 bg-success/10 text-success";
    if (sgpa >= 6.0) return "border-warning/20 bg-warning/10 text-warning";
    return "border-danger/20 bg-danger/10 text-danger";
  };

  return (
    <div className="flex w-full flex-col rounded-2xl border border-white/8 bg-white/2 p-6 shadow-brand/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      
      {/* Top Section: Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-brand/20 bg-brand/10 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand">Current CGPA</p>
          <p className="text-2xl font-bold text-primary">{currentCgpa}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/4 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-secondary">Target CGPA</p>
          <p className="text-2xl font-bold text-primary">{targetCgpa.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-success/20 bg-success/10 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">Highest SGPA</p>
          <p className="text-2xl font-bold text-primary">{highestSgpa}</p>
        </div>
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-danger">Lowest SGPA</p>
          <p className="text-2xl font-bold text-primary">{lowestSgpa}</p>
        </div>
      </div>

      {/* Middle Section: The Line Chart */}
      <div className="h-[280px] w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            
            <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }} dy={10} />
            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }} />
            
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            
            {/* The Horizontal Dotted Target Line */}
            <ReferenceLine 
              y={targetCgpa} 
              stroke="rgb(156, 163, 175)" 
              strokeDasharray="4 4" 
              label={{ position: "top", value: "Target Goal", fill: "rgb(156, 163, 175)", fontSize: 11 }} 
            />
            
            <Line 
              type="monotone" 
              dataKey="sgpa" 
              name="SGPA" 
              stroke="rgb(45, 91, 255)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "rgb(8, 10, 12)", stroke: "rgb(45, 91, 255)", strokeWidth: 2 }} 
              activeDot={{ r: 6, fill: "rgb(45, 91, 255)", stroke: "rgb(8, 10, 12)", strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Section: Color-Coded Semester Grid */}
      <div className="border-t border-white/8 pt-6">
        <h4 className="mb-4 text-sm font-semibold text-primary">Semester Breakdown</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {data.map((item, index) => {
            const colorClass = getScoreColor(item.sgpa);
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center justify-center p-3 rounded-lg border ${colorClass} transition-all`}
              >
                <span className="mb-1 text-xs font-semibold opacity-80">{item.semester}</span>
                <span className="text-lg font-bold">
                  {item.sgpa > 0 ? item.sgpa.toFixed(2) : "---"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

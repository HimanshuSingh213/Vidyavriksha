"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/8 bg-obsidian/90 p-3 shadow-xl backdrop-blur-md">
        <p className="mb-1 text-xs text-secondary">{label}</p>
        <p className="text-sm font-medium text-primary">
          Total Score: <span className="font-mono">{payload[0].value} / 100</span>
        </p>
      </div>
    );
  }

  return null;
};

export default function RadialChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-[450px] w-full items-center justify-center rounded-2xl border border-white/8 bg-white/2 p-4 text-sm text-secondary backdrop-blur-xl">
        No performance data available.
      </div>
    );
  }

  const strongSubjects = data.filter((item) => item.score >= 75);
  const improvementSubjects = data.filter((item) => item.score < 60);

  const formatXAxis = (tickItem) => tickItem.length > 12 ? `${tickItem.substring(0, 12)}...` : tickItem;

  return (
    <div className="flex w-full flex-col rounded-2xl border border-white/8 bg-white/2 p-6 shadow-brand/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-primary">Skill Web</h3>
        <p className="text-sm text-secondary">Overall performance across subjects</p>
      </div>

      <div className="mb-6 mt-2 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }}
              tickFormatter={formatXAxis}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

            <Tooltip content={<CustomTooltip />} />

            <Radar
              name="Student Score"
              dataKey="score"
              stroke="rgb(45, 91, 255)"
              fill="rgba(45, 91, 255, 0.32)"
              fillOpacity={1}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-success/20 bg-success/10 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success"></span>
            Strong Performance
          </h4>
          {strongSubjects.length > 0 ? (
            <ul className="space-y-1 text-xs text-primary">
              {strongSubjects.map((sub, i) => (
                <li key={i} className="font-medium">- {sub.subject} ({sub.score}%)</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic text-secondary">Keep pushing. You&apos;ll get there.</p>
          )}
        </div>

        <div className="rounded-xl border border-danger/20 bg-danger/10 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-danger">
            <span className="h-2 w-2 rounded-full bg-danger"></span>
            Needs Improvement
          </h4>
          {improvementSubjects.length > 0 ? (
            <ul className="space-y-1 text-xs text-primary">
              {improvementSubjects.map((sub, i) => (
                <li key={i} className="font-medium">- {sub.subject} ({sub.score}%)</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic text-secondary">All subjects are looking good.</p>
          )}
        </div>
      </div>
    </div>
  );
}

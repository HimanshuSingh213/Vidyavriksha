"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/8 bg-obsidian/90 p-2 md:p-3 shadow-xl backdrop-blur-md max-w-[180px] md:max-w-none">
        <p className="mb-1 text-[10px] md:text-xs text-secondary truncate">{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} className="text-xs md:text-sm font-medium text-primary flex justify-between gap-3">
            <span className="truncate">{entry.name}:</span>
            <span className="font-mono font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default function MarksStackedChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-2xl border border-white/8 bg-white/2 p-4 text-sm text-secondary backdrop-blur-xl">
        No marks data available for this semester.
      </div>
    );
  }

  const truncateText = (text) => {
    return text.length > 12 ? `${text.substring(0, 12)}...` : text;
  };

  return (
    <div className="relative h-[350px] w-full rounded-2xl border border-white/8 bg-white/2 p-6 shadow-brand/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">Score Breakdown</h3>
        <p className="text-sm text-secondary">Internal vs External marks</p>
      </div>

      <div className="h-[230px] w-full overflow-x-auto scrollbar-thin">
        <div className="h-full min-w-[500px] md:min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={38}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />

              <XAxis
                dataKey="subject"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }}
                dy={10}
                tickFormatter={truncateText}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }}
                domain={[0, 100]}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />

              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => <span style={{ color: "rgb(248, 249, 252)" }}>{value}</span>}
              />

              <Bar
                dataKey="internal"
                name="Internal Marks"
                stackId="a"
                fill="rgb(45, 91, 255)"
                radius={[0, 0, 6, 6]}
              />

              <Bar
                dataKey="external"
                name="External Marks"
                stackId="a"
                fill="rgba(248, 249, 252, 0.35)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

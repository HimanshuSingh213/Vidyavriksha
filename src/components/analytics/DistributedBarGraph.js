"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/8 bg-obsidian/90 p-3 shadow-xl backdrop-blur-md">
        <p className="mb-1 text-xs text-secondary">{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} className="text-sm font-medium text-primary">
            {entry.name}: <span className="font-mono">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default function DistributedBarGraph({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-2xl border border-white/8 bg-white/2 p-4 text-sm text-secondary backdrop-blur-xl">
        No exam comparison data available.
      </div>
    );
  }

  const truncateText = (text) => text.length > 10 ? `${text.substring(0, 10)}...` : text;

  return (
    <div className="flex h-[400px] w-full flex-col rounded-2xl border border-white/8 bg-white/2 p-6 shadow-brand/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">Exam Performance Comparison</h3>
        <p className="text-sm text-secondary">Minor 1, Minor 2, and End Sem scores across all subjects</p>
      </div>

      <div className="min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              dataKey="minor1"
              name="Minor 1"
              fill="rgb(45, 91, 255)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="minor2"
              name="Minor 2"
              fill="rgb(16, 185, 129)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="endsem"
              name="End Semester"
              fill="rgb(245, 158, 11)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

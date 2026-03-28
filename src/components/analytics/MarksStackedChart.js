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
    <div className="relative h-[350px] w-full rounded-2xl border border-white/8 bg-white/2 p-6 shadow-brand/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">Score Breakdown</h3>
        <p className="text-sm text-secondary">Internal vs External marks</p>
      </div>

      <div className="h-[250px] w-full">
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
  );
}

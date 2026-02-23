"use client"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

// Temporary dummy data until your backend is wired up
const mockData = [
    { Name: "Sem 1", sgpa: 8.12 },
    { Name: "Sem 2", sgpa: 8.45 },
    { Name: "Sem 3", sgpa: 8.30 },
    { Name: "Sem 4", sgpa: 8.90 },
    { Name: "Sem 5", sgpa: 9.15 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-obsidian/90 backdrop-blur-md border border-white/8 p-3 rounded-lg shadow-xl">
                <p className="text-secondary text-xs mb-1">{label}</p>
                <p className="text-brand font-mono font-bold text-lg">
                    {payload[0].value.toFixed(2)} SGPA
                </p>
            </div>
        );
    }
    return null;
};

export default function SgpaChart({ data = mockData }) {
    return (
        <div className="w-full h-[300px] bg-white/2 border border-white/8 rounded-2xl p-6 relative hover:shadow-2xl drop-shadow-brand group hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-secondary text-sm font-medium uppercase tracking-wider mb-6">
                SGPA Trajectory
            </h3>

            {/* ResponsiveContainer */}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>

                    {/* Faint grid lines to guide the eye without adding clutter */}
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />

                    <XAxis
                        dataKey="Name"
                        stroke="rgb(156, 163, 175)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />

                    <YAxis
                        stroke="rgb(156, 163, 175)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 10]} // Locks the scale from 0 to 10 for CGPA
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />

                    {/* The actual line */}
                    <Line
                        type="monotone"
                        dataKey="sgpa"
                        stroke="rgb(45, 91, 255)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "rgb(8, 10, 12)", stroke: "rgb(45, 91, 255)", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "rgb(45, 91, 255)", stroke: "rgb(8, 10, 12)", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
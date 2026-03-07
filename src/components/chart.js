//src>components>chart.js
import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Chart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="w-full h-56 flex items-center justify-center rounded-xl bg-[#0b1020]/50 border-2 border-dashed border-white/5">
        <div className="text-gray-600 text-lg font-bold">No data</div>
      </div>
    );
  }
  return (
    <div className="w-full h-56 rounded-xl bg-transparent flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
              <stop offset="90%" stopColor="#38bdf8" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
            width={50}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#0f1424",
              border: "1px solid #1a2343",
              borderRadius: 12,
              color: "#fff",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
            }}
            labelStyle={{ color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: "#38bdf8", fontWeight: 700 }}
            formatter={v => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#38bdf8"
            fill="url(#chartColor)"
            strokeWidth={3}
            dot={false}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

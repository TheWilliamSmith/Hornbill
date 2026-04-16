"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeightEntry } from "@/types/weight.type";
import { Loader2, TrendingDown } from "lucide-react";

interface WeightChartProps {
  entries: WeightEntry[];
  isLoading: boolean;
}

function formatChartDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: {
    value: number;
    payload: { unit: string; fullDate: string; note?: string };
  }[];
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <div className="bg-white rounded-xl border border-black/10 shadow-lg shadow-black/5 px-4 py-3">
      <p className="text-sm font-semibold text-black">
        {data.value}
        <span className="text-black/30 font-normal ml-1 text-xs">
          {data.payload.unit.toLowerCase()}
        </span>
      </p>
      <p className="text-[11px] text-black/40 mt-0.5">
        {data.payload.fullDate}
      </p>
      {data.payload.note && (
        <p className="text-[11px] text-violet-500 mt-1 max-w-[160px] truncate">
          {data.payload.note}
        </p>
      )}
    </div>
  );
}

export default function WeightChart({ entries, isLoading }: WeightChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <Loader2 size={20} className="animate-spin text-black/20" />
      </div>
    );
  }

  if (entries.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
          <TrendingDown size={20} className="text-violet-400" />
        </div>
        <p className="text-sm text-black/30">Not enough data</p>
        <p className="text-[11px] text-black/20 mt-0.5">
          Log at least 2 entries to see your chart
        </p>
      </div>
    );
  }

  const chartData = [...entries].reverse().map((entry) => ({
    date: formatChartDate(entry.measuredAt),
    weight: entry.weight,
    unit: entry.unit,
    fullDate: new Date(entry.measuredAt).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    note: entry.note,
  }));

  const weights = chartData.map((d) => d.weight);
  const min = Math.floor(Math.min(...weights) - 2);
  const max = Math.ceil(Math.max(...weights) + 2);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "rgba(0,0,0,0.25)" }}
            dy={8}
          />
          <YAxis
            domain={[min, max]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "rgba(0,0,0,0.25)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            fill="url(#weightGradient)"
            dot={{ r: 4, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{
              r: 6,
              fill: "#8b5cf6",
              stroke: "#fff",
              strokeWidth: 3,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import type { WeightEntry, WeightGoal } from "@/types/weight.type";
import {
  WeightGoalDirection,
  WeightGoalStatus,
  WeightGoalMode,
} from "@/types/weight.type";
import { Loader2, TrendingDown } from "lucide-react";

interface WeightChartProps {
  entries: WeightEntry[];
  goals?: WeightGoal[];
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

function getGoalColor(direction: WeightGoalDirection) {
  switch (direction) {
    case WeightGoalDirection.LOSE:
      return "#10b981"; // emerald-500
    case WeightGoalDirection.GAIN:
      return "#f59e0b"; // amber-500
    case WeightGoalDirection.MAINTAIN:
      return "#3b82f6"; // blue-500
    default:
      return "#6b7280"; // gray-500
  }
}

function getGoalLabel(goal: WeightGoal) {
  const prefix =
    goal.direction === WeightGoalDirection.LOSE
      ? "Target: "
      : goal.direction === WeightGoalDirection.GAIN
        ? "Goal: "
        : "Maintain: ";

  const weightLabel = `${prefix}${goal.targetWeight}${goal.unit.toLowerCase()}`;

  return weightLabel;
}

function getDeadlineLabel(goal: WeightGoal) {
  const arrow =
    goal.direction === WeightGoalDirection.LOSE
      ? "↓"
      : goal.direction === WeightGoalDirection.GAIN
        ? "↑"
        : "→";

  if (goal.deadline) {
    const deadlineDate = new Date(goal.deadline);
    const dateStr = deadlineDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${arrow} ${goal.targetWeight}${goal.unit.toLowerCase()} by ${dateStr}`;
  }

  return `${arrow} ${goal.targetWeight}${goal.unit.toLowerCase()}`;
}

export default function WeightChart({
  entries,
  goals = [],
  isLoading,
}: WeightChartProps) {
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
    timestamp: new Date(entry.measuredAt).getTime(),
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

  // Filter active goals only
  const activeGoals = goals.filter(
    (goal) => goal.status === WeightGoalStatus.IN_PROGRESS,
  );

  // Separate milestone and deadline goals
  const milestoneGoals = activeGoals.filter(
    (goal) => goal.mode === WeightGoalMode.MILESTONE,
  );
  const deadlineGoals = activeGoals.filter(
    (goal) => goal.mode === WeightGoalMode.DEADLINE && goal.deadline,
  );

  let extendedChartData = [...chartData];
  if (deadlineGoals.length > 0) {
    const lastEntryDate = new Date(
      entries[entries.length - 1].measuredAt,
    ).getTime();

    deadlineGoals.forEach((goal) => {
      const deadlineTime = new Date(goal.deadline!).getTime();
      if (deadlineTime > lastEntryDate) {
        extendedChartData.push({
          date: formatChartDate(goal.deadline!),
          timestamp: deadlineTime,
          weight: null as any,
          unit: entries[entries.length - 1].unit,
          fullDate: "",
          note: undefined,
        });
      }
    });

    extendedChartData.sort((a, b) => a.timestamp - b.timestamp);

    const maxDeadline = Math.max(
      ...deadlineGoals.map((g) => new Date(g.deadline!).getTime()),
    );
    const daysDiff = Math.ceil(
      (maxDeadline - lastEntryDate) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff > 0) {
      const interval = Math.max(3, Math.ceil(daysDiff / 8));
      const fillerPoints = [];

      for (let i = 1; i <= Math.ceil(daysDiff / interval); i++) {
        const futureDate = new Date(
          lastEntryDate + i * interval * 24 * 60 * 60 * 1000,
        );
        if (futureDate.getTime() < maxDeadline) {
          const dateStr = formatChartDate(futureDate.toISOString());
          // Don't add if it already exists (e.g., a deadline)
          if (!extendedChartData.some((d) => d.date === dateStr)) {
            fillerPoints.push({
              date: dateStr,
              timestamp: futureDate.getTime(),
              weight: null as any,
              unit: entries[entries.length - 1].unit,
              fullDate: "",
              note: undefined,
            });
          }
        }
      }

      extendedChartData = [...extendedChartData, ...fillerPoints].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
    }
  }

  // Calculate min/max including goals
  const weights = chartData.map((d) => d.weight);
  const goalWeights = activeGoals.map((g) => g.targetWeight);
  const allWeights = [...weights, ...goalWeights];
  const min = Math.floor(Math.min(...allWeights) - 2);
  const max = Math.ceil(Math.max(...allWeights) + 2);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={extendedChartData}
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
            connectNulls={false}
            dot={{ r: 4, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{
              r: 6,
              fill: "#8b5cf6",
              stroke: "#fff",
              strokeWidth: 3,
            }}
          />

          {/* Milestone goal reference lines - horizontal only */}
          {milestoneGoals.map((goal) => (
            <ReferenceLine
              key={goal.id}
              y={goal.targetWeight}
              stroke={getGoalColor(goal.direction)}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: getGoalLabel(goal),
                position: "insideTopRight",
                fill: getGoalColor(goal.direction),
                fontSize: 11,
                fontWeight: 600,
                offset: 8,
              }}
            />
          ))}

          {/* Deadline goal reference lines - vertical only at deadline */}
          {deadlineGoals.map((goal) => {
            const deadlineDate = formatChartDate(goal.deadline!);
            const color = getGoalColor(goal.direction);

            console.log("Rendering deadline goal:", {
              id: goal.id,
              deadline: goal.deadline,
              deadlineDate,
              targetWeight: goal.targetWeight,
              color,
            });

            return (
              <ReferenceLine
                key={goal.id}
                x={deadlineDate}
                stroke={color}
                strokeWidth={3}
                strokeDasharray="8 4"
                isFront={true}
                label={{
                  value: getDeadlineLabel(goal),
                  position: "top",
                  fill: color,
                  fontSize: 12,
                  fontWeight: 700,
                  offset: 10,
                }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

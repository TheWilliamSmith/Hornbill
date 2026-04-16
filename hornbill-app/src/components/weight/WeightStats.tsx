"use client";

import type { WeightEntry, WeightGoal } from "@/types/weight.type";
import { WeightGoalStatus } from "@/types/weight.type";
import {
  TrendingDown,
  TrendingUp,
  Scale,
  Target,
  Flame,
  Calendar,
} from "lucide-react";

interface WeightStatsProps {
  entries: WeightEntry[];
  goals: WeightGoal[];
}

function getChange(entries: WeightEntry[]) {
  if (entries.length < 2) return null;
  const latest = entries[0].weight;
  const previous = entries[1].weight;
  return +(latest - previous).toFixed(2);
}

function getTotalChange(entries: WeightEntry[]) {
  if (entries.length < 2) return null;
  const latest = entries[0].weight;
  const oldest = entries[entries.length - 1].weight;
  return +(latest - oldest).toFixed(2);
}

function getStreak(entries: WeightEntry[]) {
  if (entries.length < 2) return 0;
  let streak = 0;
  const isLosing = entries[0].weight <= entries[1].weight;
  for (let i = 0; i < entries.length - 1; i++) {
    if (isLosing && entries[i].weight <= entries[i + 1].weight) {
      streak++;
    } else if (!isLosing && entries[i].weight >= entries[i + 1].weight) {
      streak++;
    } else break;
  }
  return streak;
}

export default function WeightStats({ entries, goals }: WeightStatsProps) {
  const latest = entries[0] ?? null;
  const change = getChange(entries);
  const totalChange = getTotalChange(entries);
  const streak = getStreak(entries);
  const activeGoals = goals.filter(
    (g) => g.status === WeightGoalStatus.IN_PROGRESS,
  ).length;

  const stats = [
    {
      label: "Current",
      value: latest ? `${latest.weight}` : "—",
      suffix: latest ? latest.unit.toLowerCase() : "",
      icon: Scale,
      gradient: "from-violet-500 to-indigo-600",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      label: "Last change",
      value: change !== null ? `${change > 0 ? "+" : ""}${change}` : "—",
      suffix: latest ? latest.unit.toLowerCase() : "",
      icon: change !== null && change <= 0 ? TrendingDown : TrendingUp,
      gradient:
        change !== null && change <= 0
          ? "from-emerald-500 to-teal-600"
          : "from-orange-500 to-amber-600",
      bgLight:
        change !== null && change <= 0 ? "bg-emerald-50" : "bg-orange-50",
      textColor:
        change !== null && change <= 0 ? "text-emerald-600" : "text-orange-600",
    },
    {
      label: "Total change",
      value:
        totalChange !== null
          ? `${totalChange > 0 ? "+" : ""}${totalChange}`
          : "—",
      suffix: latest ? latest.unit.toLowerCase() : "",
      icon: Calendar,
      gradient:
        totalChange !== null && totalChange <= 0
          ? "from-cyan-500 to-blue-600"
          : "from-rose-500 to-pink-600",
      bgLight:
        totalChange !== null && totalChange <= 0 ? "bg-cyan-50" : "bg-rose-50",
      textColor:
        totalChange !== null && totalChange <= 0
          ? "text-cyan-600"
          : "text-rose-600",
    },
    {
      label: "Streak",
      value: `${streak}`,
      suffix: streak === 1 ? "day" : "days",
      icon: Flame,
      gradient: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Active goals",
      value: `${activeGoals}`,
      suffix: "",
      icon: Target,
      gradient: "from-pink-500 to-rose-600",
      bgLight: "bg-pink-50",
      textColor: "text-pink-600",
    },
    {
      label: "Total entries",
      value: `${entries.length}`,
      suffix: "",
      icon: Scale,
      gradient: "from-slate-500 to-zinc-700",
      bgLight: "bg-slate-50",
      textColor: "text-slate-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="relative bg-white rounded-2xl border border-black/[0.06] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden group hover:shadow-md hover:border-black/10 transition-all duration-300"
          >
            <div
              className={`absolute top-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.06] -translate-y-4 translate-x-4 group-hover:opacity-[0.1] transition-opacity`}
            />
            <div
              className={`w-8 h-8 rounded-xl ${stat.bgLight} flex items-center justify-center mb-3`}
            >
              <Icon size={15} className={stat.textColor} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-black/35 mb-1">
              {stat.label}
            </p>
            <p className="text-xl font-semibold text-black tracking-tight">
              {stat.value}
              {stat.suffix && (
                <span className="text-xs font-normal text-black/30 ml-1">
                  {stat.suffix}
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

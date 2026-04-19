"use client";

import {
  CheckCircle2,
  Flame,
  TrendingUp,
  BarChart3,
  Calendar,
  Hash,
} from "lucide-react";

interface Props {
  totalHabits: number;
  completedToday: number;
  bestStreak: number;
  avgCompletion7d: number;
  avgCompletion30d: number;
  totalCompletions: number;
}

export default function HabitStatsCards({
  totalHabits,
  completedToday,
  bestStreak,
  avgCompletion7d,
  avgCompletion30d,
  totalCompletions,
}: Props) {
  const stats = [
    {
      label: "Aujourd'hui",
      value: `${completedToday}/${totalHabits}`,
      icon: CheckCircle2,
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Meilleur streak",
      value: `${bestStreak}`,
      suffix: "j",
      icon: Flame,
      bgLight: "bg-orange-50",
      textColor: "text-orange-500",
    },
    {
      label: "Taux 7j",
      value: `${avgCompletion7d}`,
      suffix: "%",
      icon: TrendingUp,
      bgLight: "bg-blue-50",
      textColor: "text-blue-500",
    },
    {
      label: "Taux 30j",
      value: `${avgCompletion30d}`,
      suffix: "%",
      icon: BarChart3,
      bgLight: "bg-violet-50",
      textColor: "text-violet-500",
    },
    {
      label: "Total logs",
      value: `${totalCompletions}`,
      icon: Calendar,
      bgLight: "bg-pink-50",
      textColor: "text-pink-500",
    },
    {
      label: "Habitudes",
      value: `${totalHabits}`,
      icon: Hash,
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
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
                <span className="text-xs font-normal text-black/30 ml-0.5">
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

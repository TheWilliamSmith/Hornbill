"use client";

import { Trophy, Flame } from "lucide-react";
import type { HabitToday, HabitStats } from "@/types/habit.type";

interface Props {
  habits: HabitToday[];
  allStats: Map<string, HabitStats>;
}

export default function BestStreaks({ habits, allStats }: Props) {
  // Sort habits by current streak descending
  const ranked = [...habits]
    .map((h) => {
      const stats = allStats.get(h.id);
      return {
        ...h,
        longestStreak: stats?.longestStreak ?? 0,
        totalCompletions: stats?.totalCompletions ?? 0,
      };
    })
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 5);

  if (ranked.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-black tracking-tight">
            Streaks
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
          Top {ranked.length}
        </span>
      </div>

      <div className="space-y-2">
        {ranked.map((h, i) => {
          const suffix = h.frequency === "DAILY" ? "j" : "s";
          return (
            <div key={h.id} className="flex items-center gap-2.5 py-1">
              <span
                className={`w-5 h-5 flex items-center justify-center rounded-md text-[10px] font-bold ${
                  i === 0
                    ? "bg-amber-100 text-amber-600"
                    : i === 1
                      ? "bg-gray-100 text-gray-500"
                      : i === 2
                        ? "bg-orange-50 text-orange-400"
                        : "bg-black/[0.03] text-black/25"
                }`}
              >
                {i + 1}
              </span>
              <span className="text-sm">{h.icon || "📌"}</span>
              <span className="flex-1 text-xs text-black/60 truncate">
                {h.name}
              </span>
              <div className="flex items-center gap-1">
                <Flame size={11} className="text-orange-400" />
                <span className="text-xs font-semibold text-black/70">
                  {h.currentStreak}
                  {suffix}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

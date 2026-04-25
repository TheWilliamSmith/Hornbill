"use client";

import { Repeat, CalendarCheck } from "lucide-react";
import type { HabitToday } from "@/types/habit.type";

interface Props {
  habits: HabitToday[];
}

export default function FrequencyBreakdown({ habits }: Props) {
  const dailyHabits = habits.filter((h) => h.frequency === "DAILY");
  const weeklyHabits = habits.filter((h) => h.frequency === "WEEKLY");

  const dailyDone = dailyHabits.filter((h) => h.completedToday).length;
  const weeklyDone = weeklyHabits.filter((h) => h.completedToday).length;

  const dailyPct =
    dailyHabits.length > 0
      ? Math.round((dailyDone / dailyHabits.length) * 100)
      : 0;
  const weeklyPct =
    weeklyHabits.length > 0
      ? Math.round((weeklyDone / weeklyHabits.length) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat size={15} className="text-blue-500" />
          <h2 className="text-sm font-semibold text-black tracking-tight">
            Fréquence
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
          Répartition
        </span>
      </div>

      <div className="space-y-3">
        {/* Daily */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <CalendarCheck size={12} className="text-emerald-500" />
              <span className="text-xs font-medium text-black/60">
                Quotidiennes
              </span>
            </div>
            <span className="text-xs text-black/30">
              {dailyDone}/{dailyHabits.length}
            </span>
          </div>
          <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
        </div>

        {/* Weekly */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Repeat size={12} className="text-violet-500" />
              <span className="text-xs font-medium text-black/60">
                Hebdomadaires
              </span>
            </div>
            <span className="text-xs text-black/30">
              {weeklyDone}/{weeklyHabits.length}
            </span>
          </div>
          <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Per-habit mini list */}
      {habits.length > 0 && (
        <div className="mt-4 pt-3 border-t border-black/[0.04] space-y-1.5">
          {habits.map((h) => (
            <div key={h.id} className="flex items-center gap-2">
              <span className="text-xs">{h.icon || "📌"}</span>
              <span className="flex-1 text-[11px] text-black/50 truncate">
                {h.name}
              </span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                  h.frequency === "DAILY"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-violet-50 text-violet-600"
                }`}
              >
                {h.frequency === "DAILY" ? "Jour" : `${h.targetPerWeek}x/sem`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

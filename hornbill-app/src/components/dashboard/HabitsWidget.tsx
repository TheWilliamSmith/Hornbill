"use client";

import { useEffect, useState, useCallback } from "react";
import { Flame, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { habitService } from "@/services/habit.service";
import type { HabitToday } from "@/types/habit.type";

export default function HabitsWidget() {
  const [habits, setHabits] = useState<HabitToday[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    try {
      const data = await habitService.getToday();
      setHabits(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const toggleHabit = async (habit: HabitToday) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (habit.completedToday) {
      await habitService.unlogHabit(habit.id, dateStr);
    } else {
      await habitService.logHabit(habit.id, { date: dateStr });
    }
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id ? { ...h, completedToday: !h.completedToday } : h,
      ),
    );
  };

  const completed = habits.filter((h) => h.completedToday).length;
  const total = habits.length;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-sm text-zinc-900">Habitudes du jour</span>
        </div>
        <Link href="/dashboard/habits" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
          Voir tout →
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-zinc-100 rounded animate-pulse" />
          ))}
        </div>
      ) : total === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-4">Aucune habitude pour aujourd&apos;hui</p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            {habits.slice(0, 5).map((habit) => (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit)}
                className="flex items-center gap-2.5 text-left w-full group"
              >
                {habit.completedToday ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 shrink-0 transition-colors" />
                )}
                <span className={`text-sm truncate ${habit.completedToday ? "line-through text-zinc-400" : "text-zinc-700"}`}>
                  {habit.icon && <span className="mr-1">{habit.icon}</span>}
                  {habit.name}
                </span>
                {habit.currentStreak > 1 && (
                  <span className="ml-auto text-xs text-orange-500 shrink-0">{habit.currentStreak}🔥</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>{completed}/{total} complétées</span>
              <span>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-1.5">
              <div
                className="bg-orange-400 h-1.5 rounded-full transition-all"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

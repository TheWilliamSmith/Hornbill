"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { habitService } from "@/services/habit.service";

interface Props {
  habitId: string;
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function HabitCalendar({ habitId }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  const fetch = useCallback(async () => {
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    try {
      const logs = await habitService.getLogs(habitId, from, to);
      const days = new Set(logs.map((l) => new Date(l.date).getUTCDate()));
      setCompletedDays(days);
    } catch {
      setCompletedDays(new Set());
    }
  }, [habitId, year, month]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const navigate = (dir: -1 | 1) => {
    let m = month + dir;
    let y = year;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setMonth(m);
    setYear(y);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const offset = startWeekday === 0 ? 6 : startWeekday - 1; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayDay =
    today.getFullYear() === year && today.getMonth() === month
      ? today.getDate()
      : -1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Date(year, month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-6 h-6 flex items-center justify-center rounded text-black/30 hover:text-black/60 cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-medium text-black/50 capitalize">
          {monthLabel}
        </span>
        <button
          onClick={() => navigate(1)}
          className="w-6 h-6 flex items-center justify-center rounded text-black/30 hover:text-black/60 cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] text-black/25 font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => (
          <div
            key={i}
            className={`w-full aspect-square flex items-center justify-center rounded-md text-[11px] relative ${
              day === null
                ? ""
                : day === todayDay
                  ? "font-semibold text-black"
                  : "text-black/50"
            }`}
          >
            {day !== null && (
              <>
                {day}
                {completedDays.has(day) && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { HeatmapDay } from "@/types/habit.type";

interface Props {
  heatmap: HeatmapDay[];
}

export default function HabitHeatmap({ heatmap }: Props) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    completed: boolean;
    x: number;
    y: number;
  } | null>(null);

  if (heatmap.length === 0) return null;

  // Build grid: 7 rows (Mon-Sun) × ~52 columns (weeks)
  // Start from the earliest date and fill by week columns
  const firstDate = new Date(heatmap[0].date + "T00:00:00Z");
  const dayMap = new Map(heatmap.map((d) => [d.date, d.completed]));

  // Align to Monday
  const startDay = firstDate.getUTCDay();
  const mondayOffset = startDay === 0 ? 6 : startDay - 1;
  const gridStart = new Date(firstDate);
  gridStart.setUTCDate(gridStart.getUTCDate() - mondayOffset);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build weeks
  const weeks: {
    date: string;
    completed: boolean;
    isToday: boolean;
    row: number;
  }[][] = [];
  const cursor = new Date(gridStart);

  while (cursor <= today || weeks.length < 52) {
    const week: {
      date: string;
      completed: boolean;
      isToday: boolean;
      row: number;
    }[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(cursor.getUTCDate()).padStart(2, "0")}`;
      week.push({
        date: dateStr,
        completed: dayMap.get(dateStr) ?? false,
        isToday: dateStr === todayStr,
        row: d,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
    if (weeks.length >= 53) break;
  }

  const cellSize = 10;
  const gap = 2;
  const width = weeks.length * (cellSize + gap);
  const height = 7 * (cellSize + gap);

  return (
    <div className="relative overflow-x-auto">
      <svg width={width} height={height + 4}>
        {weeks.map((week, wi) =>
          week.map((day) => (
            <rect
              key={day.date}
              x={wi * (cellSize + gap)}
              y={day.row * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={2}
              className={`transition-colors ${
                day.completed ? "fill-emerald-400" : "fill-black/[0.04]"
              } ${day.isToday ? "stroke-black/20 stroke-1" : ""}`}
              onMouseEnter={(e) => {
                const rect = (
                  e.target as SVGRectElement
                ).getBoundingClientRect();
                setTooltip({
                  date: day.date,
                  completed: day.completed,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          )),
        )}
      </svg>

      {/* Day labels */}
      <div className="flex justify-between mt-1 text-[8px] text-black/20 px-0.5">
        <span>Lun</span>
        <span>Mer</span>
        <span>Ven</span>
        <span>Dim</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] pointer-events-none bg-black text-white text-[10px] px-2 py-1 rounded-md -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y - 6,
          }}
        >
          {new Date(tooltip.date + "T00:00:00Z").toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          — {tooltip.completed ? "✓" : "—"}
        </div>
      )}
    </div>
  );
}

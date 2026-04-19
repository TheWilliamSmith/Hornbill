"use client";

import { useState, useMemo } from "react";

interface HeatmapEntry {
  date: string;
  count: number;
  total: number;
}

interface Props {
  data: HeatmapEntry[];
  totalHabits: number;
}

export default function GlobalHeatmap({ data, totalHabits }: Props) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    count: number;
    total: number;
    x: number;
    y: number;
  } | null>(null);

  const { weeks, monthLabels } = useMemo(() => {
    if (data.length === 0) {
      // Generate empty 52-week grid from today going back
      const today = new Date();
      const start = new Date(today);
      start.setDate(start.getDate() - 364);
      // Align to Monday
      const dayOfWeek = start.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(start.getDate() - mondayOffset);

      const emptyWeeks: {
        date: string;
        count: number;
        total: number;
        row: number;
      }[][] = [];
      const cursor = new Date(start);
      while (emptyWeeks.length < 53) {
        const week: {
          date: string;
          count: number;
          total: number;
          row: number;
        }[] = [];
        for (let d = 0; d < 7; d++) {
          week.push({
            date: formatDate(cursor),
            count: 0,
            total: 0,
            row: d,
          });
          cursor.setDate(cursor.getDate() + 1);
        }
        emptyWeeks.push(week);
      }
      return { weeks: emptyWeeks, monthLabels: buildMonthLabels(emptyWeeks) };
    }

    const dayMap = new Map(data.map((d) => [d.date, d]));

    // Start from earliest date, align to Monday
    const firstDate = new Date(data[0].date + "T00:00:00Z");
    const startDay = firstDate.getUTCDay();
    const mondayOffset = startDay === 0 ? 6 : startDay - 1;
    const gridStart = new Date(firstDate);
    gridStart.setUTCDate(gridStart.getUTCDate() - mondayOffset);

    const today = new Date();
    const builtWeeks: {
      date: string;
      count: number;
      total: number;
      row: number;
    }[][] = [];
    const cursor = new Date(gridStart);

    while (builtWeeks.length < 53) {
      const week: {
        date: string;
        count: number;
        total: number;
        row: number;
      }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = formatDateUTC(cursor);
        const entry = dayMap.get(dateStr);
        week.push({
          date: dateStr,
          count: entry?.count ?? 0,
          total: entry?.total ?? totalHabits,
          row: d,
        });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      builtWeeks.push(week);
      if (cursor > today && builtWeeks.length >= 52) break;
    }

    return {
      weeks: builtWeeks,
      monthLabels: buildMonthLabels(builtWeeks),
    };
  }, [data, totalHabits]);

  const cellSize = 11;
  const gap = 2;
  const labelHeight = 16;
  const width = weeks.length * (cellSize + gap);
  const height = 7 * (cellSize + gap) + labelHeight;

  const todayStr = formatDate(new Date());

  return (
    <div className="relative overflow-x-auto">
      <svg width={width} height={height}>
        {/* Month labels */}
        {monthLabels.map((ml) => (
          <text
            key={ml.label + ml.x}
            x={ml.x}
            y={10}
            className="fill-black/25 text-[9px]"
          >
            {ml.label}
          </text>
        ))}

        {/* Cells */}
        {weeks.map((week, wi) =>
          week.map((day) => {
            const intensity = day.total > 0 ? day.count / day.total : 0;
            return (
              <rect
                key={day.date}
                x={wi * (cellSize + gap)}
                y={day.row * (cellSize + gap) + labelHeight}
                width={cellSize}
                height={cellSize}
                rx={2.5}
                className={`transition-colors ${getIntensityClass(intensity)} ${
                  day.date === todayStr ? "stroke-black/20 stroke-[0.5]" : ""
                }`}
                onMouseEnter={(e) => {
                  const rect = (
                    e.target as SVGRectElement
                  ).getBoundingClientRect();
                  setTooltip({
                    date: day.date,
                    count: day.count,
                    total: day.total,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          }),
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 text-[9px] text-black/20">
          <span>Lun</span>
          <span className="ml-3">Mer</span>
          <span className="ml-3">Ven</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-black/25">Moins</span>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-black/[0.04]" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-orange-200" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-orange-300" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-orange-400" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-orange-500" />
          <span className="text-[9px] text-black/25">Plus</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] pointer-events-none bg-black text-white text-[10px] px-2.5 py-1.5 rounded-lg -translate-x-1/2 -translate-y-full shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y - 6,
          }}
        >
          <div className="font-medium">
            {new Date(tooltip.date + "T00:00:00Z").toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-white/60">
            {tooltip.count}/{tooltip.total} habitude
            {tooltip.total > 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

function getIntensityClass(intensity: number): string {
  if (intensity === 0) return "fill-black/[0.04]";
  if (intensity <= 0.25) return "fill-orange-200";
  if (intensity <= 0.5) return "fill-orange-300";
  if (intensity <= 0.75) return "fill-orange-400";
  return "fill-orange-500";
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function buildMonthLabels(
  weeks: { date: string; row: number }[][],
): { label: string; x: number }[] {
  const labels: { label: string; x: number }[] = [];
  const cellSize = 11;
  const gap = 2;
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Jun",
    "Jul",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  let lastMonth = -1;

  weeks.forEach((week, wi) => {
    const firstDay = week[0];
    if (!firstDay) return;
    const month = parseInt(firstDay.date.split("-")[1], 10) - 1;
    if (month !== lastMonth) {
      labels.push({
        label: months[month],
        x: wi * (cellSize + gap),
      });
      lastMonth = month;
    }
  });

  return labels;
}

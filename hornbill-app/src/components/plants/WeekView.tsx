"use client";

import { Droplets, Sparkles, RefreshCw, Wind, Leaf, RotateCcw, Syringe, Scissors, MoreHorizontal } from "lucide-react";
import type { WeekCareItem, PlantCareType } from "@/types/plant.type";

const CARE_META: Record<PlantCareType, { label: string; icon: React.ElementType; dot: string }> = {
  WATERING: { label: "Arrosage", icon: Droplets, dot: "bg-sky-400" },
  FERTILIZING: { label: "Engrais", icon: Sparkles, dot: "bg-amber-400" },
  REPOTTING: { label: "Rempotage", icon: RefreshCw, dot: "bg-emerald-400" },
  MISTING: { label: "Brumisation", icon: Wind, dot: "bg-[#468BE6]" },
  LEAF_CLEANING: { label: "Nettoyage", icon: Leaf, dot: "bg-green-400" },
  ROTATION: { label: "Rotation", icon: RotateCcw, dot: "bg-violet-400" },
  TREATMENT: { label: "Traitement", icon: Syringe, dot: "bg-red-400" },
  PRUNING: { label: "Taille", icon: Scissors, dot: "bg-orange-400" },
  OTHER: { label: "Autre", icon: MoreHorizontal, dot: "bg-black/20" },
};

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface Props {
  week: WeekCareItem;
}

function generateWeekDates(from: string): string[] {
  const dates: string[] = [];
  const start = new Date(from);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export default function WeekView({ week }: Props) {
  const dates = generateWeekDates(week.from);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, i) => {
          const dayReminders = week.grouped[date] ?? [];
          const isToday = date === today;
          const isPast = date < today;

          return (
            <div
              key={date}
              className={`min-h-[140px] rounded-2xl border p-3 flex flex-col transition-all ${
                isToday
                  ? "border-[#468BE6]/40 bg-[#E9F5FF]/50"
                  : "border-black/[0.06] bg-white"
              } ${isPast ? "opacity-50" : ""}`}
            >
              {/* Day header */}
              <div className="mb-2">
                <p className={`text-[10px] font-medium uppercase tracking-wide ${isToday ? "text-[#468BE6]" : "text-black/30"}`}>
                  {DAY_LABELS[i]}
                </p>
                <p className={`text-lg font-semibold leading-none mt-0.5 ${isToday ? "text-[#468BE6]" : "text-black/70"}`}>
                  {new Date(date).getDate()}
                </p>
              </div>

              {/* Events */}
              <div className="flex-1 space-y-1">
                {dayReminders.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-black/10" />
                  </div>
                ) : (
                  dayReminders.map((r) => {
                    const meta = CARE_META[r.careType as PlantCareType] ?? CARE_META.OTHER;
                    return (
                      <div
                        key={r.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-black/[0.06]"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${meta.dot} flex-shrink-0`} />
                        <span className="text-[10px] text-black/60 truncate">
                          {r.plant?.customName ?? meta.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {(Object.entries(CARE_META) as [PlantCareType, typeof CARE_META[PlantCareType]][]).map(
          ([type, meta]) => {
            const hasAny = dates.some((d) =>
              (week.grouped[d] ?? []).some((r) => r.careType === type),
            );
            if (!hasAny) return null;
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                <span className="text-[11px] text-black/40">{meta.label}</span>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

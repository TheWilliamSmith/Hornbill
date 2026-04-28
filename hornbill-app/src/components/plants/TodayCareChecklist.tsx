"use client";

import { useState } from "react";
import {
  Droplets,
  Sparkles,
  RefreshCw,
  Wind,
  Leaf,
  RotateCcw,
  Syringe,
  Scissors,
  MoreHorizontal,
  Check,
} from "lucide-react";
import type { PlantCareReminder, PlantCareType } from "@/types/plant.type";
import { plantService } from "@/services/plant.service";

const CARE_META: Record<
  PlantCareType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  WATERING: {
    label: "Arrosage",
    icon: Droplets,
    color: "text-sky-500",
    bg: "bg-sky-50",
  },
  FERTILIZING: {
    label: "Engrais",
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  REPOTTING: {
    label: "Rempotage",
    icon: RefreshCw,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  MISTING: {
    label: "Brumisation",
    icon: Wind,
    color: "text-[#468BE6]",
    bg: "bg-[#E9F5FF]",
  },
  LEAF_CLEANING: {
    label: "Nettoyage",
    icon: Leaf,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  ROTATION: {
    label: "Rotation",
    icon: RotateCcw,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  TREATMENT: {
    label: "Traitement",
    icon: Syringe,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  PRUNING: {
    label: "Taille",
    icon: Scissors,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  OTHER: {
    label: "Autre",
    icon: MoreHorizontal,
    color: "text-black/40",
    bg: "bg-black/[0.04]",
  },
};

interface Props {
  grouped: Record<string, PlantCareReminder[]>;
  onRefresh: () => void;
}

export default function TodayCareChecklist({ grouped, onRefresh }: Props) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const allReminders = Object.values(grouped).flat();
  const total = allReminders.length;
  const completedCount = done.size;

  const handleCheck = async (reminder: PlantCareReminder) => {
    if (done.has(reminder.id) || loading.has(reminder.id)) return;
    setLoading((prev) => new Set([...prev, reminder.id]));
    try {
      await plantService.createCareLog(reminder.plantId, {
        careType: reminder.careType,
        performedAt: new Date().toISOString(),
      });
      setDone((prev) => new Set([...prev, reminder.id]));
      onRefresh();
    } catch {
      // ignore
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(reminder.id);
        return next;
      });
    }
  };

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#E9F5FF] flex items-center justify-center mb-3">
          <Check size={20} className="text-[#468BE6]" />
        </div>
        <p className="text-sm font-medium text-black/60">Rien à faire aujourd'hui</p>
        <p className="text-xs text-black/30 mt-1">Toutes les plantes sont à jour</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-black/35">
            Progression
          </span>
          <span className="text-[10px] font-medium text-black/40">
            {completedCount}/{total}
          </span>
        </div>
        <div className="h-1.5 bg-black/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#468BE6] rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (completedCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Groups */}
      {(Object.entries(grouped) as [PlantCareType, PlantCareReminder[]][]).map(
        ([careType, reminders]) => {
          const meta = CARE_META[careType] ?? CARE_META.OTHER;
          const Icon = meta.icon;
          return (
            <div key={careType}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-lg ${meta.bg} flex items-center justify-center`}>
                  <Icon size={12} className={meta.color} />
                </div>
                <span className="text-xs font-semibold text-black/50 uppercase tracking-wide">
                  {meta.label}
                </span>
                <span className="text-[10px] text-black/25 ml-auto">
                  {reminders.filter((r) => done.has(r.id)).length}/{reminders.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {reminders.map((reminder) => {
                  const isDone = done.has(reminder.id);
                  const isLoading = loading.has(reminder.id);
                  return (
                    <button
                      key={reminder.id}
                      onClick={() => handleCheck(reminder)}
                      disabled={isDone || isLoading}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
                        isDone
                          ? "bg-black/[0.02] border-black/[0.04] opacity-50"
                          : "bg-white border-black/[0.06] hover:border-[#93BFEF] hover:bg-[#E9F5FF]/40 active:scale-[0.99]"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isDone
                            ? "border-[#468BE6] bg-[#468BE6]"
                            : "border-black/20 hover:border-[#468BE6]"
                        }`}
                      >
                        {isDone && <Check size={10} className="text-white" />}
                        {isLoading && (
                          <div className="w-2 h-2 rounded-full border border-[#468BE6] border-t-transparent animate-spin" />
                        )}
                      </div>
                      <span
                        className={`text-sm transition-all ${
                          isDone ? "line-through text-black/30" : "text-black/70"
                        }`}
                      >
                        {reminder.plant?.customName ?? "Plante"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}

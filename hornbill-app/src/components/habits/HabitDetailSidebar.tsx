"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Flame,
  Trophy,
  TrendingUp,
  Calendar,
  Pencil,
  Archive,
  Loader2,
} from "lucide-react";
import { habitService } from "@/services/habit.service";
import type { Habit, HabitStats, HabitLog } from "@/types/habit.type";
import HabitHeatmap from "./HabitHeatmap";
import HabitCalendar from "./HabitCalendar";

interface Props {
  habitId: string;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
  onArchive: () => Promise<void>;
  onRefresh?: () => void;
}

export default function HabitDetailSidebar({
  habitId,
  onClose,
  onEdit,
  onArchive,
  onRefresh,
}: Props) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [h, s] = await Promise.all([
        habitService.getHabit(habitId),
        habitService.getStats(habitId),
      ]);
      setHabit(h);
      setStats(s);

      // Get recent logs (last 60 days to get ~20 entries)
      const today = new Date();
      const from = new Date(today);
      from.setDate(from.getDate() - 180);
      const logs = await habitService.getLogs(
        habitId,
        toDateStr(from),
        toDateStr(today),
      );
      setRecentLogs(logs.reverse().slice(0, 20));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const [editingLogNote, setEditingLogNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const handleSaveNote = async (log: HabitLog) => {
    const dateStr = log.date.split("T")[0];
    await habitService.updateLogNote(habitId, dateStr, noteValue || null);
    setEditingLogNote(null);
    fetch();
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        {loading || !habit || !stats ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-black/20" />
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.icon || "📌"}</span>
                <div>
                  <h2 className="text-lg font-semibold text-black">
                    {habit.name}
                  </h2>
                  {habit.description && (
                    <p className="text-sm text-black/40">{habit.description}</p>
                  )}
                  <p className="text-xs text-black/25 mt-0.5">
                    {habit.frequency === "DAILY"
                      ? "Quotidienne"
                      : `Hebdomadaire — ${habit.targetPerWeek}x/sem.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(habit)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-black/30 hover:text-black/60 hover:bg-black/[0.04] transition-all cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Archiver "${habit.name}" ?`)) onArchive();
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-black/30 hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <Archive size={14} />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-black/30 hover:text-black/60 hover:bg-black/[0.04] transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <StatCard
                icon={<Flame size={14} className="text-orange-400" />}
                label="Streak actuel"
                value={
                  habit.frequency === "DAILY"
                    ? `${stats.currentStreak}j`
                    : `${stats.currentStreak}s`
                }
              />
              <StatCard
                icon={<Trophy size={14} className="text-yellow-500" />}
                label="Plus long"
                value={
                  habit.frequency === "DAILY"
                    ? `${stats.longestStreak}j`
                    : `${stats.longestStreak}s`
                }
              />
              <StatCard
                icon={<TrendingUp size={14} className="text-emerald-500" />}
                label="Total"
                value={String(stats.totalCompletions)}
              />
            </div>

            {/* Completion rates */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <RateCard label="7 jours" value={stats.completionRate7d} />
              <RateCard label="30 jours" value={stats.completionRate30d} />
              <RateCard label="90 jours" value={stats.completionRate90d} />
            </div>

            {/* Heatmap */}
            <div className="mb-6">
              <h3 className="text-xs font-medium text-black/40 mb-3 flex items-center gap-1.5">
                <Calendar size={12} />
                Activité (12 mois)
              </h3>
              <HabitHeatmap heatmap={stats.heatmap} />
            </div>

            {/* Month calendar */}
            <div className="mb-6">
              <HabitCalendar habitId={habitId} />
            </div>

            {/* Recent logs */}
            {recentLogs.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-black/40 mb-3">
                  Logs récents
                </h3>
                <div className="space-y-1">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-black/[0.02] group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-black/40 w-20 flex-shrink-0">
                        {new Date(log.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {editingLogNote === log.id ? (
                        <input
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          onBlur={() => handleSaveNote(log)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveNote(log);
                            if (e.key === "Escape") setEditingLogNote(null);
                          }}
                          autoFocus
                          placeholder="Ajouter une note..."
                          className="flex-1 text-xs text-black/60 bg-transparent outline-none border-b border-black/10"
                        />
                      ) : (
                        <span
                          onClick={() => {
                            setEditingLogNote(log.id);
                            setNoteValue(log.note || "");
                          }}
                          className="flex-1 text-xs text-black/40 cursor-pointer hover:text-black/60 truncate"
                        >
                          {log.note || (
                            <span className="opacity-0 group-hover:opacity-50">
                              Ajouter une note...
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-black/[0.025] rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-black/35">{label}</span>
      </div>
      <span className="text-lg font-semibold text-black/70">{value}</span>
    </div>
  );
}

function RateCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-black/[0.025] rounded-xl p-3 text-center">
      <span className="text-lg font-semibold text-black/70">{value}%</span>
      <p className="text-[10px] text-black/30">{label}</p>
    </div>
  );
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

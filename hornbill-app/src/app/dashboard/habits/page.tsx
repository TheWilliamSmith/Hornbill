"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { habitService } from "@/services/habit.service";
import type { HabitToday, Habit, HabitStats } from "@/types/habit.type";
import HabitStatsCards from "@/components/habits/HabitStatsCards";
import GlobalHeatmap from "@/components/habits/GlobalHeatmap";
import TodayChecklist from "@/components/habits/TodayChecklist";
import HabitDetailSidebar from "@/components/habits/HabitDetailSidebar";
import CreateHabitModal from "@/components/habits/CreateHabitModal";
import EditHabitModal from "@/components/habits/EditHabitModal";
import FrequencyBreakdown from "@/components/habits/FrequencyBreakdown";
import BestStreaks from "@/components/habits/BestStreaks";

function formatDateLabel(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return target.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitToday[]>([]);
  const [allStats, setAllStats] = useState<Map<string, HabitStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);

  const isToday = toDateStr(selectedDate) === toDateStr(new Date());

  const fetchHabits = useCallback(async () => {
    try {
      if (isToday) {
        const data = await habitService.getToday();
        setHabits(data);
      } else {
        const dateStr = toDateStr(selectedDate);
        const all = await habitService.getToday();
        const results = await Promise.all(
          all.map(async (h) => {
            try {
              const logs = await habitService.getLogs(h.id, dateStr, dateStr);
              return { ...h, completedToday: logs.length > 0 };
            } catch {
              return { ...h, completedToday: false };
            }
          }),
        );
        setHabits(results);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [selectedDate, isToday]);

  const fetchAllStats = useCallback(async () => {
    if (habits.length === 0) return;
    try {
      const results = await Promise.all(
        habits.map(async (h) => {
          const stats = await habitService.getStats(h.id);
          return { id: h.id, stats };
        }),
      );
      const map = new Map<string, HabitStats>();
      results.forEach(({ id, stats }) => map.set(id, stats));
      setAllStats(map);
    } catch {
      // ignore
    }
  }, [habits]);

  useEffect(() => {
    setLoading(true);
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const handleToggle = async (habitId: string, completed: boolean) => {
    const dateStr = toDateStr(selectedDate);
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, completedToday: !completed } : h,
      ),
    );
    try {
      if (completed) {
        await habitService.unlogHabit(habitId, dateStr);
      } else {
        await habitService.logHabit(habitId, { date: dateStr });
      }
      fetchHabits();
    } catch {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, completedToday: completed } : h,
        ),
      );
    }
  };

  const handleArchive = async (habitId: string) => {
    await habitService.archiveHabit(habitId);
    fetchHabits();
  };

  const navigateDay = (offset: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + offset);
    if (next > new Date()) return;
    setSelectedDate(next);
  };

  const canGoForward = toDateStr(selectedDate) !== toDateStr(new Date());

  // Aggregate stats
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.completedToday).length;
  const bestCurrentStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak), 0) : 0;
  const avgCompletion7d =
    allStats.size > 0
      ? Math.round(
          [...allStats.values()].reduce(
            (sum, s) => sum + s.completionRate7d,
            0,
          ) / allStats.size,
        )
      : 0;
  const avgCompletion30d =
    allStats.size > 0
      ? Math.round(
          [...allStats.values()].reduce(
            (sum, s) => sum + s.completionRate30d,
            0,
          ) / allStats.size,
        )
      : 0;
  const totalCompletions =
    allStats.size > 0
      ? [...allStats.values()].reduce((sum, s) => sum + s.totalCompletions, 0)
      : 0;

  // Build merged global heatmap
  const globalHeatmap = buildGlobalHeatmap(allStats, totalHabits);

  if (loading && habits.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-black/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame size={17} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Habitudes
            </h1>
          </div>
          <p className="text-sm text-black/40 ml-[46px]">
            Suivez vos habitudes, construisez votre discipline
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.97] transition-all duration-200 cursor-pointer"
        >
          <Plus size={16} />
          Nouvelle habitude
        </button>
      </div>

      {/* Stats row */}
      <HabitStatsCards
        totalHabits={totalHabits}
        completedToday={completedToday}
        bestStreak={bestCurrentStreak}
        avgCompletion7d={avgCompletion7d}
        avgCompletion30d={avgCompletion30d}
        totalCompletions={totalCompletions}
      />

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Today checklist + Frequency */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today checklist */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDay(-1)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-black/25 hover:text-black/50 hover:bg-black/[0.04] transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <h2 className="text-sm font-semibold text-black tracking-tight capitalize">
                  {formatDateLabel(selectedDate)}
                </h2>
                <button
                  onClick={() => navigateDay(1)}
                  disabled={!canGoForward}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-black/25 hover:text-black/50 hover:bg-black/[0.04] transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
                {completedToday}/{totalHabits} faites
              </span>
            </div>

            <TodayChecklist
              habits={habits}
              onToggle={handleToggle}
              onViewDetail={(id) => setDetailHabitId(id)}
              onEdit={(habit) => setEditingHabit(habit)}
              onArchive={handleArchive}
              onAdd={() => setShowCreateModal(true)}
            />
          </div>

          {/* Heatmap */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-orange-400" />
                <h2 className="text-sm font-semibold text-black tracking-tight">
                  Activité globale
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
                12 derniers mois
              </span>
            </div>
            <GlobalHeatmap data={globalHeatmap} totalHabits={totalHabits} />
          </div>
        </div>

        {/* Right column: Frequency + Streaks */}
        <div className="space-y-4">
          <FrequencyBreakdown habits={habits} />
          <BestStreaks habits={habits} allStats={allStats} />
        </div>
      </div>

      {/* Detail sidebar */}
      {detailHabitId && (
        <HabitDetailSidebar
          habitId={detailHabitId}
          onClose={() => setDetailHabitId(null)}
          onEdit={(habit) => {
            setEditingHabit(habit);
            setDetailHabitId(null);
          }}
          onArchive={async () => {
            await handleArchive(detailHabitId);
            setDetailHabitId(null);
          }}
          onRefresh={fetchHabits}
        />
      )}

      {/* Create modal */}
      <CreateHabitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (data) => {
          await habitService.createHabit(data);
          setShowCreateModal(false);
          fetchHabits();
        }}
      />

      {/* Edit modal */}
      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSave={async (data) => {
            await habitService.updateHabit(editingHabit.id, data);
            setEditingHabit(null);
            fetchHabits();
          }}
        />
      )}
    </div>
  );
}

/** Merge all habit heatmaps into a global intensity heatmap */
function buildGlobalHeatmap(
  allStats: Map<string, HabitStats>,
  totalHabits: number,
): { date: string; count: number; total: number }[] {
  if (allStats.size === 0 || totalHabits === 0) return [];

  const dayMap = new Map<string, number>();

  for (const stats of allStats.values()) {
    for (const day of stats.heatmap) {
      if (day.completed) {
        dayMap.set(day.date, (dayMap.get(day.date) ?? 0) + 1);
      } else if (!dayMap.has(day.date)) {
        dayMap.set(day.date, 0);
      }
    }
  }

  return [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count, total: totalHabits }));
}

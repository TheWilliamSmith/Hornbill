import { apiClient } from "@/lib/api-client";
import type {
  Habit,
  HabitToday,
  HabitWithStatus,
  HabitLog,
  HabitStats,
  HeatmapDay,
  CreateHabitRequest,
  UpdateHabitRequest,
  CreateLogRequest,
} from "@/types/habit.type";

export const habitService = {
  // ─── Habits ─────────────────────────────────────────────

  getHabits: () => apiClient.get<HabitWithStatus[]>("habits"),

  getToday: () => apiClient.get<HabitToday[]>("habits/today"),

  getHabit: (id: string) =>
    apiClient.get<Habit>(`habits/${encodeURIComponent(id)}`),

  getArchived: () => apiClient.get<Habit[]>("habits/archived"),

  createHabit: (data: CreateHabitRequest) =>
    apiClient.post<Habit>("habits", data),

  updateHabit: (id: string, data: UpdateHabitRequest) =>
    apiClient.patch<Habit>(`habits/${encodeURIComponent(id)}`, data),

  archiveHabit: (id: string) =>
    apiClient.delete(`habits/${encodeURIComponent(id)}`),

  restoreHabit: (id: string) =>
    apiClient.patch<Habit>(`habits/${encodeURIComponent(id)}/restore`),

  // ─── Logs ───────────────────────────────────────────────

  logHabit: (habitId: string, data?: CreateLogRequest) =>
    apiClient.post<HabitLog>(
      `habits/${encodeURIComponent(habitId)}/log`,
      data ?? {},
    ),

  unlogHabit: (habitId: string, date: string) =>
    apiClient.delete(
      `habits/${encodeURIComponent(habitId)}/log/${encodeURIComponent(date)}`,
    ),

  getLogs: (habitId: string, from: string, to: string) =>
    apiClient.get<HabitLog[]>(
      `habits/${encodeURIComponent(habitId)}/logs?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),

  updateLogNote: (habitId: string, date: string, note: string | null) =>
    apiClient.patch<HabitLog>(
      `habits/${encodeURIComponent(habitId)}/log/${encodeURIComponent(date)}/note`,
      { note },
    ),

  // ─── Stats ──────────────────────────────────────────────

  getStats: (habitId: string) =>
    apiClient.get<HabitStats>(`habits/${encodeURIComponent(habitId)}/stats`),

  getHeatmap: (habitId: string, year?: number) =>
    apiClient.get<HeatmapDay[]>(
      `habits/${encodeURIComponent(habitId)}/heatmap${year ? `?year=${year}` : ""}`,
    ),
};

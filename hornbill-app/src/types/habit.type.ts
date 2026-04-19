export type HabitFrequency = "DAILY" | "WEEKLY";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  frequency: HabitFrequency;
  targetPerWeek?: number;
  isArchived: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitWithStatus extends Habit {
  completedToday: boolean;
}

export interface HabitToday extends Habit {
  completedToday: boolean;
  weekCompletions: number;
  currentStreak: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate7d: number;
  completionRate30d: number;
  completionRate90d: number;
  totalCompletions: number;
  heatmap: HeatmapDay[];
}

export interface HeatmapDay {
  date: string;
  completed: boolean;
}

// ─── Request types ────────────────────────────────────────

export interface CreateHabitRequest {
  name: string;
  description?: string;
  icon?: string;
  frequency?: HabitFrequency;
  targetPerWeek?: number;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  icon?: string;
  frequency?: HabitFrequency;
  targetPerWeek?: number;
  position?: number;
}

export interface CreateLogRequest {
  date?: string;
  note?: string;
}

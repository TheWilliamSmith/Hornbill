export class HabitStatsDto {
  currentStreak: number;
  longestStreak: number;
  completionRate7d: number;
  completionRate30d: number;
  completionRate90d: number;
  totalCompletions: number;
  heatmap: { date: string; completed: boolean }[];
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { HabitsRepository } from '../repositories/habits.repository';
import { HabitLogsRepository } from '../repositories/habit-logs.repository';
import { HabitStatsDto } from '../dto/habit-stats.dto';

@Injectable()
export class HabitStatsService {
  constructor(
    private readonly habitsRepo: HabitsRepository,
    private readonly logsRepo: HabitLogsRepository,
  ) {}

  async getStats(habitId: string, userId: string): Promise<HabitStatsDto> {
    const habit = await this.habitsRepo.findByIdAndUserId(habitId, userId);
    if (!habit) throw new NotFoundException('Habit not found');

    const today = this.toDateOnly(new Date());
    const oneYearAgo = new Date(today);
    oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);
    oneYearAgo.setUTCDate(oneYearAgo.getUTCDate() + 1);

    const allDates = await this.logsRepo.findAllDatesByHabit(
      habitId,
      new Date('2020-01-01'),
      today,
    );

    const yearDates = await this.logsRepo.findAllDatesByHabit(habitId, oneYearAgo, today);
    const totalCompletions = await this.logsRepo.countByHabit(habitId);

    const dateSet = new Set(allDates.map((d) => d.toISOString().split('T')[0]));

    const currentStreak = this.calcCurrentStreak(
      habit.frequency,
      habit.targetPerWeek,
      dateSet,
      today,
    );
    const longestStreak = this.calcLongestStreak(
      habit.frequency,
      habit.targetPerWeek,
      allDates,
      dateSet,
    );

    const completionRate7d = this.calcCompletionRate(habit, dateSet, today, 7);
    const completionRate30d = this.calcCompletionRate(habit, dateSet, today, 30);
    const completionRate90d = this.calcCompletionRate(habit, dateSet, today, 90);

    // Heatmap — 365 days
    const yearDateSet = new Set(yearDates.map((d) => d.toISOString().split('T')[0]));
    const heatmap: { date: string; completed: boolean }[] = [];
    const cursor = new Date(oneYearAgo);
    while (cursor <= today) {
      const key = cursor.toISOString().split('T')[0];
      heatmap.push({ date: key, completed: yearDateSet.has(key) });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return {
      currentStreak,
      longestStreak,
      completionRate7d,
      completionRate30d,
      completionRate90d,
      totalCompletions,
      heatmap,
    };
  }

  async getHeatmap(habitId: string, year: number, userId: string) {
    const habit = await this.habitsRepo.findByIdAndUserId(habitId, userId);
    if (!habit) throw new NotFoundException('Habit not found');

    const from = new Date(Date.UTC(year, 0, 1));
    const to = new Date(Date.UTC(year, 11, 31));
    const dates = await this.logsRepo.findAllDatesByHabit(habitId, from, to);
    const dateSet = new Set(dates.map((d) => d.toISOString().split('T')[0]));

    const heatmap: { date: string; completed: boolean }[] = [];
    const cursor = new Date(from);
    const end = new Date(to);
    while (cursor <= end) {
      const key = cursor.toISOString().split('T')[0];
      heatmap.push({ date: key, completed: dateSet.has(key) });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return heatmap;
  }

  private calcCurrentStreak(
    frequency: string,
    targetPerWeek: number | null,
    dateSet: Set<string>,
    today: Date,
  ): number {
    if (dateSet.size === 0) return 0;

    if (frequency === 'DAILY') {
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let startDate: Date;
      if (dateSet.has(todayStr)) {
        startDate = today;
      } else if (dateSet.has(yesterdayStr)) {
        startDate = yesterday;
      } else {
        return 0;
      }

      let streak = 0;
      const cursor = new Date(startDate);
      while (dateSet.has(cursor.toISOString().split('T')[0])) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
      return streak;
    }

    // WEEKLY
    const target = targetPerWeek ?? 1;
    const currentWeekMonday = this.getMonday(today);
    let streak = 0;

    // Current week — count if already meets target
    const currentCount = this.countLogsInWeek(dateSet, currentWeekMonday);
    if (currentCount >= target) streak++;

    // Go backwards
    const weekMonday = new Date(currentWeekMonday);
    weekMonday.setUTCDate(weekMonday.getUTCDate() - 7);
    while (true) {
      const count = this.countLogsInWeek(dateSet, weekMonday);
      if (count >= target) {
        streak++;
        weekMonday.setUTCDate(weekMonday.getUTCDate() - 7);
      } else {
        break;
      }
    }

    return streak;
  }

  private calcLongestStreak(
    frequency: string,
    targetPerWeek: number | null,
    allDates: Date[],
    dateSet: Set<string>,
  ): number {
    if (allDates.length === 0) return 0;

    if (frequency === 'DAILY') {
      let longest = 0;
      let current = 1;
      const sorted = [...allDates].sort((a, b) => a.getTime() - b.getTime());

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          current++;
        } else {
          longest = Math.max(longest, current);
          current = 1;
        }
      }
      longest = Math.max(longest, current);
      return longest;
    }

    // WEEKLY
    const target = targetPerWeek ?? 1;
    if (allDates.length === 0) return 0;

    const sorted = [...allDates].sort((a, b) => a.getTime() - b.getTime());
    const firstMonday = this.getMonday(sorted[0]);
    const lastMonday = this.getMonday(sorted[sorted.length - 1]);

    let longest = 0;
    let current = 0;
    const weekMonday = new Date(firstMonday);

    while (weekMonday <= lastMonday) {
      const count = this.countLogsInWeek(dateSet, weekMonday);
      if (count >= target) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
      weekMonday.setUTCDate(weekMonday.getUTCDate() + 7);
    }

    return longest;
  }

  private calcCompletionRate(
    habit: { frequency: string; targetPerWeek: number | null },
    dateSet: Set<string>,
    today: Date,
    days: number,
  ): number {
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - days + 1);

    let logged = 0;
    const cursor = new Date(from);
    while (cursor <= today) {
      if (dateSet.has(cursor.toISOString().split('T')[0])) logged++;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    if (habit.frequency === 'DAILY') {
      return Math.round((logged / days) * 100);
    }

    // WEEKLY: expected = weeks × targetPerWeek
    const weeks = Math.ceil(days / 7);
    const target = habit.targetPerWeek ?? 1;
    const expected = weeks * target;
    return Math.min(100, Math.round((logged / expected) * 100));
  }

  private toDateOnly(d: Date): Date {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    date.setUTCDate(date.getUTCDate() - diff);
    return date;
  }

  private countLogsInWeek(dateSet: Set<string>, monday: Date): number {
    let count = 0;
    const cursor = new Date(monday);
    for (let i = 0; i < 7; i++) {
      if (dateSet.has(cursor.toISOString().split('T')[0])) count++;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return count;
  }
}

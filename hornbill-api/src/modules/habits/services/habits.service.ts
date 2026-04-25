import { Injectable, NotFoundException } from '@nestjs/common';
import { HabitsRepository } from '../repositories/habits.repository';
import { HabitLogsRepository } from '../repositories/habit-logs.repository';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    private readonly repo: HabitsRepository,
    private readonly logsRepo: HabitLogsRepository,
  ) {}

  async create(dto: CreateHabitDto, userId: string) {
    const maxPos = await this.repo.getMaxPosition(userId);
    return this.repo.create(userId, {
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      frequency: dto.frequency,
      targetPerWeek: dto.targetPerWeek,
      position: maxPos + 1,
    });
  }

  async findAll(userId: string) {
    const habits = await this.repo.findAllActive(userId);
    const today = this.toDateOnly(new Date());

    const results = await Promise.all(
      habits.map(async (habit) => {
        const log = await this.logsRepo.findByHabitAndDate(habit.id, today);
        return {
          ...habit,
          completedToday: !!log,
        };
      }),
    );

    return results;
  }

  async findOne(id: string, userId: string) {
    const habit = await this.repo.findByIdAndUserId(id, userId);
    if (!habit) throw new NotFoundException('Habit not found');
    return habit;
  }

  async findArchived(userId: string) {
    return this.repo.findAllArchived(userId);
  }

  async update(id: string, dto: UpdateHabitDto, userId: string) {
    const habit = await this.repo.findByIdAndUserId(id, userId);
    if (!habit) throw new NotFoundException('Habit not found');
    return this.repo.update(id, { ...dto });
  }

  async archive(id: string, userId: string) {
    const habit = await this.repo.findByIdAndUserId(id, userId);
    if (!habit) throw new NotFoundException('Habit not found');
    return this.repo.update(id, { isArchived: true });
  }

  async restore(id: string, userId: string) {
    const habit = await this.repo.findByIdAndUserId(id, userId);
    if (!habit) throw new NotFoundException('Habit not found');
    return this.repo.update(id, { isArchived: false });
  }

  async getToday(userId: string) {
    const habits = await this.repo.findAllActive(userId);
    const today = this.toDateOnly(new Date());

    const startOfWeek = this.getMonday(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const results = await Promise.all(
      habits.map(async (habit) => {
        const log = await this.logsRepo.findByHabitAndDate(habit.id, today);
        const weekLogs = await this.logsRepo.findByHabitAndDateRange(
          habit.id,
          startOfWeek,
          endOfWeek,
        );

        // Calculate current streak inline for today view
        const dates = await this.logsRepo.findAllDatesByHabit(
          habit.id,
          new Date('2020-01-01'),
          today,
        );
        const currentStreak = this.calcCurrentStreak(
          habit.frequency,
          habit.targetPerWeek,
          dates,
          today,
        );

        return {
          ...habit,
          completedToday: !!log,
          weekCompletions: weekLogs.length,
          currentStreak,
        };
      }),
    );

    return results;
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

  private calcCurrentStreak(
    frequency: string,
    targetPerWeek: number | null,
    dates: Date[],
    today: Date,
  ): number {
    if (dates.length === 0) return 0;

    const dateSet = new Set(dates.map((d) => d.toISOString().split('T')[0]));

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

    // Build week buckets going backwards
    let streak = 0;
    const weekMonday = new Date(currentWeekMonday);

    // Check if current week is "in progress" — don't count it as broken
    // Start checking from the previous week
    weekMonday.setUTCDate(weekMonday.getUTCDate() - 7);

    // But first, check if current week meets target already
    const currentWeekCount = this.countLogsInWeek(dateSet, currentWeekMonday);
    if (currentWeekCount >= target) {
      streak++;
    }

    // Go backwards from previous week
    while (true) {
      const count = this.countLogsInWeek(dateSet, weekMonday);
      if (count >= target) {
        streak++;
        weekMonday.setUTCDate(weekMonday.getUTCDate() - 7);
      } else {
        break;
      }
    }

    // If current week hasn't met target yet but is in progress, still count previous streak
    if (currentWeekCount < target) {
      // Current week is in progress — don't break the streak from previous weeks
      // streak is already just the past weeks count
    }

    return streak;
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

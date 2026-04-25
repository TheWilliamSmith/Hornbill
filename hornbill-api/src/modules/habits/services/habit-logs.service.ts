import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { HabitLogsRepository } from '../repositories/habit-logs.repository';
import { HabitsRepository } from '../repositories/habits.repository';
import { CreateLogDto } from '../dto/create-log.dto';

@Injectable()
export class HabitLogsService {
  constructor(
    private readonly logsRepo: HabitLogsRepository,
    private readonly habitsRepo: HabitsRepository,
  ) {}

  async log(habitId: string, dto: CreateLogDto, userId: string) {
    const habit = await this.habitsRepo.findByIdAndUserId(habitId, userId);
    if (!habit) throw new NotFoundException('Habit not found');

    const date = dto.date ? this.parseDate(dto.date) : this.toDateOnly(new Date());

    // Cannot log in the future
    const today = this.toDateOnly(new Date());
    if (date > today) {
      throw new BadRequestException('Cannot log a habit in the future');
    }

    // Check for existing log
    const existing = await this.logsRepo.findByHabitAndDate(habitId, date);
    if (existing) {
      throw new ConflictException('Habit already logged for this date');
    }

    return this.logsRepo.create(habitId, date, dto.note);
  }

  async unlog(habitId: string, dateStr: string, userId: string) {
    const habit = await this.habitsRepo.findByIdAndUserId(habitId, userId);
    if (!habit) throw new NotFoundException('Habit not found');

    const date = this.parseDate(dateStr);
    const existing = await this.logsRepo.findByHabitAndDate(habitId, date);
    if (!existing) {
      throw new NotFoundException('No log found for this date');
    }

    await this.logsRepo.deleteByHabitAndDate(habitId, date);
  }

  async getLogs(habitId: string, from: string, to: string, userId: string) {
    const habit = await this.habitsRepo.findByIdAndUserId(habitId, userId);
    if (!habit) throw new NotFoundException('Habit not found');

    return this.logsRepo.findByHabitAndDateRange(habitId, this.parseDate(from), this.parseDate(to));
  }

  async updateNote(habitId: string, dateStr: string, note: string | null, userId: string) {
    const habit = await this.habitsRepo.findByIdAndUserId(habitId, userId);
    if (!habit) throw new NotFoundException('Habit not found');

    const date = this.parseDate(dateStr);
    const existing = await this.logsRepo.findByHabitAndDate(habitId, date);
    if (!existing) throw new NotFoundException('No log found for this date');

    return this.logsRepo.updateNote(habitId, date, note);
  }

  private parseDate(str: string): Date {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  private toDateOnly(d: Date): Date {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }
}

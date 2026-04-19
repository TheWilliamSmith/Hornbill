import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class HabitLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(habitId: string, date: Date, note?: string) {
    return this.prisma.habitLog.create({
      data: { habitId, date, note },
    });
  }

  async findByHabitAndDate(habitId: string, date: Date) {
    return this.prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date } },
    });
  }

  async deleteByHabitAndDate(habitId: string, date: Date) {
    return this.prisma.habitLog.delete({
      where: { habitId_date: { habitId, date } },
    });
  }

  async findByHabitAndDateRange(habitId: string, from: Date, to: Date) {
    return this.prisma.habitLog.findMany({
      where: {
        habitId,
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findRecentByHabit(habitId: string, limit: number) {
    return this.prisma.habitLog.findMany({
      where: { habitId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async countByHabit(habitId: string): Promise<number> {
    return this.prisma.habitLog.count({ where: { habitId } });
  }

  async findAllDatesByHabit(habitId: string, from: Date, to: Date): Promise<Date[]> {
    const logs = await this.prisma.habitLog.findMany({
      where: {
        habitId,
        date: { gte: from, lte: to },
      },
      select: { date: true },
      orderBy: { date: 'asc' },
    });
    return logs.map((l) => l.date);
  }

  async updateNote(habitId: string, date: Date, note: string | null) {
    return this.prisma.habitLog.update({
      where: { habitId_date: { habitId, date } },
      data: { note },
    });
  }
}

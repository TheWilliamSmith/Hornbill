import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { HabitFrequency } from '../enums/habit-frequency.enum';

@Injectable()
export class HabitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      name: string;
      description?: string;
      icon?: string;
      frequency?: HabitFrequency;
      targetPerWeek?: number;
      position: number;
    },
  ) {
    return this.prisma.habit.create({
      data: { userId, ...data },
    });
  }

  async findAllActive(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId, isArchived: false },
      orderBy: { position: 'asc' },
    });
  }

  async findAllArchived(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId, isArchived: true },
      orderBy: { position: 'asc' },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.habit.findFirst({
      where: { id, userId },
    });
  }

  async findByIdWithLogs(id: string, userId: string) {
    return this.prisma.habit.findFirst({
      where: { id, userId },
      include: { logs: { orderBy: { date: 'desc' } } },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.prisma.habit.update({ where: { id }, data });
  }

  async getMaxPosition(userId: string): Promise<number> {
    const result = await this.prisma.habit.findFirst({
      where: { userId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return result?.position ?? -1;
  }
}

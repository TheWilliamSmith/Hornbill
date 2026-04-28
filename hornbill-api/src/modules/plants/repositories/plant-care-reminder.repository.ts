import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { CreateReminderData, UpdateReminderData } from '../interfaces/plant.interface';
import { PlantCareReminder } from '../entities/plant.entity';

@Injectable()
export class PlantCareReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(plantId: string, data: CreateReminderData): Promise<PlantCareReminder> {
    return this.prisma.plantCareReminder.create({ data: { ...data, plantId } });
  }

  async findManyByPlantId(plantId: string): Promise<PlantCareReminder[]> {
    return this.prisma.plantCareReminder.findMany({
      where: { plantId },
      orderBy: { careType: 'asc' },
    });
  }

  async findById(id: string): Promise<PlantCareReminder | null> {
    return this.prisma.plantCareReminder.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateReminderData): Promise<PlantCareReminder> {
    return this.prisma.plantCareReminder.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.plantCareReminder.delete({ where: { id } });
  }

  async findDueReminders(userId: string, before: Date): Promise<(PlantCareReminder & { plant: { id: string; customName: string; userId: string } })[]> {
    return this.prisma.plantCareReminder.findMany({
      where: {
        isActive: true,
        nextCareAt: { lte: before },
        plant: { userId, status: 'ACTIVE' },
      },
      include: {
        plant: { select: { id: true, customName: true, userId: true } },
      },
      orderBy: { nextCareAt: 'asc' },
    }) as any;
  }

  async findUpcomingReminders(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<(PlantCareReminder & { plant: { id: string; customName: string } })[]> {
    return this.prisma.plantCareReminder.findMany({
      where: {
        isActive: true,
        nextCareAt: { gte: from, lte: to },
        plant: { userId, status: 'ACTIVE' },
      },
      include: {
        plant: { select: { id: true, customName: true } },
      },
      orderBy: { nextCareAt: 'asc' },
    }) as any;
  }
}

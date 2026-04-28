import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { CreateHealthLogData } from '../interfaces/plant.interface';
import { PlantHealthLog } from '../entities/plant.entity';

@Injectable()
export class PlantHealthLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(plantId: string, data: CreateHealthLogData): Promise<PlantHealthLog> {
    return this.prisma.plantHealthLog.create({ data: { ...data, plantId } });
  }

  async findManyByPlantId(plantId: string, page: number, limit: number): Promise<PlantHealthLog[]> {
    return this.prisma.plantHealthLog.findMany({
      where: { plantId },
      orderBy: { loggedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countByPlantId(plantId: string): Promise<number> {
    return this.prisma.plantHealthLog.count({ where: { plantId } });
  }

  async findById(id: string): Promise<PlantHealthLog | null> {
    return this.prisma.plantHealthLog.findUnique({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.plantHealthLog.delete({ where: { id } });
  }

  async findRecentByUserId(userId: string, days: number): Promise<PlantHealthLog[]> {
    return this.prisma.plantHealthLog.findMany({
      where: {
        plant: { userId },
        loggedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        status: { in: ['POOR', 'CRITICAL'] },
      },
      orderBy: { loggedAt: 'desc' },
    });
  }
}

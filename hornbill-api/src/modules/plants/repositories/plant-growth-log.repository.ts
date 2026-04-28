import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { CreateGrowthLogData } from '../interfaces/plant.interface';
import { PlantGrowthLog } from '../entities/plant.entity';

@Injectable()
export class PlantGrowthLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(plantId: string, data: CreateGrowthLogData): Promise<PlantGrowthLog> {
    return this.prisma.plantGrowthLog.create({ data: { ...data, plantId } });
  }

  async findManyByPlantId(plantId: string, page: number, limit: number): Promise<PlantGrowthLog[]> {
    return this.prisma.plantGrowthLog.findMany({
      where: { plantId },
      orderBy: { measuredAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countByPlantId(plantId: string): Promise<number> {
    return this.prisma.plantGrowthLog.count({ where: { plantId } });
  }

  async findById(id: string): Promise<PlantGrowthLog | null> {
    return this.prisma.plantGrowthLog.findUnique({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.plantGrowthLog.delete({ where: { id } });
  }
}

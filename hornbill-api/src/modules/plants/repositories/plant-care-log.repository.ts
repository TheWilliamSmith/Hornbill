import { Injectable } from '@nestjs/common';
import { PlantCareType } from '@src/generated/prisma/enums';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { CreateCareLogData } from '../interfaces/plant.interface';
import { PlantCareLog } from '../entities/plant.entity';

@Injectable()
export class PlantCareLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(plantId: string, data: CreateCareLogData): Promise<PlantCareLog> {
    const { details, ...rest } = data;
    return this.prisma.plantCareLog.create({
      data: { ...rest, plantId, ...(details !== undefined && { details: details as any }) },
    }) as Promise<PlantCareLog>;
  }

  async findManyByPlantId(
    plantId: string,
    page: number,
    limit: number,
    careType?: PlantCareType,
  ): Promise<PlantCareLog[]> {
    return this.prisma.plantCareLog.findMany({
      where: { plantId, ...(careType && { careType }) },
      orderBy: { performedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }) as Promise<PlantCareLog[]>;
  }

  async countByPlantId(plantId: string, careType?: PlantCareType): Promise<number> {
    return this.prisma.plantCareLog.count({
      where: { plantId, ...(careType && { careType }) },
    });
  }

  async findById(id: string): Promise<PlantCareLog | null> {
    return this.prisma.plantCareLog.findUnique({ where: { id } }) as Promise<PlantCareLog | null>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.plantCareLog.delete({ where: { id } });
  }

  async countWateringByUserId(userId: string): Promise<number> {
    return this.prisma.plantCareLog.count({
      where: {
        careType: PlantCareType.WATERING,
        plant: { userId },
        performedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });
  }

  async findAllPhotosByUserId(
    userId: string,
    plantId?: string,
  ): Promise<{ id: string; photoUrl: string; performedAt: Date; careType: PlantCareType; plantId: string }[]> {
    return this.prisma.plantCareLog.findMany({
      where: {
        plant: { userId },
        ...(plantId && { plantId }),
        photoUrl: { not: null },
      },
      select: { id: true, photoUrl: true, performedAt: true, careType: true, plantId: true },
      orderBy: { performedAt: 'desc' },
    }) as any;
  }
}

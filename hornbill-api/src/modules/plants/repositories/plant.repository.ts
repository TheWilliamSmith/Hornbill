import { Injectable } from '@nestjs/common';
import { PlantStatus } from '@src/generated/prisma/enums';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { CreatePlantData, UpdatePlantData } from '../interfaces/plant.interface';
import { PlantWithRelations } from '../interfaces/plant.interface';

@Injectable()
export class PlantRepository {
  private readonly defaultInclude = {
    location: {
      select: { id: true, name: true, orientation: true, lightLevel: true },
    },
    careProfile: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePlantData, userId: string): Promise<PlantWithRelations> {
    return this.prisma.plant.create({
      data: { ...data, userId },
      include: this.defaultInclude,
    }) as Promise<PlantWithRelations>;
  }

  async findManyByUserId(
    userId: string,
    page: number,
    limit: number,
    status?: PlantStatus,
    locationId?: string,
  ): Promise<PlantWithRelations[]> {
    return this.prisma.plant.findMany({
      where: {
        userId,
        ...(status && { status }),
        ...(locationId && { locationId }),
      },
      include: this.defaultInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }) as Promise<PlantWithRelations[]>;
  }

  async countByUserId(userId: string, status?: PlantStatus, locationId?: string): Promise<number> {
    return this.prisma.plant.count({
      where: {
        userId,
        ...(status && { status }),
        ...(locationId && { locationId }),
      },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<PlantWithRelations | null> {
    return this.prisma.plant.findFirst({
      where: { id, userId },
      include: this.defaultInclude,
    }) as Promise<PlantWithRelations | null>;
  }

  async update(id: string, userId: string, data: UpdatePlantData): Promise<PlantWithRelations> {
    return this.prisma.plant.update({
      where: { id },
      data,
      include: this.defaultInclude,
    }) as Promise<PlantWithRelations>;
  }

  async archive(
    id: string,
    userId: string,
    archiveReason: string,
  ): Promise<PlantWithRelations> {
    return this.prisma.plant.update({
      where: { id },
      data: {
        status: PlantStatus.ARCHIVED,
        archiveReason: archiveReason as any,
        archivedAt: new Date(),
      },
      include: this.defaultInclude,
    }) as Promise<PlantWithRelations>;
  }

  async restore(id: string, userId: string): Promise<PlantWithRelations> {
    return this.prisma.plant.update({
      where: { id },
      data: {
        status: PlantStatus.ACTIVE,
        archiveReason: null,
        archivedAt: null,
      },
      include: this.defaultInclude,
    }) as Promise<PlantWithRelations>;
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.prisma.plant.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      throw new Error('Plant not found or user unauthorized');
    }
  }

  async countActive(userId: string): Promise<number> {
    return this.prisma.plant.count({ where: { userId, status: PlantStatus.ACTIVE } });
  }

  async countAll(userId: string): Promise<number> {
    return this.prisma.plant.count({ where: { userId } });
  }

  async findOldest(userId: string): Promise<PlantWithRelations | null> {
    return this.prisma.plant.findFirst({
      where: { userId, status: PlantStatus.ACTIVE },
      orderBy: { acquiredAt: 'asc' },
      include: this.defaultInclude,
    }) as Promise<PlantWithRelations | null>;
  }
}

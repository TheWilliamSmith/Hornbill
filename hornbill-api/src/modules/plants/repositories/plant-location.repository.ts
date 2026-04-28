import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { CreateLocationData, UpdateLocationData } from '../interfaces/plant.interface';
import { PlantLocation } from '../entities/plant.entity';

type PlantLocationWithPlants = PlantLocation & {
  plants: { id: string; customName: string; speciesName: string | null; photoUrl: string | null; status: string }[];
};

@Injectable()
export class PlantLocationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateLocationData): Promise<PlantLocation> {
    return this.prisma.plantLocation.create({ data: { ...data, userId } });
  }

  async findManyByUserId(userId: string): Promise<PlantLocation[]> {
    return this.prisma.plantLocation.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<PlantLocationWithPlants | null> {
    return this.prisma.plantLocation.findFirst({
      where: { id, userId },
      include: {
        plants: {
          where: { status: 'ACTIVE' },
          select: { id: true, customName: true, speciesName: true, photoUrl: true, status: true },
        },
      },
    }) as Promise<PlantLocationWithPlants | null>;
  }

  async update(id: string, userId: string, data: UpdateLocationData): Promise<PlantLocation> {
    return this.prisma.plantLocation.update({ where: { id }, data });
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.prisma.plantLocation.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      throw new Error('Location not found or user unauthorized');
    }
  }
}

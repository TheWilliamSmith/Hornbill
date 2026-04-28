import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { UpsertCareProfileData } from '../interfaces/plant.interface';
import { PlantCareProfile } from '../entities/plant.entity';

@Injectable()
export class PlantCareProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(plantId: string, data: UpsertCareProfileData): Promise<PlantCareProfile> {
    return this.prisma.plantCareProfile.upsert({
      where: { plantId },
      create: { ...data, plantId },
      update: data,
    });
  }

  async findByPlantId(plantId: string): Promise<PlantCareProfile | null> {
    return this.prisma.plantCareProfile.findUnique({ where: { plantId } });
  }

  async delete(plantId: string): Promise<void> {
    await this.prisma.plantCareProfile.deleteMany({ where: { plantId } });
  }
}

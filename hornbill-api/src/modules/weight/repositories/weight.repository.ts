import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { createWeightEntryData } from '../interfaces/weight.interface';
import { Injectable } from '@nestjs/common';
import { WeightEntry } from '../entities/weight.entity';

@Injectable()
export class WeightRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWeightEntry(data: createWeightEntryData, userId: string): Promise<WeightEntry> {
    return this.prisma.weightEntry.create({
      data: {
        userId: userId,
        weight: data.weight,
        unit: data.unit,
        measuredAt: data.measuredAt,
        note: data.note,
      },
    });
  }
}

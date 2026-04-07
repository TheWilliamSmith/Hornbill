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

  async findManyByUserId(userId: string, page: number, limit: number, from?: Date, to?: Date) {
    return this.prisma.weightEntry.findMany({
      where: {
        userId,
        ...(from || to
          ? {
              measuredAt: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
              },
            }
          : {}),
      },
      orderBy: { measuredAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countByUserId(userId: string, from: Date, to: Date) {
    return this.prisma.weightEntry.count({
      where: {
        userId,
        measuredAt: {
          gte: from,
          lte: to,
        },
      },
    });
  }
}

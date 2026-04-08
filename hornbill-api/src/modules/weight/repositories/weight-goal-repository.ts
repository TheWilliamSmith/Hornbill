import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { WeightGoalStatus } from 'src/generated/prisma/enums';
import { WeightGoal } from '../entities/weight.entity';
import { CreateWeightGoalData } from '../interfaces/weight.interface';

@Injectable()
export class WeightGoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWeightGoal(data: CreateWeightGoalData, userId: string): Promise<WeightGoal> {
    return this.prisma.weightGoal.create({
      data: {
        userId,
        targetWeight: data.targetWeight,
        unit: data.unit,
        direction: data.direction,
        mode: data.mode,
        status: WeightGoalStatus.IN_PROGRESS,
        deadline: data.deadline,
        toleranceWeight: data.toleranceWeight,
        note: data.note,
      },
    });
  }

  async findAllByUserId(userId: string, page: number, limit: number): Promise<WeightGoal[]> {
    return this.prisma.weightGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.weightGoal.count({
      where: { userId },
    });
  }

  async findOneByUserId(id: string, userId: string): Promise<WeightGoal | null> {
    return this.prisma.weightGoal.findFirst({
      where: { id, userId },
    });
  }
}

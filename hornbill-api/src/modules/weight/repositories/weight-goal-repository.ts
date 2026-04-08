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
}

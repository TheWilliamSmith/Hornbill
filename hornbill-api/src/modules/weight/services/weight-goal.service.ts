import { Injectable, BadRequestException } from '@nestjs/common';
import { WeightGoalMode } from 'src/generated/prisma/enums';
import { CreateWeightGoalDto } from '../dto/weight-goal-dto/create-weight-goal.dto';
import { WeightGoalRepository } from '../repositories/weight-goal-repository';
import { WeightGoalMapper } from '../mappers/weight-goal.mapper';
import { WeightEntryRepository } from '../repositories/weight-entry.repository';
import { WeightGoalDirection } from 'src/generated/prisma/enums';

@Injectable()
export class WeightGoalService {
  constructor(
    private readonly repo: WeightGoalRepository,
    private readonly weightEntryRepo: WeightEntryRepository,
  ) {}

  async createWeightGoal(dto: CreateWeightGoalDto, userId: string) {
    if (dto.mode === WeightGoalMode.DEADLINE) {
      if (!dto.deadline) {
        throw new BadRequestException('Deadline is required when mode is DEADLINE');
      }
      if (dto.deadline <= new Date()) {
        throw new BadRequestException('Deadline must be in the future');
      }
    }

    const latestEntry = await this.weightEntryRepo.findLatestEntryByUserId(userId);

    if (!latestEntry) {
      throw new BadRequestException('At least one weight entry is required to set a weight goal');
    }

    const direction: WeightGoalDirection = getDirection(dto.targetWeight, latestEntry.weight);

    if (direction === WeightGoalDirection.MAINTAIN && !dto.toleranceWeight) {
      throw new BadRequestException('Tolerance weight is required for MAINTAIN goals');
    }

    const goal = await this.repo.createWeightGoal(
      {
        targetWeight: dto.targetWeight,
        unit: dto.unit,
        direction: direction,
        mode: dto.mode,
        deadline: dto.deadline,
        toleranceWeight: dto.toleranceWeight,
        note: dto.note,
      },
      userId,
    );

    return WeightGoalMapper.toCreateResponse(goal);
  }
}

const getDirection = (targetWeight: number, currentWeight: number): WeightGoalDirection => {
  if (targetWeight > currentWeight) {
    return WeightGoalDirection.GAIN;
  } else if (targetWeight < currentWeight) {
    return WeightGoalDirection.LOSE;
  } else {
    return WeightGoalDirection.MAINTAIN;
  }
};

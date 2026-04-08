import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { WeightGoalMode, WeightGoalDirection, WeightGoalStatus } from 'src/generated/prisma/enums';
import { CreateWeightGoalDto } from '../dto/weight-goal-dto/create-weight-goal.dto';
import { UpdateWeightGoalDto } from '../dto/weight-goal-dto/update-weight-goal.dto';
import { GetWeightGoalsQueryDto } from '../dto/weight-goal-dto/get-weight-goals-query.dto';
import { WeightGoalRepository } from '../repositories/weight-goal-repository';
import { WeightGoalMapper } from '../mappers/weight-goal.mapper';
import { WeightEntryRepository } from '../repositories/weight-entry.repository';
import { PaginationMapper } from 'src/common/mappers/pagination.mapper';

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

  async getGoals(userId: string, { page, limit }: GetWeightGoalsQueryDto) {
    const [goals, total] = await Promise.all([
      this.repo.findAllByUserId(userId, page, limit),
      this.repo.countByUserId(userId),
    ]);

    const mapped = goals.map(WeightGoalMapper.toGetResponse);
    return PaginationMapper.toPaginatedResponse(mapped, total, page, limit);
  }

  async getGoal(id: string, userId: string) {
    const goal = await this.repo.findOneByUserId(id, userId);

    if (!goal) {
      throw new NotFoundException(`Weight goal with id ${id} not found`);
    }

    return WeightGoalMapper.toGetResponse(goal);
  }

  async updateWeightGoal(id: string, dto: UpdateWeightGoalDto, userId: string) {
    const goal = await this.repo.findOneByUserId(id, userId);

    if (!goal) {
      throw new NotFoundException(`Weight goal with id ${id} not found`);
    }

    if (goal.status !== WeightGoalStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot update a goal that is already resolved');
    }

    if (dto.mode === WeightGoalMode.DEADLINE) {
      if (!dto.deadline && !goal.deadline) {
        throw new BadRequestException('Deadline is required when mode is DEADLINE');
      }
      const deadline = dto.deadline ?? goal.deadline!;
      if (deadline <= new Date()) {
        throw new BadRequestException('Deadline must be in the future');
      }
    }

    let direction = goal.direction;
    if (dto.targetWeight && dto.targetWeight !== goal.targetWeight) {
      const latestEntry = await this.weightEntryRepo.findLatestEntryByUserId(userId);

      if (!latestEntry) {
        throw new BadRequestException('At least one weight entry is required');
      }

      if (dto.targetWeight > latestEntry.weight) {
        direction = WeightGoalDirection.GAIN;
      } else if (dto.targetWeight < latestEntry.weight) {
        direction = WeightGoalDirection.LOSE;
      } else {
        direction = WeightGoalDirection.MAINTAIN;
      }
    }

    const updated = await this.repo.updateWeightGoal(id, { ...dto, direction }, userId);
    return WeightGoalMapper.toUpdateResponse(updated);
  }

  async deleteWeightGoal(id: string, userId: string) {
    const goal = await this.repo.findOneByUserId(id, userId);

    if (!goal) {
      throw new NotFoundException(`Weight goal with id ${id} not found`);
    }

    await this.repo.deleteWeightGoal(id, userId);
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

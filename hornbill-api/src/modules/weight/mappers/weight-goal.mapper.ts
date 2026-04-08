import { WeightGoal } from '../entities/weight.entity';
import { CreateWeightGoalResponseDto } from '../dto/weight-goal-dto/create-weight-goal-response.dto';
import { GetWeightGoalResponseDto } from '../dto/weight-goal-dto/get-weight-goal-response.dto';

export class WeightGoalMapper {
  private static mapGoalFields<T extends GetWeightGoalResponseDto>(dto: T, goal: WeightGoal): T {
    dto.id = goal.id;
    dto.targetWeight = goal.targetWeight;
    dto.unit = goal.unit;
    dto.direction = goal.direction;
    dto.mode = goal.mode;
    dto.status = goal.status;
    dto.deadline = goal.deadline ?? undefined;
    dto.toleranceWeight = goal.toleranceWeight ?? undefined;
    dto.note = goal.note ?? undefined;
    dto.resolvedAt = goal.resolvedAt ?? undefined;
    dto.createdAt = goal.createdAt;
    dto.updatedAt = goal.updatedAt;
    return dto;
  }

  static toCreateResponse(goal: WeightGoal): CreateWeightGoalResponseDto {
    return WeightGoalMapper.mapGoalFields(new CreateWeightGoalResponseDto(), goal);
  }

  static toGetResponse(goal: WeightGoal): GetWeightGoalResponseDto {
    return WeightGoalMapper.mapGoalFields(new GetWeightGoalResponseDto(), goal);
  }
}

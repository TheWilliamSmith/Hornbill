import { ApiProperty } from '@nestjs/swagger';
import {
  WeightUnit,
  WeightGoalDirection,
  WeightGoalMode,
  WeightGoalStatus,
} from 'src/generated/prisma/enums';

export class UpdateWeightGoalResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the weight goal',
    example: 'clp1234567890abcdef',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Target weight value in the specified unit',
    example: 70.0,
    type: Number,
  })
  targetWeight: number;

  @ApiProperty({
    description: 'Unit of measurement for the target weight',
    example: 'KG',
    enum: WeightUnit,
    enumName: 'WeightUnit',
  })
  unit: WeightUnit;

  @ApiProperty({
    description: 'Direction of the weight goal',
    example: 'LOSE',
    enum: WeightGoalDirection,
    enumName: 'WeightGoalDirection',
  })
  direction: WeightGoalDirection;

  @ApiProperty({
    description: 'Mode of the weight goal',
    example: 'DEADLINE',
    enum: WeightGoalMode,
    enumName: 'WeightGoalMode',
  })
  mode: WeightGoalMode;

  @ApiProperty({
    description: 'Current status of the weight goal',
    example: 'IN_PROGRESS',
    enum: WeightGoalStatus,
    enumName: 'WeightGoalStatus',
  })
  status: WeightGoalStatus;

  @ApiProperty({
    description: 'Deadline date for the goal',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
    format: 'date-time',
    type: String,
  })
  deadline?: Date;

  @ApiProperty({
    description: 'Accepted tolerance around the target weight',
    example: 1.5,
    required: false,
    type: Number,
  })
  toleranceWeight?: number;

  @ApiProperty({
    description: 'Optional note about the goal',
    example: 'Lose weight before summer',
    required: false,
    type: String,
  })
  note?: string;

  @ApiProperty({
    description: 'Date and time when the goal was resolved',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
    format: 'date-time',
    type: String,
  })
  resolvedAt?: Date;

  @ApiProperty({
    description: 'Date and time when the goal was created',
    example: '2024-01-15T08:30:00.000Z',
    format: 'date-time',
    type: String,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the goal was last updated',
    example: '2024-01-15T08:30:00.000Z',
    format: 'date-time',
    type: String,
  })
  updatedAt: Date;
}

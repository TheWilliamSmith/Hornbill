import { WeightUnit, WeightGoalDirection, WeightGoalMode } from 'src/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDate,
  IsEnum,
  IsPositive,
  IsString,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateWeightGoalDto {
  @ApiProperty({
    description: 'Target weight value in the specified unit',
    example: 70.0,
    minimum: 20,
    maximum: 500,
    type: Number,
  })
  @IsNotEmpty({ message: 'Target weight is required' })
  @IsNumber({}, { message: 'Target weight must be a number' })
  @IsPositive({ message: 'Target weight must be a positive number' })
  @Min(20, { message: 'Target weight must be at least 20' })
  @Max(500, { message: 'Target weight must not exceed 500' })
  targetWeight: number;

  @ApiProperty({
    description: 'Unit of measurement for the target weight',
    example: 'KG',
    enum: WeightUnit,
    enumName: 'WeightUnit',
  })
  @IsNotEmpty({ message: 'Weight unit is required' })
  @IsEnum(WeightUnit, { message: 'Weight unit must be either KG or LBS' })
  unit: WeightUnit;

  @ApiProperty({
    description: 'Mode of the weight goal',
    example: 'DEADLINE',
    enum: WeightGoalMode,
    enumName: 'WeightGoalMode',
  })
  @IsNotEmpty({ message: 'Goal mode is required' })
  @IsEnum(WeightGoalMode, { message: 'Mode must be MILESTONE or DEADLINE' })
  mode: WeightGoalMode;

  @ApiProperty({
    description: 'Deadline date for the goal (required when mode is DEADLINE)',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
    format: 'date-time',
    type: String,
  })
  @IsOptional()
  @IsDate({ message: 'Deadline must be a valid date' })
  @Type(() => Date)
  deadline?: Date;

  @ApiProperty({
    description: 'Accepted tolerance around the target weight',
    example: 1.5,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tolerance weight must be a number' })
  @IsPositive({ message: 'Tolerance weight must be a positive number' })
  toleranceWeight?: number;

  @ApiProperty({
    description: 'Optional note about the goal',
    example: 'Lose weight before summer',
    required: false,
    maxLength: 500,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  @Length(1, 500, { message: 'Note must be between 1 and 500 characters' })
  note?: string;
}

import { WeightUnit, WeightGoalMode } from 'src/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsDate,
  IsEnum,
  IsPositive,
  IsString,
  Min,
  Max,
  Length,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class UpdateWeightGoalDto {
  @ApiProperty({
    description: 'Target weight value in the specified unit',
    example: 70.0,
    minimum: 20,
    maximum: 500,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Target weight must be a number' })
  @IsPositive({ message: 'Target weight must be a positive number' })
  @Min(20, { message: 'Target weight must be at least 20' })
  @Max(500, { message: 'Target weight must not exceed 500' })
  targetWeight?: number;

  @ApiProperty({
    description: 'Unit of measurement for the target weight',
    example: 'KG',
    enum: WeightUnit,
    enumName: 'WeightUnit',
    required: false,
  })
  @IsOptional()
  @IsEnum(WeightUnit, { message: 'Weight unit must be either KG or LBS' })
  unit?: WeightUnit;

  @ApiProperty({
    description: 'Mode of the weight goal',
    example: 'DEADLINE',
    enum: WeightGoalMode,
    enumName: 'WeightGoalMode',
    required: false,
  })
  @IsOptional()
  @IsEnum(WeightGoalMode, { message: 'Mode must be MILESTONE or DEADLINE' })
  mode?: WeightGoalMode;

  @ApiProperty({
    description:
      'Deadline date for the goal — required when mode is DEADLINE, must be in the future',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((o) => o.mode === WeightGoalMode.DEADLINE)
  @IsNotEmpty({ message: 'Deadline is required when mode is DEADLINE' })
  @IsDate({ message: 'Deadline must be a valid date' })
  @Type(() => Date)
  deadline?: Date;

  @ApiProperty({
    description: 'Accepted tolerance around the target weight — relevant for MAINTAIN direction',
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

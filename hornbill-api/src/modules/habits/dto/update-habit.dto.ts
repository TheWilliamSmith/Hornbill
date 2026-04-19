import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { HabitFrequency } from '../enums/habit-frequency.enum';

export class UpdateHabitDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsEnum(HabitFrequency)
  frequency?: HabitFrequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  targetPerWeek?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

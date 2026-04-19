import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { HabitFrequency } from '../enums/habit-frequency.enum';

export class CreateHabitDto {
  @IsString()
  name: string;

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
}

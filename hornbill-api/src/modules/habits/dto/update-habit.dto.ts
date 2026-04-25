import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  Min,
  Max,
  IsBoolean,
  Matches,
} from 'class-validator';
import { HabitFrequency } from '../enums/habit-frequency.enum';
import { NotifyType } from '../enums/notify-type.enum';

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
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  reminderTime?: string | null;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  reminderDays?: number[];

  @IsOptional()
  @IsArray()
  @IsEnum(NotifyType, { each: true })
  notifyTypes?: NotifyType[];

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

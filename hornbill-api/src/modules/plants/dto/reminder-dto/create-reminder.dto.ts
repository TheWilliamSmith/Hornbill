import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsPositive, Max } from 'class-validator';
import { PlantCareType } from '@src/generated/prisma/enums';

export class CreateReminderDto {
  @ApiProperty({ enum: PlantCareType })
  @IsEnum(PlantCareType)
  careType: PlantCareType;

  @ApiProperty({ description: 'Frequency in days (growth season)', example: 7 })
  @IsNumber()
  @IsPositive()
  @Max(365)
  frequencyGrowth: number;

  @ApiProperty({ description: 'Frequency in days (rest season)', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(365)
  frequencyRest?: number;

  @ApiProperty({ description: 'Next care date' })
  @IsDate()
  @Type(() => Date)
  nextCareAt: Date;
}

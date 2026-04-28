import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsPositive, Max } from 'class-validator';
import { PlantCareType } from '@src/generated/prisma/enums';

export class UpdateReminderDto {
  @ApiProperty({ enum: PlantCareType, required: false })
  @IsOptional()
  @IsEnum(PlantCareType)
  careType?: PlantCareType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(365)
  frequencyGrowth?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(365)
  frequencyRest?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextCareAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

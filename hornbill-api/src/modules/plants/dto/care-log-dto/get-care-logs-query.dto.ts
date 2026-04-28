import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PlantCareType } from '@src/generated/prisma/enums';

export class GetCareLogsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiProperty({ enum: PlantCareType, required: false })
  @IsOptional()
  @IsEnum(PlantCareType)
  careType?: PlantCareType;
}

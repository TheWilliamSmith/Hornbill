import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { PlantStatus } from '@src/generated/prisma/enums';

export class GetPlantsQueryDto {
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

  @ApiProperty({ enum: PlantStatus, required: false })
  @IsOptional()
  @IsEnum(PlantStatus)
  status?: PlantStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  locationId?: string;
}

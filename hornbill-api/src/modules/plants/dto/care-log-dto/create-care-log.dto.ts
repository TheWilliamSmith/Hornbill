import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { PlantCareType } from '@src/generated/prisma/enums';

export class CreateCareLogDto {
  @ApiProperty({ enum: PlantCareType })
  @IsEnum(PlantCareType)
  careType: PlantCareType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  performedAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({
    required: false,
    description: 'Extra details (e.g. fertilizer type, dosage, treatment product)',
    example: { fertilizerType: 'NPK 10-10-10', dosage: '5ml/L' },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PlantHumidityLevel, PlantLightLevel } from '@src/generated/prisma/enums';

export class UpsertCareProfileDto {
  @ApiProperty({ description: 'Watering frequency in days (growth season)', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(365)
  wateringFrequencyGrowth?: number;

  @ApiProperty({ description: 'Watering frequency in days (rest season)', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(365)
  wateringFrequencyRest?: number;

  @ApiProperty({ enum: PlantLightLevel, required: false })
  @IsOptional()
  @IsEnum(PlantLightLevel)
  lightLevel?: PlantLightLevel;

  @ApiProperty({ enum: PlantHumidityLevel, required: false })
  @IsOptional()
  @IsEnum(PlantHumidityLevel)
  humidity?: PlantHumidityLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(-20)
  @Max(50)
  minTemperature?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(-20)
  @Max(50)
  maxTemperature?: number;

  @ApiProperty({ description: 'Fertilizing frequency in days', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(365)
  fertilizingFrequency?: number;

  @ApiProperty({ description: 'Repotting frequency in months', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(60)
  repottingFrequencyMonths?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  substrateType?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  toxicCats?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  toxicDogs?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  toxicChildren?: boolean;
}

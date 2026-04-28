import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PlantLightLevel, WindowOrientation } from '@src/generated/prisma/enums';

export class UpdateLocationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ enum: WindowOrientation, required: false })
  @IsOptional()
  @IsEnum(WindowOrientation)
  orientation?: WindowOrientation;

  @ApiProperty({ enum: PlantLightLevel, required: false })
  @IsOptional()
  @IsEnum(PlantLightLevel)
  lightLevel?: PlantLightLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasRadiator?: boolean;
}

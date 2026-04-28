import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { PlantHealthStatus } from '@src/generated/prisma/enums';

export class CreateHealthLogDto {
  @ApiProperty({ enum: PlantHealthStatus })
  @IsEnum(PlantHealthStatus)
  status: PlantHealthStatus;

  @ApiProperty({
    required: false,
    isArray: true,
    example: ['yellow_leaves', 'drooping', 'brown_spots'],
    description: 'List of observed symptoms',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @MaxLength(100, { each: true })
  symptoms?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  loggedAt?: Date;
}

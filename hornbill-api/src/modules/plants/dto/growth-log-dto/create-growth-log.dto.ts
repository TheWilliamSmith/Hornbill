import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGrowthLogDto {
  @ApiProperty({ required: false, description: 'Height in centimeters' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  heightCm?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  leafCount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  shootCount?: number;

  @ApiProperty({ required: false, description: 'Spread/width in centimeters' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  spreadCm?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  measuredAt?: Date;
}

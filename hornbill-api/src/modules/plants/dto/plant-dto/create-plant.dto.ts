import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { AcquisitionMode } from '@src/generated/prisma/enums';

export class CreatePlantDto {
  @ApiProperty({ example: 'Monstera du salon' })
  @IsString()
  @MaxLength(100)
  customName: string;

  @ApiProperty({ example: 'Monstera Deliciosa', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  speciesName?: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  acquiredAt?: Date;

  @ApiProperty({ enum: AcquisitionMode, required: false })
  @IsOptional()
  @IsEnum(AcquisitionMode)
  acquisitionMode?: AcquisitionMode;

  @ApiProperty({ example: 25.99, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  purchasePrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  locationId?: string;
}

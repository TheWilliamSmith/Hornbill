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

export class UpdatePlantDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  speciesName?: string;

  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
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

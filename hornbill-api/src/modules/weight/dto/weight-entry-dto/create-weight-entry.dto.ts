import { WeightUnit } from 'src/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDate,
  IsEnum,
  IsPositive,
  Min,
  Max,
  IsString,
  Length,
} from 'class-validator';

export class CreateWeightEntryDto {
  @ApiProperty({
    description: 'Weight value in the specified unit',
    example: 75.5,
    minimum: 20,
    maximum: 500,
    type: Number,
  })
  @IsNotEmpty({ message: 'Weight is required' })
  @IsNumber({}, { message: 'Weight must be a number' })
  @IsPositive({ message: 'Weight must be a positive number' })
  @Min(20, { message: 'Weight must be at least 20' })
  @Max(500, { message: 'Weight must not exceed 500' })
  weight: number;

  @ApiProperty({
    description: 'Unit of measurement for the weight',
    example: 'KG',
    enum: WeightUnit,
    enumName: 'WeightUnit',
  })
  @IsNotEmpty({ message: 'Weight unit is required' })
  @IsEnum(WeightUnit, { message: 'Weight unit must be either KG or LBS' })
  unit: WeightUnit;

  @ApiProperty({
    description: 'Optional note about the weight measurement',
    example: 'Measured after morning workout',
    required: false,
    maxLength: 500,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  @Length(1, 500, { message: 'Note must be between 1 and 500 characters' })
  note?: string;

  @ApiProperty({
    description:
      'Date and time when the weight was measured (defaults to current time if not provided)',
    example: '2024-01-15T08:30:00.000Z',
    required: false,
    format: 'date-time',
    type: String,
  })
  @IsOptional()
  @IsDate({ message: 'Measured date must be a valid date' })
  @Type(() => Date)
  measuredAt?: Date;
}

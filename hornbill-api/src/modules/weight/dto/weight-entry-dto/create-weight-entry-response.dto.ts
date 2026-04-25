import { ApiProperty } from '@nestjs/swagger';
import { WeightUnit } from '@src/generated/prisma/enums';

export class CreateWeightEntryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the weight entry',
    example: 'clp1234567890abcdef',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Weight value in the specified unit',
    example: 75.5,
    type: Number,
  })
  weight: number;

  @ApiProperty({
    description: 'Unit of measurement for the weight',
    example: 'KG',
    enum: WeightUnit,
    enumName: 'WeightUnit',
  })
  unit: WeightUnit;

  @ApiProperty({
    description: 'Date and time when the weight was measured',
    example: '2024-01-15T08:30:00.000Z',
    format: 'date-time',
    type: String,
  })
  measuredAt: Date;

  @ApiProperty({
    description: 'Optional note about the weight measurement',
    example: 'Measured after morning workout',
    required: false,
    type: String,
  })
  note?: string;

  @ApiProperty({
    description: 'Date and time when the entry was created',
    example: '2024-01-15T08:30:00.000Z',
    format: 'date-time',
    type: String,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the entry was last updated',
    example: '2024-01-15T08:30:00.000Z',
    format: 'date-time',
    type: String,
  })
  updatedAt: Date;
}

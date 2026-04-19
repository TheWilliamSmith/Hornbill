import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class CreateSellExecutionDto {
  @ApiProperty({ description: 'Position ID to sell from' })
  @IsString()
  positionId: string;

  @ApiProperty({ description: 'Target ID linked to this sell (optional)', required: false })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiProperty({ description: 'Quantity sold' })
  @IsNumber()
  @Min(0.00000001)
  quantitySold: number;

  @ApiProperty({ description: 'Sell price per unit in EUR' })
  @IsNumber()
  @Min(0)
  sellPrice: number;

  @ApiProperty({ description: 'Fees paid for this sell', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fees?: number;

  @ApiProperty({ description: 'Date of the execution', required: false })
  @IsOptional()
  @IsDateString()
  executedAt?: string;
}

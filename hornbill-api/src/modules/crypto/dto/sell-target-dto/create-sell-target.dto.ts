import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateSellTargetDto {
  @ApiProperty({ description: 'Trigger gain percentage', example: 150 })
  @IsNotEmpty({ message: 'Trigger percent is required' })
  @IsNumber({}, { message: 'Trigger percent must be a number' })
  @IsPositive({ message: 'Trigger percent must be positive' })
  triggerPercent: number;

  @ApiProperty({ description: 'Percentage of position to sell', example: 15 })
  @IsNotEmpty({ message: 'Sell percent is required' })
  @IsNumber({}, { message: 'Sell percent must be a number' })
  @IsPositive({ message: 'Sell percent must be positive' })
  @Min(1, { message: 'Sell percent must be at least 1' })
  sellPercent: number;
}

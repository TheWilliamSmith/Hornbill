import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class UpdateSellTargetDto {
  @ApiProperty({ description: 'Trigger gain percentage', example: 50, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Trigger percent must be a number' })
  @IsPositive({ message: 'Trigger percent must be positive' })
  triggerPercent?: number;

  @ApiProperty({ description: 'Percentage of position to sell', example: 30, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Sell percent must be a number' })
  @IsPositive({ message: 'Sell percent must be positive' })
  @Min(1, { message: 'Sell percent must be at least 1' })
  sellPercent?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDate,
  IsString,
  IsPositive,
  Min,
  IsArray,
  ValidateNested,
  Length,
} from 'class-validator';

export class SellTargetInputDto {
  @ApiProperty({ description: 'Trigger gain percentage', example: 30 })
  @IsNotEmpty({ message: 'Trigger percent is required' })
  @IsNumber({}, { message: 'Trigger percent must be a number' })
  @IsPositive({ message: 'Trigger percent must be positive' })
  triggerPercent: number;

  @ApiProperty({ description: 'Percentage of position to sell', example: 20 })
  @IsNotEmpty({ message: 'Sell percent is required' })
  @IsNumber({}, { message: 'Sell percent must be a number' })
  @IsPositive({ message: 'Sell percent must be positive' })
  @Min(1, { message: 'Sell percent must be at least 1' })
  sellPercent: number;
}

export class CreateCryptoPositionDto {
  @ApiProperty({ description: 'Crypto symbol', example: 'BTC' })
  @IsNotEmpty({ message: 'Symbol is required' })
  @IsString({ message: 'Symbol must be a string' })
  @Length(1, 10, { message: 'Symbol must be between 1 and 10 characters' })
  symbol: string;

  @ApiProperty({ description: 'Exchange platform', example: 'kraken' })
  @IsNotEmpty({ message: 'Platform is required' })
  @IsString({ message: 'Platform must be a string' })
  @Length(1, 50, { message: 'Platform must be between 1 and 50 characters' })
  platform: string;

  @ApiProperty({ description: 'Unit buy price in euros', example: 95000.5 })
  @IsNotEmpty({ message: 'Buy price is required' })
  @IsNumber({}, { message: 'Buy price must be a number' })
  @IsPositive({ message: 'Buy price must be positive' })
  buyPrice: number;

  @ApiProperty({ description: 'Quantity purchased', example: 0.01 })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  quantity: number;

  @ApiProperty({ description: 'Fees in euros', example: 2.5, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Fees must be a number' })
  @Min(0, { message: 'Fees cannot be negative' })
  fees?: number;

  @ApiProperty({
    description: 'Date and time of purchase',
    example: '2025-01-15T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Purchase date is required' })
  @IsDate({ message: 'boughtAt must be a valid date' })
  @Type(() => Date)
  boughtAt: Date;

  @ApiProperty({
    description: 'Custom sell targets (defaults: +30%→20%, +60%→25%, +100%→25%)',
    required: false,
    type: [SellTargetInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SellTargetInputDto)
  sellTargets?: SellTargetInputDto[];
}

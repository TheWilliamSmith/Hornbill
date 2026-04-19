import { ApiProperty } from '@nestjs/swagger';
import { CryptoPositionStatus, SellTargetStatus } from '@src/generated/prisma/enums';

export class SellTargetResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 30 })
  triggerPercent: number;

  @ApiProperty({ example: 20 })
  sellPercent: number;

  @ApiProperty({ example: 123500.65 })
  targetPrice: number;

  @ApiProperty({ enum: SellTargetStatus, example: 'PENDING' })
  status: SellTargetStatus;

  @ApiProperty({ required: false })
  triggeredAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class CreatePositionResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'BTC' })
  symbol: string;

  @ApiProperty({ example: 'kraken' })
  platform: string;

  @ApiProperty({ example: 95000.5 })
  buyPrice: number;

  @ApiProperty({ example: 0.01 })
  quantity: number;

  @ApiProperty({ example: 2.5 })
  fees: number;

  @ApiProperty({ description: 'Effective cost per unit (price + fees/quantity)', example: 95250.5 })
  costBasis: number;

  @ApiProperty({ example: '2025-01-15T10:00:00.000Z' })
  boughtAt: Date;

  @ApiProperty({ enum: CryptoPositionStatus, example: 'OPEN' })
  status: CryptoPositionStatus;

  @ApiProperty({ type: [SellTargetResponseDto] })
  sellTargets: SellTargetResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

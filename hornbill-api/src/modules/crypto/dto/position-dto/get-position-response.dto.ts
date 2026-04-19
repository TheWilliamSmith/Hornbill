import { ApiProperty } from '@nestjs/swagger';
import { CryptoPositionStatus, SellTargetStatus } from 'src/generated/prisma/enums';

export class SellTargetListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  triggerPercent: number;

  @ApiProperty()
  sellPercent: number;

  @ApiProperty()
  targetPrice: number;

  @ApiProperty({ enum: SellTargetStatus })
  status: SellTargetStatus;

  @ApiProperty({ required: false })
  triggeredAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class GetPositionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  platform: string;

  @ApiProperty()
  buyPrice: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  fees: number;

  @ApiProperty()
  costBasis: number;

  @ApiProperty()
  boughtAt: Date;

  @ApiProperty({ enum: CryptoPositionStatus })
  status: CryptoPositionStatus;

  @ApiProperty({ type: [SellTargetListItemDto] })
  sellTargets: SellTargetListItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

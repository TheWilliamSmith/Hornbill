import { ApiProperty } from '@nestjs/swagger';

export class SellExecutionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  positionId: string;

  @ApiProperty({ required: false })
  targetId?: string;

  @ApiProperty()
  quantitySold: number;

  @ApiProperty()
  sellPrice: number;

  @ApiProperty()
  fees: number;

  @ApiProperty()
  realizedPnl: number;

  @ApiProperty()
  executedAt: Date;

  @ApiProperty()
  createdAt: Date;
}

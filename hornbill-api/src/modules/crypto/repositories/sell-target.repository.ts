import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { SellTarget } from '../entities/crypto.entity';
import { SellTargetStatus } from '@src/generated/prisma/enums';

@Injectable()
export class SellTargetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createForPosition(
    positionId: string,
    triggerPercent: number,
    sellPercent: number,
    targetPrice: number,
  ): Promise<SellTarget> {
    return this.prisma.sellTarget.create({
      data: {
        positionId,
        triggerPercent,
        sellPercent,
        targetPrice,
      },
    });
  }

  async findById(id: string): Promise<SellTarget | null> {
    return this.prisma.sellTarget.findUnique({
      where: { id },
    });
  }

  async findByPositionId(positionId: string): Promise<SellTarget[]> {
    return this.prisma.sellTarget.findMany({
      where: { positionId },
      orderBy: { triggerPercent: 'asc' },
    });
  }

  async update(
    id: string,
    data: { triggerPercent?: number; sellPercent?: number; targetPrice?: number },
  ): Promise<SellTarget> {
    return this.prisma.sellTarget.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sellTarget.delete({
      where: { id },
    });
  }
}

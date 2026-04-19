import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { SellExecution } from '../entities/crypto.entity';

@Injectable()
export class SellExecutionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    positionId: string;
    targetId?: string;
    quantitySold: number;
    sellPrice: number;
    fees: number;
    realizedPnl: number;
    executedAt: Date;
  }): Promise<SellExecution> {
    return this.prisma.sellExecution.create({
      data: {
        positionId: data.positionId,
        targetId: data.targetId ?? null,
        quantitySold: data.quantitySold,
        sellPrice: data.sellPrice,
        fees: data.fees,
        realizedPnl: data.realizedPnl,
        executedAt: data.executedAt,
      },
    });
  }

  async findByPositionId(positionId: string): Promise<SellExecution[]> {
    return this.prisma.sellExecution.findMany({
      where: { positionId },
      orderBy: { executedAt: 'desc' },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<SellExecution | null> {
    return this.prisma.sellExecution.findFirst({
      where: {
        id,
        position: { userId },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sellExecution.delete({ where: { id } });
  }

  async sumQuantitySoldByPositionId(positionId: string): Promise<number> {
    const result = await this.prisma.sellExecution.aggregate({
      where: { positionId },
      _sum: { quantitySold: true },
    });
    return result._sum.quantitySold ?? 0;
  }
}

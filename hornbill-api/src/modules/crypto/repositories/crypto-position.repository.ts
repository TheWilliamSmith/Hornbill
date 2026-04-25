import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { CreateCryptoPositionData, CreateSellTargetData } from '../interfaces/crypto.interface';
import { CryptoPositionFull } from '../entities/crypto.entity';

@Injectable()
export class CryptoPositionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    sellTargets: { orderBy: { triggerPercent: 'asc' as const } },
    sellExecutions: { orderBy: { executedAt: 'desc' as const } },
  };

  async createPositionWithTargets(
    data: CreateCryptoPositionData,
    targets: CreateSellTargetData[],
    userId: string,
  ): Promise<CryptoPositionFull> {
    return this.prisma.cryptoPosition.create({
      data: {
        userId,
        symbol: data.symbol.toUpperCase(),
        platform: data.platform.toLowerCase(),
        buyPrice: data.buyPrice,
        quantity: data.quantity,
        fees: data.fees,
        costBasis: data.costBasis,
        boughtAt: data.boughtAt,
        sellTargets: {
          create: targets.map((t) => ({
            triggerPercent: t.triggerPercent,
            sellPercent: t.sellPercent,
            targetPrice: t.targetPrice,
          })),
        },
      },
      include: this.defaultInclude,
    });
  }

  async findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<CryptoPositionFull[]> {
    return this.prisma.cryptoPosition.findMany({
      where: { userId },
      include: this.defaultInclude,
      orderBy: { boughtAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.cryptoPosition.count({
      where: { userId },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<CryptoPositionFull | null> {
    return this.prisma.cryptoPosition.findFirst({
      where: { id, userId },
      include: this.defaultInclude,
    });
  }

  async deletePosition(id: string, userId: string): Promise<void> {
    const result = await this.prisma.cryptoPosition.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) {
      throw new Error('Position not found or user unauthorized');
    }
  }
}

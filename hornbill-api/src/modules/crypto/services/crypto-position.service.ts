import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCryptoPositionDto } from '../dto/position-dto/create-position.dto';
import { GetPositionsQueryDto } from '../dto/position-dto/get-positions-query.dto';
import { CryptoPositionRepository } from '../repositories/crypto-position.repository';
import { CryptoPositionMapper } from '../mappers/crypto-position.mapper';
import { PaginationMapper } from 'src/common/mappers/pagination.mapper';
import { DEFAULT_SELL_TARGETS, CreateSellTargetData } from '../interfaces/crypto.interface';

@Injectable()
export class CryptoPositionService {
  constructor(private readonly repo: CryptoPositionRepository) {}

  async createPosition(dto: CreateCryptoPositionDto, userId: string) {
    const fees = dto.fees ?? 0;
    const costBasis = dto.buyPrice + fees / dto.quantity;

    const targetDefinitions = dto.sellTargets?.length ? dto.sellTargets : DEFAULT_SELL_TARGETS;

    const targets: CreateSellTargetData[] = targetDefinitions.map((t) => ({
      positionId: '', // will be set by Prisma nested create
      triggerPercent: t.triggerPercent,
      sellPercent: t.sellPercent,
      targetPrice: parseFloat((costBasis * (1 + t.triggerPercent / 100)).toFixed(2)),
    }));

    const position = await this.repo.createPositionWithTargets(
      {
        symbol: dto.symbol,
        platform: dto.platform,
        buyPrice: dto.buyPrice,
        quantity: dto.quantity,
        fees,
        costBasis: parseFloat(costBasis.toFixed(2)),
        boughtAt: dto.boughtAt,
      },
      targets,
      userId,
    );

    return CryptoPositionMapper.toCreateResponse(position);
  }

  async getPositions(userId: string, { page, limit }: GetPositionsQueryDto) {
    const [positions, total] = await Promise.all([
      this.repo.findManyByUserId(userId, page, limit),
      this.repo.countByUserId(userId),
    ]);

    const mapped = positions.map(CryptoPositionMapper.toGetResponse);
    return PaginationMapper.toPaginatedResponse(mapped, total, page, limit);
  }

  async getPosition(id: string, userId: string) {
    const position = await this.repo.findByIdAndUserId(id, userId);

    if (!position) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    return CryptoPositionMapper.toGetResponse(position);
  }

  async deletePosition(id: string, userId: string) {
    const position = await this.repo.findByIdAndUserId(id, userId);

    if (!position) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    await this.repo.deletePosition(id, userId);
  }
}

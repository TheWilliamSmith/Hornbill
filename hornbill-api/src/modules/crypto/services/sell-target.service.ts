import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SellTargetRepository } from '../repositories/sell-target.repository';
import { CryptoPositionRepository } from '../repositories/crypto-position.repository';
import { CreateSellTargetDto } from '../dto/sell-target-dto/create-sell-target.dto';
import { UpdateSellTargetDto } from '../dto/sell-target-dto/update-sell-target.dto';
import { SellTargetStatus } from '@src/generated/prisma/enums';

@Injectable()
export class SellTargetService {
  constructor(
    private readonly repo: SellTargetRepository,
    private readonly positionRepo: CryptoPositionRepository,
  ) {}

  async addTarget(positionId: string, dto: CreateSellTargetDto, userId: string) {
    const position = await this.positionRepo.findByIdAndUserId(positionId, userId);

    if (!position) {
      throw new NotFoundException(`Position with id ${positionId} not found`);
    }

    const targetPrice = parseFloat(
      (position.costBasis * (1 + dto.triggerPercent / 100)).toFixed(2),
    );

    return this.repo.createForPosition(
      positionId,
      dto.triggerPercent,
      dto.sellPercent,
      targetPrice,
    );
  }

  async updateTarget(targetId: string, dto: UpdateSellTargetDto, userId: string) {
    const target = await this.repo.findById(targetId);

    if (!target) {
      throw new NotFoundException(`Sell target with id ${targetId} not found`);
    }

    const position = await this.positionRepo.findByIdAndUserId(target.positionId, userId);

    if (!position) {
      throw new NotFoundException(`Position not found`);
    }

    if (target.status !== SellTargetStatus.PENDING) {
      throw new BadRequestException('Cannot update a target that is not PENDING');
    }

    const triggerPercent = dto.triggerPercent ?? target.triggerPercent;
    const targetPrice = parseFloat((position.costBasis * (1 + triggerPercent / 100)).toFixed(2));

    return this.repo.update(targetId, {
      triggerPercent: dto.triggerPercent,
      sellPercent: dto.sellPercent,
      targetPrice,
    });
  }

  async deleteTarget(targetId: string, userId: string) {
    const target = await this.repo.findById(targetId);

    if (!target) {
      throw new NotFoundException(`Sell target with id ${targetId} not found`);
    }

    const position = await this.positionRepo.findByIdAndUserId(target.positionId, userId);

    if (!position) {
      throw new NotFoundException(`Position not found`);
    }

    if (target.status !== SellTargetStatus.PENDING) {
      throw new BadRequestException('Cannot delete a target that is not PENDING');
    }

    await this.repo.delete(targetId);
  }
}

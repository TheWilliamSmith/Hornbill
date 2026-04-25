import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SellExecutionRepository } from '../repositories/sell-execution.repository';
import { CryptoPositionRepository } from '../repositories/crypto-position.repository';
import { SellTargetRepository } from '../repositories/sell-target.repository';
import { CreateSellExecutionDto } from '../dto/execution-dto/create-execution.dto';
import { SellExecutionResponseDto } from '../dto/execution-dto/execution-response.dto';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class SellExecutionService {
  constructor(
    private readonly executionRepo: SellExecutionRepository,
    private readonly positionRepo: CryptoPositionRepository,
    private readonly targetRepo: SellTargetRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createExecution(
    dto: CreateSellExecutionDto,
    userId: string,
  ): Promise<SellExecutionResponseDto> {
    // 1. Validate position belongs to user
    const position = await this.positionRepo.findByIdAndUserId(dto.positionId, userId);
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    if (position.status === 'CLOSED') {
      throw new BadRequestException('Position is already closed');
    }

    // 2. If target is specified, validate it belongs to this position
    if (dto.targetId) {
      const target = await this.targetRepo.findById(dto.targetId);
      if (!target || target.positionId !== position.id) {
        throw new BadRequestException('Target does not belong to this position');
      }
      if (target.status === 'EXECUTED') {
        throw new BadRequestException('Target is already executed');
      }
    }

    // 3. Check remaining quantity
    const totalSold = await this.executionRepo.sumQuantitySoldByPositionId(position.id);
    const remainingQty = position.quantity - totalSold;

    if (dto.quantitySold > remainingQty + 0.00000001) {
      throw new BadRequestException(
        `Cannot sell ${dto.quantitySold} — only ${remainingQty} remaining`,
      );
    }

    // 4. Calculate realized P&L: (sellPrice - costBasisPerUnit) * qty - fees
    const costBasisPerUnit = position.costBasis / position.quantity;
    const fees = dto.fees ?? 0;
    const realizedPnl = (dto.sellPrice - costBasisPerUnit) * dto.quantitySold - fees;

    // 5. Create execution + update position + mark target as EXECUTED in a transaction
    const newTotalSold = totalSold + dto.quantitySold;
    const allSold = newTotalSold >= position.quantity - 0.00000001;
    const newStatus = allSold ? 'CLOSED' : 'PARTIALLY_SOLD';

    const execution = await this.prisma.$transaction(async (tx) => {
      // Create the execution record
      const exec = await tx.sellExecution.create({
        data: {
          positionId: position.id,
          targetId: dto.targetId ?? null,
          quantitySold: dto.quantitySold,
          sellPrice: dto.sellPrice,
          fees,
          realizedPnl: Math.round(realizedPnl * 100) / 100,
          executedAt: dto.executedAt ? new Date(dto.executedAt) : new Date(),
        },
      });

      // Update position status
      await tx.cryptoPosition.update({
        where: { id: position.id },
        data: { status: newStatus },
      });

      // Mark the target as EXECUTED if linked
      if (dto.targetId) {
        await tx.sellTarget.update({
          where: { id: dto.targetId },
          data: { status: 'EXECUTED' },
        });
      }

      return exec;
    });

    return this.toResponse(execution);
  }

  async getExecutions(positionId: string, userId: string): Promise<SellExecutionResponseDto[]> {
    const position = await this.positionRepo.findByIdAndUserId(positionId, userId);
    if (!position) {
      throw new NotFoundException('Position not found');
    }

    const executions = await this.executionRepo.findByPositionId(positionId);
    return executions.map((e) => this.toResponse(e));
  }

  async deleteExecution(executionId: string, userId: string): Promise<void> {
    const execution = await this.executionRepo.findByIdAndUserId(executionId, userId);
    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    // Re-open the target if it was linked
    if (execution.targetId) {
      await this.prisma.sellTarget.update({
        where: { id: execution.targetId },
        data: { status: 'TRIGGERED' },
      });
    }

    // Delete the execution
    await this.executionRepo.delete(executionId);

    // Recalculate position status
    const remaining = await this.executionRepo.sumQuantitySoldByPositionId(execution.positionId);
    const position = await this.positionRepo.findByIdAndUserId(execution.positionId, userId);
    if (position) {
      const newStatus = remaining <= 0.00000001 ? 'OPEN' : 'PARTIALLY_SOLD';
      await this.prisma.cryptoPosition.update({
        where: { id: position.id },
        data: { status: newStatus },
      });
    }
  }

  private toResponse(execution: any): SellExecutionResponseDto {
    const dto = new SellExecutionResponseDto();
    dto.id = execution.id;
    dto.positionId = execution.positionId;
    dto.targetId = execution.targetId ?? undefined;
    dto.quantitySold = execution.quantitySold;
    dto.sellPrice = execution.sellPrice;
    dto.fees = execution.fees;
    dto.realizedPnl = execution.realizedPnl;
    dto.executedAt = execution.executedAt;
    dto.createdAt = execution.createdAt;
    return dto;
  }
}

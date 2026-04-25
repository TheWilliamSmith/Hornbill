import { CryptoPositionFull, SellExecution } from '../entities/crypto.entity';
import {
  CreatePositionResponseDto,
  SellTargetResponseDto,
} from '../dto/position-dto/create-position-response.dto';
import {
  GetPositionResponseDto,
  SellTargetListItemDto,
  SellExecutionListItemDto,
} from '../dto/position-dto/get-position-response.dto';
import { SellTarget } from '../entities/crypto.entity';

export class CryptoPositionMapper {
  private static mapTarget(target: SellTarget): SellTargetResponseDto {
    const dto = new SellTargetResponseDto();
    dto.id = target.id;
    dto.triggerPercent = target.triggerPercent;
    dto.sellPercent = target.sellPercent;
    dto.targetPrice = target.targetPrice;
    dto.status = target.status;
    dto.triggeredAt = target.triggeredAt ?? undefined;
    dto.createdAt = target.createdAt;
    return dto;
  }

  private static mapTargetListItem(target: SellTarget): SellTargetListItemDto {
    const dto = new SellTargetListItemDto();
    dto.id = target.id;
    dto.triggerPercent = target.triggerPercent;
    dto.sellPercent = target.sellPercent;
    dto.targetPrice = target.targetPrice;
    dto.status = target.status;
    dto.triggeredAt = target.triggeredAt ?? undefined;
    dto.createdAt = target.createdAt;
    return dto;
  }

  private static mapExecution(exec: SellExecution): SellExecutionListItemDto {
    const dto = new SellExecutionListItemDto();
    dto.id = exec.id;
    dto.targetId = exec.targetId ?? undefined;
    dto.quantitySold = exec.quantitySold;
    dto.sellPrice = exec.sellPrice;
    dto.fees = exec.fees;
    dto.realizedPnl = exec.realizedPnl;
    dto.executedAt = exec.executedAt;
    return dto;
  }

  static toCreateResponse(position: CryptoPositionFull): CreatePositionResponseDto {
    const dto = new CreatePositionResponseDto();
    dto.id = position.id;
    dto.symbol = position.symbol;
    dto.platform = position.platform;
    dto.buyPrice = position.buyPrice;
    dto.quantity = position.quantity;
    dto.fees = position.fees;
    dto.costBasis = position.costBasis;
    dto.boughtAt = position.boughtAt;
    dto.status = position.status;
    dto.sellTargets = position.sellTargets.map(CryptoPositionMapper.mapTarget);
    dto.sellExecutions = position.sellExecutions.map(CryptoPositionMapper.mapExecution);
    dto.createdAt = position.createdAt;
    dto.updatedAt = position.updatedAt;
    return dto;
  }

  static toGetResponse(position: CryptoPositionFull): GetPositionResponseDto {
    const dto = new GetPositionResponseDto();
    dto.id = position.id;
    dto.symbol = position.symbol;
    dto.platform = position.platform;
    dto.buyPrice = position.buyPrice;
    dto.quantity = position.quantity;
    dto.fees = position.fees;
    dto.costBasis = position.costBasis;
    dto.boughtAt = position.boughtAt;
    dto.status = position.status;
    dto.sellTargets = position.sellTargets.map(CryptoPositionMapper.mapTargetListItem);
    dto.sellExecutions = position.sellExecutions.map(CryptoPositionMapper.mapExecution);
    dto.createdAt = position.createdAt;
    dto.updatedAt = position.updatedAt;
    return dto;
  }
}

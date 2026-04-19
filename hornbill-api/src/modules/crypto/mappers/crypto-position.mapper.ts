import { CryptoPositionWithTargets } from '../entities/crypto.entity';
import {
  CreatePositionResponseDto,
  SellTargetResponseDto,
} from '../dto/position-dto/create-position-response.dto';
import {
  GetPositionResponseDto,
  SellTargetListItemDto,
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

  static toCreateResponse(position: CryptoPositionWithTargets): CreatePositionResponseDto {
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
    dto.createdAt = position.createdAt;
    dto.updatedAt = position.updatedAt;
    return dto;
  }

  static toGetResponse(position: CryptoPositionWithTargets): GetPositionResponseDto {
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
    dto.createdAt = position.createdAt;
    dto.updatedAt = position.updatedAt;
    return dto;
  }
}

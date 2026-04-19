import { CryptoPositionStatus, SellTargetStatus } from 'src/generated/prisma/enums';

export interface CryptoPosition {
  id: string;
  userId: string;
  symbol: string;
  platform: string;
  buyPrice: number;
  quantity: number;
  fees: number;
  costBasis: number;
  boughtAt: Date;
  status: CryptoPositionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellTarget {
  id: string;
  positionId: string;
  triggerPercent: number;
  sellPercent: number;
  targetPrice: number;
  status: SellTargetStatus;
  triggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellExecution {
  id: string;
  positionId: string;
  targetId: string | null;
  quantitySold: number;
  sellPrice: number;
  fees: number;
  realizedPnl: number;
  executedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CryptoPositionWithTargets extends CryptoPosition {
  sellTargets: SellTarget[];
}

export interface CryptoPositionFull extends CryptoPositionWithTargets {
  sellExecutions: SellExecution[];
}

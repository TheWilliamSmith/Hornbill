export enum CryptoPositionStatus {
  OPEN = "OPEN",
  PARTIALLY_SOLD = "PARTIALLY_SOLD",
  CLOSED = "CLOSED",
}

export enum SellTargetStatus {
  PENDING = "PENDING",
  TRIGGERED = "TRIGGERED",
  EXECUTED = "EXECUTED",
}

export interface SellTarget {
  id: string;
  positionId: string;
  triggerPercent: number;
  sellPercent: number;
  targetPrice: number;
  status: SellTargetStatus;
  triggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellExecution {
  id: string;
  positionId: string;
  targetId?: string;
  quantitySold: number;
  sellPrice: number;
  fees: number;
  realizedPnl: number;
  executedAt: string;
  createdAt: string;
}

export interface CryptoPosition {
  id: string;
  symbol: string;
  platform: string;
  buyPrice: number;
  quantity: number;
  fees: number;
  costBasis: number;
  boughtAt: string;
  status: CryptoPositionStatus;
  sellTargets: SellTarget[];
  sellExecutions?: SellExecution[];
  createdAt: string;
  updatedAt: string;
}

export interface CryptoDashboard {
  totalInvested: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  openPositions: number;
  nextTarget: {
    symbol: string;
    triggerPercent: number;
    targetPrice: number;
    currentPrice: number;
    distancePercent: number;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateCryptoPositionRequest {
  symbol: string;
  platform: string;
  buyPrice: number;
  quantity: number;
  fees?: number;
  boughtAt: string;
  sellTargets?: { triggerPercent: number; sellPercent: number }[];
}

export interface CreateSellTargetRequest {
  triggerPercent: number;
  sellPercent: number;
}

export interface UpdateSellTargetRequest {
  triggerPercent?: number;
  sellPercent?: number;
}

export interface CreateSellExecutionRequest {
  positionId: string;
  targetId?: string;
  quantitySold: number;
  sellPrice: number;
  fees?: number;
  executedAt?: string;
}

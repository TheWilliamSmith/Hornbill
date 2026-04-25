export interface CreateCryptoPositionData {
  symbol: string;
  platform: string;
  buyPrice: number;
  quantity: number;
  fees: number;
  costBasis: number;
  boughtAt: Date;
}

export interface CreateSellTargetData {
  positionId: string;
  triggerPercent: number;
  sellPercent: number;
  targetPrice: number;
}

export interface UpdateSellTargetData {
  triggerPercent?: number;
  sellPercent?: number;
  targetPrice?: number;
}

export const DEFAULT_SELL_TARGETS = [
  { triggerPercent: 30, sellPercent: 20 },
  { triggerPercent: 60, sellPercent: 25 },
  { triggerPercent: 100, sellPercent: 25 },
];

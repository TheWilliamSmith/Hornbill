import {
  CryptoPosition,
  CryptoPositionStatus,
  SellTargetStatus,
  CryptoDashboard,
} from "@/types/crypto.type";

// Current mock prices
export const MOCK_PRICES: Record<string, number> = {
  BTC: 101_250.0,
  ETH: 3_820.5,
  SOL: 187.4,
  POL: 0.62,
  LINK: 18.75,
};

export const MOCK_POSITIONS: CryptoPosition[] = [
  {
    id: "pos-1",
    symbol: "BTC",
    platform: "kraken",
    buyPrice: 85_000,
    quantity: 0.025,
    fees: 5.5,
    costBasis: 85_220,
    boughtAt: "2026-01-12T09:30:00.000Z",
    status: CryptoPositionStatus.OPEN,
    sellTargets: [
      {
        id: "st-1a",
        positionId: "pos-1",
        triggerPercent: 30,
        sellPercent: 20,
        targetPrice: 110_786,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-01-12T09:30:00.000Z",
        updatedAt: "2026-01-12T09:30:00.000Z",
      },
      {
        id: "st-1b",
        positionId: "pos-1",
        triggerPercent: 60,
        sellPercent: 25,
        targetPrice: 136_352,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-01-12T09:30:00.000Z",
        updatedAt: "2026-01-12T09:30:00.000Z",
      },
      {
        id: "st-1c",
        positionId: "pos-1",
        triggerPercent: 100,
        sellPercent: 25,
        targetPrice: 170_440,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-01-12T09:30:00.000Z",
        updatedAt: "2026-01-12T09:30:00.000Z",
      },
    ],
    sellExecutions: [],
    createdAt: "2026-01-12T09:30:00.000Z",
    updatedAt: "2026-01-12T09:30:00.000Z",
  },
  {
    id: "pos-2",
    symbol: "ETH",
    platform: "binance",
    buyPrice: 3_200,
    quantity: 1.5,
    fees: 3.2,
    costBasis: 3_202.13,
    boughtAt: "2026-02-05T14:15:00.000Z",
    status: CryptoPositionStatus.PARTIALLY_SOLD,
    sellTargets: [
      {
        id: "st-2a",
        positionId: "pos-2",
        triggerPercent: 30,
        sellPercent: 20,
        targetPrice: 4_162.77,
        status: SellTargetStatus.TRIGGERED,
        triggeredAt: "2026-03-20T11:00:00.000Z",
        createdAt: "2026-02-05T14:15:00.000Z",
        updatedAt: "2026-03-20T11:00:00.000Z",
      },
      {
        id: "st-2b",
        positionId: "pos-2",
        triggerPercent: 60,
        sellPercent: 25,
        targetPrice: 5_123.41,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-02-05T14:15:00.000Z",
        updatedAt: "2026-02-05T14:15:00.000Z",
      },
      {
        id: "st-2c",
        positionId: "pos-2",
        triggerPercent: 100,
        sellPercent: 25,
        targetPrice: 6_404.26,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-02-05T14:15:00.000Z",
        updatedAt: "2026-02-05T14:15:00.000Z",
      },
    ],
    sellExecutions: [
      {
        id: "exec-1",
        positionId: "pos-2",
        targetId: "st-2a",
        quantitySold: 0.3,
        sellPrice: 4_180.0,
        fees: 1.5,
        realizedPnl: 291.86,
        executedAt: "2026-03-21T08:45:00.000Z",
        createdAt: "2026-03-21T08:45:00.000Z",
      },
    ],
    createdAt: "2026-02-05T14:15:00.000Z",
    updatedAt: "2026-03-21T08:45:00.000Z",
  },
  {
    id: "pos-3",
    symbol: "SOL",
    platform: "kraken",
    buyPrice: 145.0,
    quantity: 15,
    fees: 2.0,
    costBasis: 145.13,
    boughtAt: "2026-03-01T16:00:00.000Z",
    status: CryptoPositionStatus.OPEN,
    sellTargets: [
      {
        id: "st-3a",
        positionId: "pos-3",
        triggerPercent: 30,
        sellPercent: 20,
        targetPrice: 188.67,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-03-01T16:00:00.000Z",
        updatedAt: "2026-03-01T16:00:00.000Z",
      },
      {
        id: "st-3b",
        positionId: "pos-3",
        triggerPercent: 60,
        sellPercent: 25,
        targetPrice: 232.21,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-03-01T16:00:00.000Z",
        updatedAt: "2026-03-01T16:00:00.000Z",
      },
      {
        id: "st-3c",
        positionId: "pos-3",
        triggerPercent: 100,
        sellPercent: 25,
        targetPrice: 290.26,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-03-01T16:00:00.000Z",
        updatedAt: "2026-03-01T16:00:00.000Z",
      },
    ],
    sellExecutions: [],
    createdAt: "2026-03-01T16:00:00.000Z",
    updatedAt: "2026-03-01T16:00:00.000Z",
  },
  {
    id: "pos-4",
    symbol: "POL",
    platform: "binance",
    buyPrice: 0.45,
    quantity: 5000,
    fees: 1.5,
    costBasis: 0.4503,
    boughtAt: "2026-02-20T10:30:00.000Z",
    status: CryptoPositionStatus.OPEN,
    sellTargets: [
      {
        id: "st-4a",
        positionId: "pos-4",
        triggerPercent: 30,
        sellPercent: 20,
        targetPrice: 0.5854,
        status: SellTargetStatus.TRIGGERED,
        triggeredAt: "2026-04-10T09:00:00.000Z",
        createdAt: "2026-02-20T10:30:00.000Z",
        updatedAt: "2026-04-10T09:00:00.000Z",
      },
      {
        id: "st-4b",
        positionId: "pos-4",
        triggerPercent: 60,
        sellPercent: 25,
        targetPrice: 0.7205,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-02-20T10:30:00.000Z",
        updatedAt: "2026-02-20T10:30:00.000Z",
      },
      {
        id: "st-4c",
        positionId: "pos-4",
        triggerPercent: 100,
        sellPercent: 25,
        targetPrice: 0.9006,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-02-20T10:30:00.000Z",
        updatedAt: "2026-02-20T10:30:00.000Z",
      },
    ],
    sellExecutions: [],
    createdAt: "2026-02-20T10:30:00.000Z",
    updatedAt: "2026-02-20T10:30:00.000Z",
  },
  {
    id: "pos-5",
    symbol: "LINK",
    platform: "kraken",
    buyPrice: 15.2,
    quantity: 50,
    fees: 1.0,
    costBasis: 15.22,
    boughtAt: "2026-03-15T12:00:00.000Z",
    status: CryptoPositionStatus.OPEN,
    sellTargets: [
      {
        id: "st-5a",
        positionId: "pos-5",
        triggerPercent: 30,
        sellPercent: 20,
        targetPrice: 19.79,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-03-15T12:00:00.000Z",
        updatedAt: "2026-03-15T12:00:00.000Z",
      },
      {
        id: "st-5b",
        positionId: "pos-5",
        triggerPercent: 60,
        sellPercent: 25,
        targetPrice: 24.35,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-03-15T12:00:00.000Z",
        updatedAt: "2026-03-15T12:00:00.000Z",
      },
      {
        id: "st-5c",
        positionId: "pos-5",
        triggerPercent: 100,
        sellPercent: 25,
        targetPrice: 30.44,
        status: SellTargetStatus.PENDING,
        createdAt: "2026-03-15T12:00:00.000Z",
        updatedAt: "2026-03-15T12:00:00.000Z",
      },
    ],
    sellExecutions: [],
    createdAt: "2026-03-15T12:00:00.000Z",
    updatedAt: "2026-03-15T12:00:00.000Z",
  },
];

export function computeDashboard(
  positions: CryptoPosition[],
  prices: Record<string, number>,
): CryptoDashboard {
  let totalInvested = 0;
  let currentValue = 0;
  let openPositions = 0;

  interface NextTargetCandidate {
    symbol: string;
    triggerPercent: number;
    targetPrice: number;
    currentPrice: number;
    distancePercent: number;
  }

  let nextTarget: NextTargetCandidate | null = null;

  for (const pos of positions) {
    if (pos.status === CryptoPositionStatus.CLOSED) continue;

    const soldQty = (pos.sellExecutions ?? []).reduce(
      (sum, e) => sum + e.quantitySold,
      0,
    );
    const remainingQty = pos.quantity - soldQty;

    totalInvested += pos.costBasis * remainingQty;
    const price = prices[pos.symbol] ?? 0;
    currentValue += price * remainingQty;
    openPositions++;

    for (const t of pos.sellTargets) {
      if (t.status !== SellTargetStatus.PENDING) continue;
      const distance = ((t.targetPrice - price) / price) * 100;
      if (
        distance > 0 &&
        (!nextTarget || distance < nextTarget.distancePercent)
      ) {
        nextTarget = {
          symbol: pos.symbol,
          triggerPercent: t.triggerPercent,
          targetPrice: t.targetPrice,
          currentPrice: price,
          distancePercent: parseFloat(distance.toFixed(2)),
        };
      }
    }
  }

  const totalPnl = currentValue - totalInvested;
  const totalPnlPercent =
    totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return {
    totalInvested: parseFloat(totalInvested.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    totalPnl: parseFloat(totalPnl.toFixed(2)),
    totalPnlPercent: parseFloat(totalPnlPercent.toFixed(2)),
    openPositions,
    nextTarget,
  };
}

export const MOCK_DASHBOARD = computeDashboard(MOCK_POSITIONS, MOCK_PRICES);

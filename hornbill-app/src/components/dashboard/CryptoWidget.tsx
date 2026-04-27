"use client";

import { useEffect, useCallback } from "react";
import { Bitcoin, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useCryptoPositions, usePrices } from "@/hooks/use-crypto";
import { computeDashboard } from "@/lib/mock-crypto";
import { CryptoPositionStatus } from "@/types/crypto.type";

export default function CryptoWidget() {
  const { positions, fetchPositions, isLoading } = useCryptoPositions();
  const { prices, fetchPrices, isLoading: pricesLoading } = usePrices();

  const loadData = useCallback(async () => {
    await Promise.all([fetchPositions({ limit: 100 }), fetchPrices()]);
  }, [fetchPositions, fetchPrices]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loading = isLoading || pricesLoading;
  const dashboard = computeDashboard(positions, prices);
  const openPositions = positions.filter(
    (p) => p.status !== CryptoPositionStatus.CLOSED,
  );
  const pnlPositive = dashboard.totalPnl >= 0;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bitcoin className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-sm text-zinc-900">
            Crypto Portfolio
          </span>
        </div>
        <Link
          href="/dashboard/crypto"
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-zinc-100 rounded animate-pulse" />
          ))}
        </div>
      ) : openPositions.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-4">
          Aucune position ouverte
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-xs text-zinc-400 mb-0.5">Valeur actuelle</p>
              <p className="font-semibold text-zinc-900 text-sm">
                ${dashboard.currentValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-xs text-zinc-400 mb-0.5">PnL total</p>
              <div className="flex items-center gap-1">
                {pnlPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <p
                  className={`font-semibold text-sm ${pnlPositive ? "text-emerald-600" : "text-red-500"}`}
                >
                  {pnlPositive ? "+" : ""}
                  {dashboard.totalPnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {openPositions.slice(0, 4).map((pos) => {
              const currentPrice = prices[pos.symbol] ?? 0;
              const soldQty = (pos.sellExecutions ?? []).reduce(
                (sum, e) => sum + e.quantitySold,
                0,
              );
              const qty = pos.quantity - soldQty;
              const current = currentPrice * qty;
              const invested = pos.costBasis * qty;
              const pnl = current - invested;
              const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
              const positive = pnl >= 0;

              return (
                <div
                  key={pos.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-700 font-medium">{pos.symbol}</span>
                  <span
                    className={`text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {positive ? "+" : ""}
                    {pnlPct.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-1 border-t border-zinc-100 text-xs text-zinc-400">
            {openPositions.length} position{openPositions.length > 1 ? "s" : ""} ouvertes · investi{" "}
            ${dashboard.totalInvested.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
        </>
      )}
    </div>
  );
}

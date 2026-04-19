"use client";

import { RefreshCw } from "lucide-react";

interface LivePricesProps {
  prices: Record<string, number>;
  lastFetchTime: string | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

function formatEur(value: number) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

function formatTimeAgo(isoDate: string | null): string {
  if (!isoDate) return "Jamais";

  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "À l'instant";
  if (diffSec < 60) return `Il y a ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  const diffHour = Math.floor(diffMin / 60);
  return `Il y a ${diffHour}h`;
}

export default function LivePrices({
  prices,
  lastFetchTime,
  onRefresh,
  isRefreshing = false,
}: LivePricesProps) {
  const sortedPrices = Object.entries(prices).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-black tracking-tight">
          Prix en direct
        </h3>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg hover:bg-black/5 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rafraîchir les prix"
        >
          <RefreshCw
            size={14}
            className={`text-black/40 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {sortedPrices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-black/40">Aucun prix disponible</p>
          <button
            onClick={onRefresh}
            className="mt-3 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-black/90 transition-all cursor-pointer"
          >
            Charger les prix
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedPrices.map(([symbol, price]) => (
            <div
              key={symbol}
              className="flex items-center justify-between py-2 border-b border-black/[0.04] last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-black/[0.04] flex items-center justify-center text-[10px] font-bold text-black/70">
                  {symbol.slice(0, 2)}
                </div>
                <span className="text-sm font-medium text-black">{symbol}</span>
              </div>
              <span className="text-sm font-semibold text-black">
                {formatEur(price)}€
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-black/[0.04]">
        <p className="text-[10px] text-black/30 text-center">
          Dernière mise à jour : {formatTimeAgo(lastFetchTime)}
        </p>
      </div>
    </div>
  );
}

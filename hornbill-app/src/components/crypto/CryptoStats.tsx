"use client";

import { CryptoDashboard } from "@/types/crypto.type";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
} from "lucide-react";

interface CryptoStatsProps {
  dashboard: CryptoDashboard;
}

function formatEur(value: number) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CryptoStats({ dashboard }: CryptoStatsProps) {
  const isProfit = dashboard.totalPnl >= 0;

  const stats = [
    {
      label: "Total investi",
      value: `${formatEur(dashboard.totalInvested)}`,
      suffix: "€",
      icon: Wallet,
      gradient: "from-slate-500 to-zinc-600",
    },
    {
      label: "Valeur actuelle",
      value: `${formatEur(dashboard.currentValue)}`,
      suffix: "€",
      icon: BarChart3,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "P&L global",
      value: `${isProfit ? "+" : ""}${formatEur(dashboard.totalPnl)}€`,
      suffix: `${isProfit ? "+" : ""}${dashboard.totalPnlPercent.toFixed(1)}%`,
      icon: isProfit ? TrendingUp : TrendingDown,
      gradient: isProfit
        ? "from-emerald-500 to-teal-600"
        : "from-red-500 to-rose-600",
    },
    {
      label: "Positions ouvertes",
      value: `${dashboard.openPositions}`,
      suffix: "",
      icon: Layers,
      gradient: "from-violet-500 to-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}
            >
              <stat.icon size={14} className="text-white" />
            </div>
            <span className="text-[11px] uppercase tracking-wide text-black/35 font-medium">
              {stat.label}
            </span>
          </div>
          <p className="text-xl font-semibold text-black tracking-tight">
            {stat.value}
          </p>
          {stat.suffix && (
            <p
              className={`text-xs mt-0.5 font-medium ${
                stat.label === "P&L global"
                  ? isProfit
                    ? "text-emerald-600"
                    : "text-red-500"
                  : "text-black/40"
              }`}
            >
              {stat.suffix}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

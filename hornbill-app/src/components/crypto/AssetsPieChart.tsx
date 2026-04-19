"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { CryptoPosition } from "@/types/crypto.type";
import { Euro, Hash } from "lucide-react";

interface AssetsPieChartProps {
  positions: CryptoPosition[];
  prices: Record<string, number>;
}

type ViewMode = "value" | "quantity";

const COLORS = [
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f43f5e", // rose
  "#6366f1", // indigo
];

function formatEur(value: number) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AssetsPieChart({
  positions,
  prices,
}: AssetsPieChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("value");

  // Calculer les données par valeur
  const dataByValue = positions
    .map((pos) => {
      const soldQty = (pos.sellExecutions ?? []).reduce(
        (sum, e) => sum + e.quantitySold,
        0,
      );
      const remainingQty = pos.quantity - soldQty;
      const currentPrice = prices[pos.symbol] ?? 0;
      const value = currentPrice * remainingQty;

      return {
        symbol: pos.symbol,
        value,
        displayValue: `${formatEur(value)}€`,
      };
    })
    .filter((d) => d.value > 0);

  const totalValue = dataByValue.reduce((sum, d) => sum + d.value, 0);

  // Calculer les données par quantité
  const dataByQuantity = positions
    .map((pos) => {
      const soldQty = (pos.sellExecutions ?? []).reduce(
        (sum, e) => sum + e.quantitySold,
        0,
      );
      const remainingQty = pos.quantity - soldQty;

      return {
        symbol: pos.symbol,
        value: remainingQty,
        displayValue: remainingQty.toString(),
      };
    })
    .filter((d) => d.value > 0);

  const totalQuantity = dataByQuantity.reduce((sum, d) => sum + d.value, 0);

  const currentData = viewMode === "value" ? dataByValue : dataByQuantity;
  const total = viewMode === "value" ? totalValue : totalQuantity;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-white border border-black/10 rounded-lg shadow-lg px-3 py-2">
          <p className="text-sm font-semibold text-black">
            {data.payload.symbol}
          </p>
          <p className="text-xs text-black/60 mt-0.5">
            {viewMode === "value"
              ? `${data.payload.displayValue} (${percentage}%)`
              : `${data.payload.displayValue} unités (${percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (positions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <h3 className="text-sm font-semibold text-black tracking-tight mb-4">
          Répartition des assets
        </h3>
        <div className="text-center py-12">
          <p className="text-sm text-black/40">Aucune position à afficher</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-black tracking-tight">
          Répartition des assets
        </h3>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-black/[0.04] rounded-lg p-1">
          <button
            onClick={() => setViewMode("value")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === "value"
                ? "bg-white text-black shadow-sm"
                : "text-black/50 hover:text-black"
            }`}
          >
            <Euro size={12} />
            Valeur
          </button>
          <button
            onClick={() => setViewMode("quantity")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === "quantity"
                ? "bg-white text-black shadow-sm"
                : "text-black/50 hover:text-black"
            }`}
          >
            <Hash size={12} />
            Quantité
          </button>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={currentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => {
                const percentage = (entry.value / total) * 100;
                return percentage > 5 ? entry.symbol : "";
              }}
              outerRadius={90}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {currentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {currentData.map((entry, index) => {
          const percentage = ((entry.value / total) * 100).toFixed(1);
          return (
            <div key={entry.symbol} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-black truncate">
                  {entry.symbol}
                </p>
                <p className="text-[10px] text-black/40">{percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

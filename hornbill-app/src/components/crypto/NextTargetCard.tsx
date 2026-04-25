"use client";

import { CryptoDashboard } from "@/types/crypto.type";
import { Crosshair } from "lucide-react";

interface NextTargetCardProps {
  dashboard: CryptoDashboard;
}

function formatEur(value: number) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function NextTargetCard({ dashboard }: NextTargetCardProps) {
  if (!dashboard.nextTarget) {
    return (
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <Crosshair size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-black/35 font-medium">
              Prochain target
            </p>
            <p className="text-sm text-black/40 mt-0.5">
              Aucun target en attente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <Crosshair size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-black/35 font-medium">
              Prochain target
            </p>
            <p className="text-sm font-semibold text-black mt-0.5">
              {dashboard.nextTarget.symbol} à{" "}
              {formatEur(dashboard.nextTarget.targetPrice)}€{" "}
              <span className="text-black/40 font-normal">
                (+{dashboard.nextTarget.triggerPercent}%)
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-black/40">
            Prix actuel : {formatEur(dashboard.nextTarget.currentPrice)}€
          </p>
          <p className="text-xs font-medium text-amber-600">
            Encore {dashboard.nextTarget.distancePercent}% à parcourir
          </p>
        </div>
      </div>
    </div>
  );
}

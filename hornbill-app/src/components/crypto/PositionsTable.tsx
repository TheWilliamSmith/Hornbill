"use client";

import {
  CryptoPosition,
  CryptoPositionStatus,
  SellTargetStatus,
} from "@/types/crypto.type";
import { Eye, Plus, ArrowDownToLine, Pencil, Trash2 } from "lucide-react";
import DropdownMenu from "@/components/ui/DropdownMenu";
import CryptoIcon from "@/components/crypto/CryptoIcon";

interface PositionsTableProps {
  positions: CryptoPosition[];
  prices: Record<string, number>;
  onRowClick: (position: CryptoPosition) => void;
  onAddPosition: () => void;
  onSell: (position: CryptoPosition) => void;
  onEdit: (position: CryptoPosition) => void;
  onDelete: (position: CryptoPosition) => void;
}

function formatEur(value: number) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusLabel(status: CryptoPositionStatus) {
  switch (status) {
    case CryptoPositionStatus.OPEN:
      return { text: "Open", cls: "bg-emerald-50 text-emerald-700" };
    case CryptoPositionStatus.PARTIALLY_SOLD:
      return { text: "Partial", cls: "bg-amber-50 text-amber-700" };
    case CryptoPositionStatus.CLOSED:
      return { text: "Closed", cls: "bg-zinc-100 text-zinc-500" };
  }
}

function nextPendingTarget(position: CryptoPosition) {
  return position.sellTargets.find(
    (t) => t.status === SellTargetStatus.PENDING,
  );
}

export default function PositionsTable({
  positions,
  prices,
  onRowClick,
  onAddPosition,
  onSell,
  onEdit,
  onDelete,
}: PositionsTableProps) {
  if (positions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-black/40 mb-4">
          Aucune position enregistrée
        </p>
        <button
          onClick={onAddPosition}
          className="px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 active:scale-[0.97] transition-all cursor-pointer"
        >
          <Plus size={14} className="inline mr-1.5 -mt-0.5" />
          Ajouter un achat
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-visible">
      <table className="w-full">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-black/35 font-medium">
            <th className="text-left pb-3 pl-4">Symbol</th>
            <th className="text-right pb-3">Quantité</th>
            <th className="text-right pb-3">Prix achat</th>
            <th className="text-right pb-3">Prix actuel</th>
            <th className="text-right pb-3">P&L</th>
            <th className="text-center pb-3">Status</th>
            <th className="text-left pb-3">Plateforme</th>
            <th className="text-center pb-3">Next target</th>
            <th className="text-right pb-3 pr-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.04]">
          {positions.map((pos) => {
            const currentPrice = prices[pos.symbol] ?? 0;
            const soldQty = (pos.sellExecutions ?? []).reduce(
              (sum, e) => sum + e.quantitySold,
              0,
            );
            const remainingQty = pos.quantity - soldQty;
            const investedValue = pos.costBasis * remainingQty;
            const marketValue = currentPrice * remainingQty;
            const pnl = marketValue - investedValue;
            const pnlPercent =
              investedValue > 0 ? (pnl / investedValue) * 100 : 0;
            const isProfit = pnl >= 0;
            const status = statusLabel(pos.status);
            const target = nextPendingTarget(pos);

            return (
              <tr
                key={pos.id}
                onClick={() => onRowClick(pos)}
                className="group hover:bg-black/[0.015] transition-colors cursor-pointer"
              >
                <td className="py-3.5 pl-4">
                  <div className="flex items-center gap-2.5">
                    <CryptoIcon symbol={pos.symbol} size="md" />
                    <span className="text-sm font-semibold text-black">
                      {pos.symbol}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 text-right text-sm text-black/70">
                  {remainingQty}
                  {soldQty > 0 && (
                    <span className="text-black/30 ml-1 text-xs">
                      /{pos.quantity}
                    </span>
                  )}
                </td>
                <td className="py-3.5 text-right text-sm text-black/70">
                  {pos.costBasis}€
                </td>
                <td className="py-3.5 text-right text-sm font-medium text-black">
                  {currentPrice}€
                </td>
                <td className="py-3.5 text-right">
                  <span
                    className={`text-sm font-medium ${
                      isProfit ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {isProfit ? "+" : ""}
                    {formatEur(pnl)}€
                  </span>
                  <span
                    className={`block text-[11px] ${
                      isProfit ? "text-emerald-500" : "text-red-400"
                    }`}
                  >
                    {isProfit ? "+" : ""}
                    {pnlPercent.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3.5 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${status.cls}`}
                  >
                    {status.text}
                  </span>
                </td>
                <td className="py-3.5 text-sm text-black/50 capitalize">
                  {pos.platform}
                </td>
                <td className="py-3.5 text-center">
                  {target ? (
                    <span className="text-[11px] text-black/40">
                      +{target.triggerPercent}% →{" "}
                      {formatEur(target.targetPrice)}€
                    </span>
                  ) : (
                    <span className="text-[11px] text-black/20">—</span>
                  )}
                </td>
                <td
                  className="py-3.5 pr-4 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu
                    items={[
                      {
                        label: "Voir détails",
                        icon: <Eye size={14} />,
                        onClick: () => onRowClick(pos),
                      },
                      {
                        label: "Enregistrer une vente",
                        icon: <ArrowDownToLine size={14} />,
                        onClick: () => onSell(pos),
                      },
                      {
                        label: "Modifier",
                        icon: <Pencil size={14} />,
                        onClick: () => onEdit(pos),
                      },
                      {
                        label: "Supprimer",
                        icon: <Trash2 size={14} />,
                        onClick: () => onDelete(pos),
                        variant: "danger",
                      },
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

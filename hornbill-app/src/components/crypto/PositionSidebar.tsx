"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  X,
  Calendar,
  Landmark,
  DollarSign,
  Hash,
  Percent,
  Plus,
  ArrowDownToLine,
  Pencil,
  Trash2,
  Crosshair,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  CryptoPosition,
  SellTarget,
  SellExecution,
  SellTargetStatus,
} from "@/types/crypto.type";

interface PositionSidebarProps {
  position: CryptoPosition | null;
  currentPrice: number;
  isOpen: boolean;
  onClose: () => void;
  onAddTarget: () => void;
  onSell: () => void;
  onEditTarget: (target: SellTarget) => void;
  onDeleteTarget: (target: SellTarget) => void;
}

function formatEur(value: number) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function targetStatusIcon(status: SellTargetStatus) {
  switch (status) {
    case SellTargetStatus.PENDING:
      return <Clock size={14} className="text-black/30" />;
    case SellTargetStatus.TRIGGERED:
      return <AlertCircle size={14} className="text-amber-500" />;
    case SellTargetStatus.EXECUTED:
      return <CheckCircle2 size={14} className="text-emerald-500" />;
  }
}

function targetStatusLabel(status: SellTargetStatus) {
  switch (status) {
    case SellTargetStatus.PENDING:
      return { text: "Pending", cls: "text-black/40" };
    case SellTargetStatus.TRIGGERED:
      return { text: "Triggered", cls: "text-amber-600" };
    case SellTargetStatus.EXECUTED:
      return { text: "Executed", cls: "text-emerald-600" };
  }
}

export default function PositionSidebar({
  position,
  currentPrice,
  isOpen,
  onClose,
  onAddTarget,
  onSell,
  onEditTarget,
  onDeleteTarget,
}: PositionSidebarProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !position) return null;

  const soldQty = (position.sellExecutions ?? []).reduce(
    (sum, e) => sum + e.quantitySold,
    0,
  );
  const remainingQty = position.quantity - soldQty;
  const investedValue = position.costBasis * remainingQty;
  const marketValue = currentPrice * remainingQty;
  const pnl = marketValue - investedValue;
  const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
  const isProfit = pnl >= 0;
  const totalRealizedPnl = (position.sellExecutions ?? []).reduce(
    (sum, e) => sum + e.realizedPnl,
    0,
  );

  const infoItems = [
    {
      icon: Calendar,
      label: "Date d'achat",
      value: formatDate(position.boughtAt),
    },
    { icon: Landmark, label: "Plateforme", value: position.platform },
    {
      icon: DollarSign,
      label: "Prix d'achat",
      value: `${formatEur(position.buyPrice)}€`,
    },
    { icon: DollarSign, label: "Frais", value: `${formatEur(position.fees)}€` },
    { icon: Hash, label: "Quantité", value: `${position.quantity}` },
    {
      icon: DollarSign,
      label: "Coût de revient",
      value: `${formatEur(position.costBasis)}€ /u`,
    },
  ];

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl shadow-black/10 animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center text-sm font-bold text-black/70">
              {position.symbol.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black tracking-tight">
                {position.symbol}
              </h2>
              <p className="text-xs text-black/40 capitalize">
                {position.platform}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-black/30 hover:text-black hover:bg-black/5 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* P&L summary */}
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-zinc-50 rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-black/35 font-medium mb-1">
                Valeur actuelle
              </p>
              <p className="text-lg font-semibold text-black">
                {formatEur(marketValue)}€
              </p>
              <p className="text-xs text-black/40">
                {formatEur(currentPrice)}€ × {remainingQty}
              </p>
            </div>
            <div className="flex-1 bg-zinc-50 rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-black/35 font-medium mb-1">
                P&L latent
              </p>
              <p
                className={`text-lg font-semibold ${
                  isProfit ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {isProfit ? "+" : ""}
                {formatEur(pnl)}€
              </p>
              <p
                className={`text-xs ${
                  isProfit ? "text-emerald-500" : "text-red-400"
                }`}
              >
                {isProfit ? "+" : ""}
                {pnlPercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {totalRealizedPnl !== 0 && (
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-emerald-700/60 font-medium mb-1">
                P&L réalisé
              </p>
              <p className="text-lg font-semibold text-emerald-700">
                +{formatEur(totalRealizedPnl)}€
              </p>
            </div>
          )}

          {/* Info grid */}
          <div>
            <h3 className="text-[11px] uppercase tracking-wide text-black/35 font-medium mb-3">
              Détails de l&apos;achat
            </h3>
            <div className="space-y-2.5">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs text-black/50">
                    <item.icon size={13} />
                    {item.label}
                  </div>
                  <span className="text-sm font-medium text-black">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sell Targets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] uppercase tracking-wide text-black/35 font-medium">
                Sell Targets
              </h3>
              <button
                onClick={onAddTarget}
                className="flex items-center gap-1 text-xs text-black/50 hover:text-black transition-colors cursor-pointer"
              >
                <Plus size={12} />
                Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {position.sellTargets.map((target) => {
                const st = targetStatusLabel(target.status);
                const progress =
                  currentPrice > 0
                    ? Math.min(
                        ((currentPrice - position.costBasis) /
                          (target.targetPrice - position.costBasis)) *
                          100,
                        100,
                      )
                    : 0;

                return (
                  <div
                    key={target.id}
                    className="bg-zinc-50 rounded-xl p-3.5 group/target"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {targetStatusIcon(target.status)}
                        <span className="text-sm font-medium text-black">
                          +{target.triggerPercent}%
                        </span>
                        <span className="text-xs text-black/40">
                          → vendre {target.sellPercent}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium ${st.cls}`}>
                          {st.text}
                        </span>
                        {target.status === SellTargetStatus.PENDING && (
                          <div className="hidden group-hover/target:flex items-center gap-0.5">
                            <button
                              onClick={() => onEditTarget(target)}
                              className="p-1 rounded hover:bg-black/5 transition-colors cursor-pointer"
                            >
                              <Pencil size={11} className="text-black/30" />
                            </button>
                            <button
                              onClick={() => onDeleteTarget(target)}
                              className="p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={11} className="text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-black/40 mb-2">
                      <span>Target : {formatEur(target.targetPrice)}€</span>
                      {target.triggeredAt && (
                        <span>Déclenché {formatDate(target.triggeredAt)}</span>
                      )}
                    </div>
                    {target.status === SellTargetStatus.PENDING && (
                      <div className="w-full bg-black/[0.06] rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.max(0, progress)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sell Executions */}
          {(position.sellExecutions ?? []).length > 0 && (
            <div>
              <h3 className="text-[11px] uppercase tracking-wide text-black/35 font-medium mb-3">
                Ventes exécutées
              </h3>
              <div className="space-y-2">
                {(position.sellExecutions ?? []).map((exec) => (
                  <div
                    key={exec.id}
                    className="bg-zinc-50 rounded-xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-black">
                        {exec.quantitySold} {position.symbol} à{" "}
                        {formatEur(exec.sellPrice)}€
                      </p>
                      <p className="text-xs text-black/40 mt-0.5">
                        {formatDate(exec.executedAt)} · Frais{" "}
                        {formatEur(exec.fees)}€
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        exec.realizedPnl >= 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {exec.realizedPnl >= 0 ? "+" : ""}
                      {formatEur(exec.realizedPnl)}€
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-black/[0.06] px-6 py-4 flex items-center gap-2">
          <button
            onClick={onSell}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 active:scale-[0.97] transition-all cursor-pointer"
          >
            <ArrowDownToLine size={14} />
            Enregistrer une vente
          </button>
          <button
            onClick={onAddTarget}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black border border-black/10 text-sm font-medium rounded-xl hover:border-black/20 hover:shadow-sm active:scale-[0.97] transition-all cursor-pointer"
          >
            <Crosshair size={14} />
            Target
          </button>
        </div>
      </div>
    </div>
  );
}

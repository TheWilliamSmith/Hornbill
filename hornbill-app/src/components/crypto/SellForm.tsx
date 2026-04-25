"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { CryptoPosition, SellTargetStatus } from "@/types/crypto.type";
import { cryptoService } from "@/services/crypto.service";

interface SellFormProps {
  position: CryptoPosition;
  currentPrice: number;
  onSuccess: () => void;
}

function formatEur(value: number) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SellForm({
  position,
  currentPrice,
  onSuccess,
}: SellFormProps) {
  const soldQty = (position.sellExecutions ?? []).reduce(
    (sum, e) => sum + e.quantitySold,
    0,
  );
  const remainingQty = position.quantity - soldQty;

  // Find TRIGGERED targets that haven't been executed yet
  const triggeredTargets = position.sellTargets.filter(
    (t) => t.status === SellTargetStatus.TRIGGERED,
  );

  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    triggeredTargets.length > 0 ? triggeredTargets[0].id : "",
  );
  const [quantitySold, setQuantitySold] = useState("");
  const [sellPrice, setSellPrice] = useState(currentPrice.toString());
  const [fees, setFees] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qty = parseFloat(quantitySold || "0");
  const price = parseFloat(sellPrice || "0");
  const feesVal = parseFloat(fees || "0");
  const costBasisPerUnit = position.costBasis;
  const estimatedPnl = (price - costBasisPerUnit) * qty - feesVal;

  // Pre-fill quantity when selecting a target
  const handleTargetChange = (targetId: string) => {
    setSelectedTargetId(targetId);
    if (targetId) {
      const target = position.sellTargets.find((t) => t.id === targetId);
      if (target) {
        const suggestedQty = (target.sellPercent / 100) * position.quantity;
        const cappedQty = Math.min(suggestedQty, remainingQty);
        setQuantitySold(cappedQty.toString());
        setSellPrice(currentPrice.toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0 || price <= 0) return;

    setSaving(true);
    setError(null);

    try {
      await cryptoService.createExecution({
        positionId: position.id,
        targetId: selectedTargetId || undefined,
        quantitySold: qty,
        sellPrice: price,
        fees: feesVal || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        try {
          const body = await (err as { response: Response }).response.json();
          setError(body.message || "Erreur lors de l'enregistrement");
        } catch {
          setError("Erreur lors de l'enregistrement");
        }
      } else {
        setError("Erreur lors de l'enregistrement");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-zinc-50 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <p className="text-xs text-black/40">Position</p>
          <p className="text-sm font-semibold text-black">
            {position.symbol} · {remainingQty} restants
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-black/40">Prix actuel</p>
          <p className="text-sm font-semibold text-black">
            {formatEur(currentPrice)}€
          </p>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Target selection */}
      {triggeredTargets.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Target associé (optionnel)
          </label>
          <select
            value={selectedTargetId}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors bg-white"
          >
            <option value="">Aucun target</option>
            {triggeredTargets.map((t) => (
              <option key={t.id} value={t.id}>
                +{t.triggerPercent}% → vendre {t.sellPercent}% (
                {formatEur(t.targetPrice)}€)
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-black/50 mb-1.5">
          Quantité vendue
        </label>
        <input
          type="number"
          value={quantitySold}
          onChange={(e) => setQuantitySold(e.target.value)}
          placeholder={`Max ${remainingQty}`}
          step="any"
          max={remainingQty}
          className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Prix de vente (€)
          </label>
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            step="any"
            className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Frais (€)
          </label>
          <input
            type="number"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            placeholder="0"
            step="any"
            className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
          />
        </div>
      </div>

      {qty > 0 && price > 0 && (
        <div className="bg-zinc-50 rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wide text-black/35 font-medium mb-1">
            P&L estimé
          </p>
          <p
            className={`text-lg font-semibold ${
              estimatedPnl >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {estimatedPnl >= 0 ? "+" : ""}
            {formatEur(estimatedPnl)}€
          </p>
          <p className="text-xs text-black/40 mt-0.5">
            ({formatEur(price)}€ - {formatEur(costBasisPerUnit)}€) × {qty}
            {feesVal > 0 ? ` - ${formatEur(feesVal)}€ frais` : ""}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={saving || qty <= 0 || price <= 0}
        className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          "Enregistrer la vente"
        )}
      </button>
    </form>
  );
}

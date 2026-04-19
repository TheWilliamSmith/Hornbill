"use client";

import { useState } from "react";
import { CryptoPosition } from "@/types/crypto.type";

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

  const [quantitySold, setQuantitySold] = useState("");
  const [sellPrice, setSellPrice] = useState(currentPrice.toString());
  const [fees, setFees] = useState("");

  const qty = parseFloat(quantitySold || "0");
  const price = parseFloat(sellPrice || "0");
  const feesVal = parseFloat(fees || "0");
  const estimatedPnl = (price - position.costBasis) * qty - feesVal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock — just close for now
    onSuccess();
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

      <div>
        <label className="block text-xs font-medium text-black/50 mb-1.5">
          Quantité à vendre
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
            ({formatEur(price)}€ - {formatEur(position.costBasis)}€) × {qty}
            {feesVal > 0 ? ` - ${formatEur(feesVal)}€ frais` : ""}
          </p>
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all cursor-pointer"
      >
        Enregistrer la vente
      </button>
    </form>
  );
}

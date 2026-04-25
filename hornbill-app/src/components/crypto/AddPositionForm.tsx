"use client";

import { useState } from "react";
import { useCreatePosition } from "@/hooks/use-crypto";

interface AddPositionFormProps {
  onSuccess: () => void;
}

export default function AddPositionForm({ onSuccess }: AddPositionFormProps) {
  const { createPosition, isLoading, error } = useCreatePosition();
  const [symbol, setSymbol] = useState("");
  const [platform, setPlatform] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fees, setFees] = useState("");
  const [boughtAt, setBoughtAt] = useState(
    new Date().toISOString().slice(0, 16),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createPosition({
      symbol,
      platform,
      buyPrice: parseFloat(buyPrice),
      quantity: parseFloat(quantity),
      fees: fees ? parseFloat(fees) : undefined,
      boughtAt: new Date(boughtAt).toISOString(),
    });
    if (result) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="BTC"
            className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Plateforme
          </label>
          <input
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="kraken"
            className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Prix unitaire (€)
          </label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="95000.50"
            step="any"
            className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Quantité
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.01"
            step="any"
            className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Frais (€)
          </label>
          <input
            type="number"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            placeholder="2.50"
            step="any"
            className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Date d&apos;achat
          </label>
          <input
            type="datetime-local"
            value={boughtAt}
            onChange={(e) => setBoughtAt(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
            required
          />
        </div>
      </div>

      {/* Cost basis preview */}
      {buyPrice && quantity && (
        <div className="bg-zinc-50 rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wide text-black/35 font-medium mb-1">
            Coût de revient estimé
          </p>
          <p className="text-sm font-semibold text-black">
            {(
              parseFloat(buyPrice) +
              parseFloat(fees || "0") / parseFloat(quantity)
            ).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            € / unité
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Enregistrement…" : "Enregistrer l\u0027achat"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { SellTarget } from "@/types/crypto.type";
import { useAddTarget, useUpdateTarget } from "@/hooks/use-crypto";

interface AddTargetFormProps {
  positionId: string;
  costBasis: number;
  existingTarget?: SellTarget;
  onSuccess: () => void;
}

function formatEur(value: number) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AddTargetForm({
  positionId,
  costBasis,
  existingTarget,
  onSuccess,
}: AddTargetFormProps) {
  const { addTarget, isLoading: addLoading, error: addError } = useAddTarget();
  const { updateTarget, isLoading: updateLoading, error: updateError } = useUpdateTarget();
  const isLoading = addLoading || updateLoading;
  const error = addError || updateError;

  const [triggerPercent, setTriggerPercent] = useState(
    existingTarget ? existingTarget.triggerPercent.toString() : "",
  );
  const [sellPercent, setSellPercent] = useState(
    existingTarget ? existingTarget.sellPercent.toString() : "",
  );

  const trigger = parseFloat(triggerPercent || "0");
  const targetPrice = costBasis * (1 + trigger / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      triggerPercent: parseFloat(triggerPercent),
      sellPercent: parseFloat(sellPercent),
    };
    if (existingTarget) {
      const result = await updateTarget(existingTarget.id, data);
      if (result) onSuccess();
    } else {
      const result = await addTarget(positionId, data);
      if (result) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-black/50 mb-1.5">
          Gain déclencheur (%)
        </label>
        <input
          type="number"
          value={triggerPercent}
          onChange={(e) => setTriggerPercent(e.target.value)}
          placeholder="30"
          step="any"
          className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-black/50 mb-1.5">
          Pourcentage de la position à vendre (%)
        </label>
        <input
          type="number"
          value={sellPercent}
          onChange={(e) => setSellPercent(e.target.value)}
          placeholder="20"
          step="any"
          min="1"
          max="100"
          className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl focus:outline-none focus:border-black/30 transition-colors"
          required
        />
      </div>

      {trigger > 0 && (
        <div className="bg-zinc-50 rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wide text-black/35 font-medium mb-1">
            Prix cible calculé
          </p>
          <p className="text-sm font-semibold text-black">
            {formatEur(targetPrice)}€
          </p>
          <p className="text-xs text-black/40 mt-0.5">
            {formatEur(costBasis)}€ × (1 + {trigger}%)
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? "Enregistrement…"
          : existingTarget
            ? "Modifier le target"
            : "Ajouter le target"}
      </button>
    </form>
  );
}

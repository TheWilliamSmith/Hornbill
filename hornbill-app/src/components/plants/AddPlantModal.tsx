"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { CreatePlantRequest } from "@/types/plant.type";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreatePlantRequest) => Promise<void>;
}

export default function AddPlantModal({ isOpen, onClose, onCreate }: Props) {
  const [customName, setCustomName] = useState("");
  const [speciesName, setSpeciesName] = useState("");
  const [acquiredAt, setAcquiredAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setLoading(true);
    try {
      await onCreate({
        customName: customName.trim(),
        speciesName: speciesName.trim() || undefined,
        acquiredAt: acquiredAt || undefined,
        notes: notes.trim() || undefined,
      });
      setCustomName("");
      setSpeciesName("");
      setAcquiredAt("");
      setNotes("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06]">
          <h2 className="text-base font-semibold text-black">Ajouter une plante</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.05] transition-colors cursor-pointer"
          >
            <X size={15} className="text-black/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-black/50 mb-1.5">
              Nom <span className="text-[#468BE6]">*</span>
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Mon Monstera"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] text-sm text-black placeholder-black/25 outline-none focus:border-[#468BE6] focus:ring-2 focus:ring-[#468BE6]/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black/50 mb-1.5">
              Espèce (facultatif)
            </label>
            <input
              type="text"
              value={speciesName}
              onChange={(e) => setSpeciesName(e.target.value)}
              placeholder="Monstera Deliciosa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] text-sm text-black placeholder-black/25 italic outline-none focus:border-[#468BE6] focus:ring-2 focus:ring-[#468BE6]/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black/50 mb-1.5">
              Date d'acquisition
            </label>
            <input
              type="date"
              value={acquiredAt}
              onChange={(e) => setAcquiredAt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] text-sm text-black outline-none focus:border-[#468BE6] focus:ring-2 focus:ring-[#468BE6]/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black/50 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Exposée côté sud, arrosage modéré..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] text-sm text-black placeholder-black/25 outline-none focus:border-[#468BE6] focus:ring-2 focus:ring-[#468BE6]/10 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-black/[0.1] text-sm font-medium text-black/60 hover:bg-black/[0.03] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !customName.trim()}
              className="flex-1 py-2.5 rounded-xl bg-[#468BE6] hover:bg-[#1A5799] text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

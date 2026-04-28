"use client";

import { useState } from "react";
import { Plus, Trash2, ExternalLink, X, Loader2 } from "lucide-react";
import type { PlantWishlistItem, CreateWishlistItemRequest, WishlistPriority } from "@/types/plant.type";
import { plantService } from "@/services/plant.service";

const PRIORITY_META: Record<WishlistPriority, { label: string; color: string; bg: string }> = {
  HIGH: { label: "Haute", color: "text-rose-600", bg: "bg-rose-50" },
  MEDIUM: { label: "Moyenne", color: "text-amber-600", bg: "bg-amber-50" },
  LOW: { label: "Faible", color: "text-[#468BE6]", bg: "bg-[#E9F5FF]" },
};

interface Props {
  items: PlantWishlistItem[];
  onRefresh: () => void;
}

export default function WishlistView({ items, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [speciesName, setSpeciesName] = useState("");
  const [priority, setPriority] = useState<WishlistPriority>("MEDIUM");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speciesName.trim()) return;
    setSubmitting(true);
    try {
      const data: CreateWishlistItemRequest = {
        speciesName: speciesName.trim(),
        priority,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        link: link.trim() || undefined,
        note: note.trim() || undefined,
      };
      await plantService.createWishlistItem(data);
      setSpeciesName("");
      setPriority("MEDIUM");
      setEstimatedPrice("");
      setLink("");
      setNote("");
      setShowForm(false);
      onRefresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await plantService.deleteWishlistItem(id);
      onRefresh();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      {showForm ? (
        <div className="bg-white rounded-2xl border border-[#93BFEF]/60 p-5 shadow-[0_1px_3px_rgba(70,139,230,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-black">Nouvelle envie</h3>
            <button onClick={() => setShowForm(false)} className="w-6 h-6 rounded-lg hover:bg-black/[0.05] flex items-center justify-center cursor-pointer">
              <X size={13} className="text-black/40" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-black/40 mb-1">
                  Espèce *
                </label>
                <input
                  type="text"
                  value={speciesName}
                  onChange={(e) => setSpeciesName(e.target.value)}
                  placeholder="Philodendron Pink Princess"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.1] text-sm text-black placeholder-black/25 outline-none focus:border-[#468BE6] focus:ring-2 focus:ring-[#468BE6]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black/40 mb-1">Priorité</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as WishlistPriority)}
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.1] text-sm text-black outline-none focus:border-[#468BE6] focus:ring-2 focus:ring-[#468BE6]/10 transition-all bg-white"
                >
                  <option value="HIGH">Haute</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="LOW">Faible</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-black/40 mb-1">Prix estimé (€)</label>
                <input
                  type="number"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="25"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.1] text-sm text-black placeholder-black/25 outline-none focus:border-[#468BE6] focus:ring-2 focus:ring-[#468BE6]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black/40 mb-1">Lien</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.1] text-sm text-black placeholder-black/25 outline-none focus:border-[#468BE6] focus:ring-2 focus:ring-[#468BE6]/10 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-black/40 mb-1">Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Où la trouver, variété précise..."
                className="w-full px-3 py-2 rounded-xl border border-black/[0.1] text-sm text-black placeholder-black/25 outline-none focus:border-[#468BE6] focus:ring-2 focus:ring-[#468BE6]/10 transition-all"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-xl border border-black/[0.1] text-sm font-medium text-black/50 hover:bg-black/[0.03] transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || !speciesName.trim()}
                className="flex-1 py-2 rounded-xl bg-[#468BE6] hover:bg-[#1A5799] text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                Ajouter
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-[#93BFEF]/50 hover:border-[#468BE6] hover:bg-[#E9F5FF]/40 transition-all text-[#468BE6] text-sm font-medium cursor-pointer"
        >
          <Plus size={16} />
          Ajouter une envie
        </button>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#E9F5FF] flex items-center justify-center mb-3">
            <Plus size={20} className="text-[#468BE6]" />
          </div>
          <p className="text-sm font-medium text-black/50">Wishlist vide</p>
          <p className="text-xs text-black/30 mt-1">Ajoutez les plantes qui vous font envie</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const pMeta = PRIORITY_META[item.priority];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-black/[0.06] px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3 hover:border-[#93BFEF] hover:shadow-md transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-black truncate">{item.speciesName}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pMeta.bg} ${pMeta.color} flex-shrink-0`}>
                      {pMeta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.estimatedPrice && (
                      <span className="text-xs text-black/40">{item.estimatedPrice.toFixed(2)} €</span>
                    )}
                    {item.note && (
                      <span className="text-xs text-black/35 truncate">{item.note}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#E9F5FF] transition-colors"
                    >
                      <ExternalLink size={13} className="text-[#468BE6]" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    {deleting === item.id ? (
                      <Loader2 size={12} className="animate-spin text-red-400" />
                    ) : (
                      <Trash2 size={13} className="text-black/25 hover:text-red-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

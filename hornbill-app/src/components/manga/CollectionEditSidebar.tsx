"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Loader2, Trash2 } from "lucide-react";
import { mangaService } from "@/services/manga.service";
import type { UserMangaCollection, UserMangaStatus } from "@/types/manga.type";
import toast from "react-hot-toast";

const STATUS_OPTIONS: Array<{ value: UserMangaStatus; label: string }> = [
  { value: "PLAN_TO_READ", label: "Planifié" },
  { value: "READING", label: "En train de lire" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "ON_HOLD", label: "En pause" },
  { value: "DROPPED", label: "Abandonné" },
];

interface Props {
  entry: UserMangaCollection;
  onClose: () => void;
  onUpdated: (entry: UserMangaCollection) => void;
  onRemoved: () => void;
}

export default function CollectionEditSidebar({
  entry,
  onClose,
  onUpdated,
  onRemoved,
}: Props) {
  const manga = entry.mangaReference;
  const [status, setStatus] = useState<UserMangaStatus>(entry.status);
  const [ownedVolumes, setOwnedVolumes] = useState<number[]>(
    entry.ownedVolumes,
  );
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalVolumes = manga.volumes;
  const hasVolumes = totalVolumes && totalVolumes > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await mangaService.updateCollectionEntry(entry.id, {
        status,
        ownedVolumes,
      });
      onUpdated(updated);
      toast.success("Collection mise à jour");
      onClose();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = () => {
    if (!totalVolumes) return;
    setOwnedVolumes(Array.from({ length: totalVolumes }, (_, i) => i + 1));
  };

  const handleClearAll = () => setOwnedVolumes([]);

  const toggleVolume = (vol: number) => {
    setOwnedVolumes((prev) =>
      prev.includes(vol)
        ? prev.filter((v) => v !== vol)
        : [...prev, vol].sort((a, b) => a - b),
    );
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await mangaService.removeFromCollection(entry.id);
      onRemoved();
      toast.success(`${manga.titleRomaji} retiré de votre collection`);
      onClose();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 sticky top-0 bg-white z-10">
          <h2 className="font-semibold line-clamp-1">{manga.titleRomaji}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Cover + info */}
          <div className="flex gap-4">
            <div className="relative w-20 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-100 shrink-0">
              {manga.coverImageUrl ? (
                <Image
                  src={manga.coverImageUrl}
                  alt={manga.titleRomaji}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-200" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-semibold text-sm leading-tight">
                {manga.titleRomaji}
              </p>
              {manga.titleEnglish &&
                manga.titleEnglish !== manga.titleRomaji && (
                  <p className="text-xs text-black/40">{manga.titleEnglish}</p>
                )}
              {manga.authorName && (
                <p className="text-xs text-black/40">{manga.authorName}</p>
              )}
              {manga.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="inline-block text-xs bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded mr-1"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-black/50 uppercase tracking-wide block mb-2">
              Statut de lecture
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserMangaStatus)}
              className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Volumes */}
          {hasVolumes ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-medium text-black/50 uppercase tracking-wide">
                    Tomes possédés
                  </span>
                  <p className="text-sm font-semibold mt-0.5">
                    {ownedVolumes.length} / {totalVolumes}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkAll}
                    className="text-xs px-3 py-1.5 rounded-lg bg-black text-white hover:bg-black/80 transition-colors"
                  >
                    Tout marquer
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-xs px-3 py-1.5 rounded-lg border border-black/10 hover:bg-zinc-50 transition-colors"
                  >
                    Effacer
                  </button>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-black rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (ownedVolumes.length / totalVolumes) * 100)}%`,
                  }}
                />
              </div>
              {/* Volume grid */}
              <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto">
                {Array.from({ length: totalVolumes }, (_, i) => i + 1).map(
                  (vol) => {
                    const owned = ownedVolumes.includes(vol);
                    return (
                      <button
                        key={vol}
                        onClick={() => toggleVolume(vol)}
                        className={`aspect-square rounded-lg text-xs font-medium transition-colors ${
                          owned
                            ? "bg-black text-white"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {vol}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-black/30 text-center py-2">
              Nombre de tomes inconnu
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-black/5 space-y-3 sticky bottom-0 bg-white">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm rounded-xl hover:bg-black/80 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Sauvegarder
          </button>

          {confirmDelete ? (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 text-sm border border-black/10 rounded-xl hover:bg-zinc-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {removing && <Loader2 size={14} className="animate-spin" />}
                Confirmer
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Retirer de ma collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

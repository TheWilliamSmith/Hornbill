"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Loader2, Library } from "lucide-react";
import { mangaService } from "@/services/manga.service";
import type {
  MangaSearchResult,
  UserMangaCollection,
  UserMangaStatus,
} from "@/types/manga.type";
import toast from "react-hot-toast";

const STATUS_OPTIONS: Array<{ value: UserMangaStatus; label: string }> = [
  { value: "PLAN_TO_READ", label: "Planifié" },
  { value: "READING", label: "En train de lire" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "ON_HOLD", label: "En pause" },
  { value: "DROPPED", label: "Abandonné" },
];

interface Props {
  manga: MangaSearchResult;
  onClose: () => void;
  onAdded: (entry: UserMangaCollection) => void;
  onUpdated: (entry: UserMangaCollection) => void;
}

export default function AddToCollectionModal({
  manga,
  onClose,
  onAdded,
  onUpdated,
}: Props) {
  const existingEntry = manga.userCollections[0] ?? null;

  const [status, setStatus] = useState<UserMangaStatus>(
    existingEntry?.status ?? "PLAN_TO_READ",
  );
  const [importAll, setImportAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasVolumes = manga.volumes && manga.volumes > 0;
  const alreadyOwnsAll =
    existingEntry &&
    hasVolumes &&
    existingEntry.ownedVolumes.length === manga.volumes;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (existingEntry) {
        // Update status
        const updated = await mangaService.updateCollectionEntry(
          existingEntry.id,
          {
            status,
            ownedVolumes:
              importAll && hasVolumes
                ? Array.from({ length: manga.volumes! }, (_, i) => i + 1)
                : undefined,
          },
        );
        onUpdated(updated);
        toast.success("Collection mise à jour");
      } else {
        const entry = await mangaService.addToCollection({
          mangaReferenceId: manga.id,
          status,
          importAllVolumes: importAll && hasVolumes ? true : false,
        });
        onAdded(entry);
        toast.success(
          importAll && hasVolumes
            ? `${manga.titleRomaji} ajouté — ${manga.volumes} tomes importés`
            : `${manga.titleRomaji} ajouté à votre collection`,
        );
      }
      onClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response
        ?.status;
      if (status === 409) {
        toast.error("Ce manga est déjà dans votre collection");
      } else {
        toast.error("Une erreur est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-black/5">
          <h2 className="font-semibold text-base">
            {existingEntry
              ? "Modifier dans la collection"
              : "Ajouter à ma collection"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Manga info */}
          <div className="flex gap-4">
            <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-100 shrink-0">
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
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight">{manga.titleRomaji}</p>
              {manga.titleEnglish &&
                manga.titleEnglish !== manga.titleRomaji && (
                  <p className="text-sm text-black/40 mt-0.5 truncate">
                    {manga.titleEnglish}
                  </p>
                )}
              {manga.authorName && (
                <p className="text-xs text-black/40 mt-1">{manga.authorName}</p>
              )}
              {manga.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {manga.genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
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

          {/* Import all volumes */}
          {hasVolumes && (
            <button
              onClick={() => setImportAll((v) => !v)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm ${
                importAll
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-zinc-50 hover:bg-zinc-100 text-black"
              }`}
            >
              <Library size={16} className="shrink-0" />
              <span className="flex-1 text-left font-medium">
                Importer tous les tomes
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  importAll
                    ? "bg-white/20 text-white"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {manga.volumes} tomes
              </span>
            </button>
          )}

          {!hasVolumes && (
            <p className="text-xs text-black/30 text-center">
              Nombre de tomes inconnu pour l&apos;instant
            </p>
          )}

          {existingEntry && alreadyOwnsAll && (
            <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1.5">
              <span>✓</span> Vous possédez déjà tous les tomes
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm border border-black/10 rounded-xl hover:bg-zinc-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-black text-white rounded-xl hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {existingEntry ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

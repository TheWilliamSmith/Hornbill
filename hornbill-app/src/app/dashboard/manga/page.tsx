"use client";

import { useState, useEffect, useCallback } from "react";
import { mangaService } from "@/services/manga.service";
import type {
  UserMangaCollection,
  MangaSearchResult,
  UserMangaStatus,
} from "@/types/manga.type";
import MangaSearchAutocomplete from "@/components/manga/MangaSearchAutocomplete";
import AddToCollectionModal from "@/components/manga/AddToCollectionModal";
import CollectionCard from "@/components/manga/CollectionCard";

const STATUS_LABELS: Record<UserMangaStatus, string> = {
  PLAN_TO_READ: "Planifié",
  READING: "En lecture",
  COMPLETED: "Terminé",
  ON_HOLD: "En pause",
  DROPPED: "Abandonné",
};

const STATUS_FILTERS: Array<{ value: UserMangaStatus | "ALL"; label: string }> =
  [
    { value: "ALL", label: "Tout" },
    { value: "READING", label: "En lecture" },
    { value: "PLAN_TO_READ", label: "Planifié" },
    { value: "COMPLETED", label: "Terminé" },
    { value: "ON_HOLD", label: "En pause" },
    { value: "DROPPED", label: "Abandonné" },
  ];

export default function MangaCollectionPage() {
  const [collection, setCollection] = useState<UserMangaCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedManga, setSelectedManga] = useState<MangaSearchResult | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<UserMangaStatus | "ALL">(
    "ALL",
  );

  const loadCollection = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mangaService.getCollection();
      setCollection(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCollection();
  }, [loadCollection]);

  const handleAdded = (entry: UserMangaCollection) => {
    setCollection((prev) => [entry, ...prev]);
  };

  const filtered =
    statusFilter === "ALL"
      ? collection
      : collection.filter((e) => e.status === statusFilter);

  const totalVolumes = collection.reduce(
    (sum, e) => sum + e.ownedVolumes.length,
    0,
  );
  const readingCount = collection.filter((e) => e.status === "READING").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Ma collection manga</h1>
        <p className="text-sm text-black/50 mt-1">
          Gérez votre bibliothèque personnelle
        </p>
      </div>

      {/* Stats */}
      {collection.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-100 rounded-xl px-5 py-4">
            <p className="text-xs text-black/50 uppercase tracking-wide font-medium mb-1">
              Mangas
            </p>
            <p className="text-2xl font-semibold">{collection.length}</p>
          </div>
          <div className="bg-zinc-100 rounded-xl px-5 py-4">
            <p className="text-xs text-black/50 uppercase tracking-wide font-medium mb-1">
              Tomes possédés
            </p>
            <p className="text-2xl font-semibold">{totalVolumes}</p>
          </div>
          <div className="bg-zinc-100 rounded-xl px-5 py-4">
            <p className="text-xs text-black/50 uppercase tracking-wide font-medium mb-1">
              En lecture
            </p>
            <p className="text-2xl font-semibold">{readingCount}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div>
        <p className="text-xs font-medium text-black/50 uppercase tracking-wide mb-3">
          Ajouter un manga
        </p>
        <MangaSearchAutocomplete onSelect={setSelectedManga} />
      </div>

      {/* Collection */}
      <div>
        {/* Status filters */}
        {collection.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {STATUS_FILTERS.map((f) => {
              const count =
                f.value === "ALL"
                  ? collection.length
                  : collection.filter((e) => e.status === f.value).length;
              if (f.value !== "ALL" && count === 0) return null;
              return (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    statusFilter === f.value
                      ? "bg-black text-white"
                      : "bg-zinc-100 text-black/60 hover:bg-zinc-200"
                  }`}
                >
                  {f.label}
                  <span
                    className={`text-xs font-medium ${statusFilter === f.value ? "text-white/70" : "text-black/40"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-zinc-100 animate-pulse aspect-[2/3]"
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((entry) => (
              <CollectionCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            {collection.length === 0 ? (
              <>
                <p className="text-black/30 text-sm">
                  Votre collection est vide.
                </p>
                <p className="text-black/20 text-xs mt-1">
                  Recherchez un manga ci-dessus pour commencer
                </p>
              </>
            ) : (
              <p className="text-black/30 text-sm">
                Aucun manga avec le statut &ldquo;
                {STATUS_LABELS[statusFilter as UserMangaStatus]}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add to collection modal */}
      {selectedManga && (
        <AddToCollectionModal
          manga={selectedManga}
          onClose={() => setSelectedManga(null)}
          onAdded={handleAdded}
          onUpdated={() => void loadCollection()}
        />
      )}
    </div>
  );
}

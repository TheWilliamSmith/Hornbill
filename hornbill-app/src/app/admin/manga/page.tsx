"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  BookMarked,
} from "lucide-react";
import { mangaService } from "@/services/manga.service";
import type {
  ImportJob,
  CatalogStats,
  PaginatedManga,
  MangaStatus,
  ListCatalogParams,
} from "@/types/manga.type";
import ImportJobTable from "@/components/manga/ImportJobTable";
import ImportJobSidebar from "@/components/manga/ImportJobSidebar";
import MangaCard from "@/components/manga/MangaCard";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

const POLL_INTERVAL_MS = 5000;
const DEBOUNCE_MS = 400;

const STATUS_OPTIONS: Array<{ value: MangaStatus | ""; label: string }> = [
  { value: "", label: "Tous les statuts" },
  { value: "PUBLISHING", label: "En cours" },
  { value: "FINISHED", label: "Terminé" },
  { value: "CANCELLED", label: "Annulé" },
  { value: "HIATUS", label: "Pause" },
  { value: "NOT_YET_RELEASED", label: "À venir" },
];

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "popularity", label: "Popularité" },
  { value: "averageScore", label: "Score" },
  { value: "favourites", label: "Favoris" },
  { value: "volumes", label: "Volumes" },
  { value: "chapters", label: "Chapitres" },
  { value: "titleRomaji", label: "Titre (A-Z)" },
  { value: "startYear", label: "Année de début" },
  { value: "updatedAt", label: "Mise à jour" },
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-100 rounded-xl px-5 py-4">
      <p className="text-xs text-black/50 uppercase tracking-wide font-medium mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-black">{value}</p>
    </div>
  );
}

interface Filters extends ListCatalogParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "",
  genre: "",
  author: "",
  minVolumes: undefined,
  maxVolumes: undefined,
  minScore: undefined,
  maxScore: undefined,
  includeAdult: false,
  sortBy: "popularity",
  sortOrder: "desc",
};

export default function AdminMangaPage() {
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [catalog, setCatalog] = useState<PaginatedManga | null>(null);

  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
  const [importingFull, setImportingFull] = useState(false);
  const [syncingAllVolumes, setSyncingAllVolumes] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasRunningJob = jobs.some(
    (j) => j.status === "RUNNING" || j.status === "PENDING",
  );
  const hasRunningFull = jobs.some(
    (j) =>
      j.type === "FULL" && (j.status === "RUNNING" || j.status === "PENDING"),
  );

  const loadStats = useCallback(async () => {
    try {
      const data = await mangaService.getCatalogStats();
      setStats(data);
    } catch {
      /* ignore */
    }
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      const data = await mangaService.listImports();
      setJobs(data);
      return data;
    } catch {
      return [];
    }
  }, []);

  const loadCatalog = useCallback(async (p: number, f: Filters) => {
    setLoadingCatalog(true);
    try {
      const data = await mangaService.listCatalog({
        page: p,
        limit: 24,
        search: f.search || undefined,
        status: f.status || undefined,
        genre: f.genre || undefined,
        author: f.author || undefined,
        minVolumes: f.minVolumes,
        maxVolumes: f.maxVolumes,
        minScore: f.minScore !== undefined ? f.minScore * 10 : undefined,
        maxScore: f.maxScore !== undefined ? f.maxScore * 10 : undefined,
        includeAdult: f.includeAdult,
        sortBy: f.sortBy,
        sortOrder: f.sortOrder,
      } as Record<string, unknown>);
      setCatalog(data);
    } catch {
      /* ignore */
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
    void loadJobs();
    void loadCatalog(1, DEFAULT_FILTERS);
  }, [loadStats, loadJobs, loadCatalog]);

  // Polling
  useEffect(() => {
    if (hasRunningJob) {
      pollingRef.current = setInterval(async () => {
        const updated = await loadJobs();
        const nowRunning = updated.some(
          (j) => j.status === "RUNNING" || j.status === "PENDING",
        );
        if (!nowRunning) {
          void loadStats();
          void loadCatalog(page, filters);
          const finished = updated.find(
            (j) =>
              j.status === "COMPLETED" &&
              jobs.some((old) => old.id === j.id && old.status !== "COMPLETED"),
          );
          if (finished) {
            toast.success(
              `Import terminé : ${finished.totalImported} importés, ${finished.totalUpdated} mis à jour`,
            );
          }
        }
        if (selectedJob) {
          const refreshed = updated.find((j) => j.id === selectedJob.id);
          if (refreshed) setSelectedJob(refreshed);
        }
      }, POLL_INTERVAL_MS);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [hasRunningJob]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search/filter changes
  const applyFilters = useCallback(
    (newFilters: Filters, resetPage = true) => {
      setFilters(newFilters);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const p = resetPage ? 1 : page;
        if (resetPage) setPage(1);
        void loadCatalog(p, newFilters);
      }, DEBOUNCE_MS);
    },
    [loadCatalog, page],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    applyFilters({ ...filters, [key]: value });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void loadCatalog(newPage, filters);
  };

  const resetFilters = () => {
    setPage(1);
    applyFilters(DEFAULT_FILTERS);
  };

  const activeFilterCount = [
    filters.status,
    filters.genre,
    filters.author,
    filters.minVolumes !== undefined,
    filters.maxVolumes !== undefined,
    filters.minScore !== undefined,
    filters.maxScore !== undefined,
    filters.includeAdult,
  ].filter(Boolean).length;

  const handleImportFull = async () => {
    setImportingFull(true);
    try {
      const job = await mangaService.triggerFull();
      setJobs((prev) => [job, ...prev]);
      toast.success("Import complet lancé");
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response
        ?.status;
      if (status === 409) {
        toast.error("Un import complet est déjà en cours");
      } else {
        toast.error("Impossible de lancer l'import");
      }
    } finally {
      setImportingFull(false);
    }
  };

  const handleCancelImport = async (jobId: string) => {
    try {
      await mangaService.cancelImport(jobId);
      await loadJobs();
      toast.success("Import annulé");
    } catch {
      toast.error("Impossible d'annuler l'import");
    }
  };

  const handleSyncAllVolumes = async () => {
    setSyncingAllVolumes(true);
    try {
      const job = await mangaService.syncAllVolumes();
      setJobs((prev) => [job, ...prev]);
      toast.success("Synchronisation des volumes lancée");
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response
        ?.status;
      if (status === 409) {
        toast.error("Une synchronisation de volumes est déjà en cours");
      } else {
        toast.error("Impossible de lancer la synchronisation");
      }
    } finally {
      setSyncingAllVolumes(false);
    }
  };

  const lastImportLabel = stats?.lastImportAt
    ? formatDistanceToNow(new Date(stats.lastImportAt), {
        addSuffix: true,
        locale: fr,
      })
    : "jamais";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Catalogue Manga</h1>
        <p className="text-sm text-black/50 mt-1">
          Importez et gérez la base de référence des mangas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Mangas importés" value={stats?.total ?? 0} />
        <StatCard label="Dernier import" value={lastImportLabel} />
        <StatCard
          label="En cours de publication"
          value={stats?.byStatus?.["PUBLISHING"] ?? 0}
        />
      </div>

      {/* Import buttons */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <button
            onClick={handleImportFull}
            disabled={importingFull || hasRunningFull}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-black text-sm rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={15} />
            {hasRunningFull
              ? "Import en cours…"
              : importingFull
                ? "Lancement…"
                : "Importer tout le catalogue"}
          </button>
          {!hasRunningFull && (
            <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-black text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10">
              Cela peut prendre plusieurs minutes
            </div>
          )}
        </div>

        <button
          onClick={handleSyncAllVolumes}
          disabled={syncingAllVolumes}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-black text-sm rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BookMarked size={15} />
          {syncingAllVolumes ? "Lancement…" : "Sync volumes (tous)"}
        </button>
      </div>

      {/* Import history */}
      <div>
        <h2 className="text-base font-semibold mb-4">Historique des imports</h2>
        <ImportJobTable
          jobs={jobs}
          onRowClick={setSelectedJob}
          onCancel={handleCancelImport}
        />
      </div>

      {/* Catalog */}
      <div>
        <h2 className="text-base font-semibold mb-4">Catalogue</h2>

        {/* Filters bar */}
        <div className="space-y-3 mb-6">
          {/* Row 1: search + sort + advanced toggle */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
              />
              <input
                type="text"
                placeholder="Titre, auteur…"
                value={filters.search ?? ""}
                onChange={(e) => setFilter("search", e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <select
              value={filters.status ?? ""}
              onChange={(e) =>
                setFilter("status", e.target.value as MangaStatus | "")
              }
              className="px-3 py-2 text-sm border border-black/10 rounded-lg bg-white focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy ?? "popularity"}
              onChange={(e) => setFilter("sortBy", e.target.value)}
              className="px-3 py-2 text-sm border border-black/10 rounded-lg bg-white focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                setFilter(
                  "sortOrder",
                  filters.sortOrder === "desc" ? "asc" : "desc",
                )
              }
              className="px-3 py-2 text-sm border border-black/10 rounded-lg bg-white hover:bg-zinc-50 transition-colors"
              title={filters.sortOrder === "desc" ? "Décroissant" : "Croissant"}
            >
              {filters.sortOrder === "desc" ? "↓" : "↑"}
            </button>

            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                showAdvanced || activeFilterCount > 0
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white hover:bg-zinc-50"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filtres avancés
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5 font-medium">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={13} />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Row 2: advanced filters */}
          {showAdvanced && (
            <div className="bg-zinc-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-black/50 block mb-1.5 font-medium">
                  Auteur
                </label>
                <input
                  type="text"
                  placeholder="Nom d'auteur"
                  value={filters.author ?? ""}
                  onChange={(e) => setFilter("author", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="text-xs text-black/50 block mb-1.5 font-medium">
                  Genre
                </label>
                <input
                  type="text"
                  placeholder="Action, Romance…"
                  value={filters.genre ?? ""}
                  onChange={(e) => setFilter("genre", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="text-xs text-black/50 block mb-1.5 font-medium">
                  Volumes min.
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="ex: 5"
                  value={filters.minVolumes ?? ""}
                  onChange={(e) =>
                    setFilter(
                      "minVolumes",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="text-xs text-black/50 block mb-1.5 font-medium">
                  Volumes max.
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="ex: 30"
                  value={filters.maxVolumes ?? ""}
                  onChange={(e) =>
                    setFilter(
                      "maxVolumes",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="text-xs text-black/50 block mb-1.5 font-medium">
                  Score min. (/10)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="ex: 7"
                  value={filters.minScore ?? ""}
                  onChange={(e) =>
                    setFilter(
                      "minScore",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="text-xs text-black/50 block mb-1.5 font-medium">
                  Score max. (/10)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="ex: 9"
                  value={filters.maxScore ?? ""}
                  onChange={(e) =>
                    setFilter(
                      "maxScore",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="includeAdult"
                  checked={filters.includeAdult ?? false}
                  onChange={(e) => setFilter("includeAdult", e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="includeAdult"
                  className="text-sm text-black/70 cursor-pointer"
                >
                  Inclure 18+
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        {loadingCatalog ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-zinc-100 animate-pulse aspect-[2/3]"
              />
            ))}
          </div>
        ) : catalog && catalog.data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {catalog.data.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/40 py-12 text-center">
            {stats?.total === 0
              ? "Aucun manga importé. Lancez un import pour commencer."
              : "Aucun manga trouvé avec ces filtres."}
          </p>
        )}

        {/* Pagination */}
        {catalog && catalog.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!catalog.meta.hasPreviousPage}
              className="p-2 rounded-lg border border-black/10 disabled:opacity-30 hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-black/50">
              Page {catalog.meta.page} / {catalog.meta.totalPages}
              <span className="ml-2 text-black/30">
                ({catalog.meta.total.toLocaleString("fr-FR")} mangas)
              </span>
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!catalog.meta.hasNextPage}
              className="p-2 rounded-lg border border-black/10 disabled:opacity-30 hover:bg-zinc-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Sidebars */}
      {selectedJob && (
        <ImportJobSidebar
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

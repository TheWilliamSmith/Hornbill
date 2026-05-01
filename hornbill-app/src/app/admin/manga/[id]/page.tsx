"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Star,
  Heart,
  Users,
  BookOpen,
  Check,
  X,
  Pencil,
  RefreshCw,
  ImageDown,
  Zap,
} from "lucide-react";
import { mangaService } from "@/services/manga.service";
import type { MangaReference, MangaVolume } from "@/types/manga.type";
import toast from "react-hot-toast";

const STATUS_LABELS: Record<string, string> = {
  PUBLISHING: "En cours",
  FINISHED: "Terminé",
  CANCELLED: "Annulé",
  HIATUS: "Pause",
  NOT_YET_RELEASED: "À venir",
};

const STATUS_COLORS: Record<string, string> = {
  PUBLISHING: "bg-green-100 text-green-700",
  FINISHED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-600",
  HIATUS: "bg-yellow-100 text-yellow-700",
  NOT_YET_RELEASED: "bg-zinc-100 text-zinc-600",
};

const MONTHS = [
  "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin",
  "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc.",
];

function formatDate(year?: number | null, month?: number | null, day?: number | null) {
  if (!year) return null;
  const parts: string[] = [];
  if (day) parts.push(String(day).padStart(2, "0"));
  if (month) parts.push(MONTHS[month - 1]);
  parts.push(String(year));
  return parts.join(" ");
}

interface VolumeCardProps {
  volume: MangaVolume;
  onUpdated: (v: MangaVolume) => void;
}

function VolumeCard({ volume, onUpdated }: VolumeCardProps) {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    coverImageUrl: volume.coverImageUrl ?? "",
    title: volume.title ?? "",
    isbn: volume.isbn ?? "",
    releaseYear: volume.releaseYear ? String(volume.releaseYear) : "",
    releaseMonth: volume.releaseMonth ? String(volume.releaseMonth) : "",
    notes: volume.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await mangaService.updateVolume(volume.id, {
        coverImageUrl: fields.coverImageUrl || undefined,
        title: fields.title || undefined,
        isbn: fields.isbn || undefined,
        releaseYear: fields.releaseYear ? Number(fields.releaseYear) : undefined,
        releaseMonth: fields.releaseMonth ? Number(fields.releaseMonth) : undefined,
        notes: fields.notes || undefined,
      });
      onUpdated(updated);
      setEditing(false);
      toast.success(`Tome ${volume.volumeNumber} mis à jour`);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="bg-white border border-black/10 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-black/60">Tome {volume.volumeNumber}</span>
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1 rounded hover:bg-green-50 text-green-600 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-zinc-100 text-zinc-400">
              <X size={14} />
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="URL de la couverture"
          value={fields.coverImageUrl}
          onChange={(e) => setFields((f) => ({ ...f, coverImageUrl: e.target.value }))}
          className="text-xs px-2 py-1.5 border border-black/10 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-black/20"
        />
        <input
          type="text"
          placeholder="Titre du tome (optionnel)"
          value={fields.title}
          onChange={(e) => setFields((f) => ({ ...f, title: e.target.value }))}
          className="text-xs px-2 py-1.5 border border-black/10 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-black/20"
        />
        <input
          type="text"
          placeholder="ISBN"
          value={fields.isbn}
          onChange={(e) => setFields((f) => ({ ...f, isbn: e.target.value }))}
          className="text-xs px-2 py-1.5 border border-black/10 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-black/20"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Année"
            value={fields.releaseYear}
            onChange={(e) => setFields((f) => ({ ...f, releaseYear: e.target.value }))}
            className="text-xs px-2 py-1.5 border border-black/10 rounded-lg w-full focus:outline-none"
          />
          <select
            value={fields.releaseMonth}
            onChange={(e) => setFields((f) => ({ ...f, releaseMonth: e.target.value }))}
            className="text-xs px-2 py-1.5 border border-black/10 rounded-lg w-full focus:outline-none"
          >
            <option value="">Mois</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Notes…"
          value={fields.notes}
          onChange={(e) => setFields((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="text-xs px-2 py-1.5 border border-black/10 rounded-lg w-full resize-none focus:outline-none focus:ring-1 focus:ring-black/20"
        />
      </div>
    );
  }

  const releaseDate = (() => {
    if (!volume.releaseYear) return null;
    const parts: string[] = [];
    if (volume.releaseMonth) parts.push(MONTHS[volume.releaseMonth - 1]);
    parts.push(String(volume.releaseYear));
    return parts.join(" ");
  })();

  return (
    <div className="group bg-white border border-black/5 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="relative w-full aspect-[2/3] bg-zinc-100 overflow-hidden">
        {volume.coverImageUrl ? (
          <Image
            src={volume.coverImageUrl}
            alt={`Tome ${volume.volumeNumber}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-black/20">
            <BookOpen size={24} />
            <span className="text-xs">Pas de couverture</span>
          </div>
        )}
        {/* Volume number badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          #{volume.volumeNumber}
        </div>
        {/* Edit button on hover */}
        <button
          onClick={() => setEditing(true)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white p-1.5 rounded-lg shadow"
        >
          <Pencil size={12} />
        </button>
      </div>

      {/* Info */}
      <div className="p-2 space-y-0.5">
        {volume.title && (
          <p className="text-xs font-medium leading-tight line-clamp-1">{volume.title}</p>
        )}
        {releaseDate && <p className="text-xs text-black/40">{releaseDate}</p>}
        {volume.isbn && <p className="text-xs text-black/30 font-mono truncate">{volume.isbn}</p>}
      </div>
    </div>
  );
}

export default function AdminMangaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [manga, setManga] = useState<MangaReference | null>(null);
  const [volumes, setVolumes] = useState<MangaVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVolumes, setLoadingVolumes] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingCovers, setSyncingCovers] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);

  const loadManga = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mangaService.getManga(id);
      setManga(data);
    } catch {
      toast.error("Manga introuvable");
      router.push("/admin/manga");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const loadVolumes = useCallback(async () => {
    setLoadingVolumes(true);
    try {
      const data = await mangaService.getVolumes(id);
      setVolumes(data);
    } catch {
      /* ignore */
    } finally {
      setLoadingVolumes(false);
    }
  }, [id]);

  useEffect(() => {
    void loadManga();
    void loadVolumes();
  }, [loadManga, loadVolumes]);

  const handleVolumeUpdated = (updated: MangaVolume) => {
    setVolumes((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleSyncVolumes = async () => {
    setSyncing(true);
    try {
      const result = await mangaService.syncVolumes(id);
      toast.success(`${result.volumeCount} tome${result.volumeCount > 1 ? "s" : ""} synchronisé${result.volumeCount > 1 ? "s" : ""} depuis AniList`);
      // Reload volumes and manga metadata
      const [updatedManga, updatedVolumes] = await Promise.all([
        mangaService.getManga(id),
        mangaService.getVolumes(id),
      ]);
      setManga(updatedManga);
      setVolumes(updatedVolumes);
    } catch {
      toast.error("Erreur lors de la synchronisation");
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const volumeResult = await mangaService.syncVolumes(id);
      toast.success(`${volumeResult.volumeCount} tome${volumeResult.volumeCount > 1 ? "s" : ""} synchronisé${volumeResult.volumeCount > 1 ? "s" : ""}`);

      const coverResult = await mangaService.syncCovers(id);
      if (coverResult.found === 0) {
        toast.error("Aucune couverture trouvée sur MangaDex");
      } else {
        toast.success(`${coverResult.updated} couverture${coverResult.updated > 1 ? "s" : ""} importée${coverResult.updated > 1 ? "s" : ""}`);
      }

      const [updatedManga, updatedVolumes] = await Promise.all([
        mangaService.getManga(id),
        mangaService.getVolumes(id),
      ]);
      setManga(updatedManga);
      setVolumes(updatedVolumes);
    } catch {
      toast.error("Erreur lors de la synchronisation complète");
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncCovers = async () => {
    setSyncingCovers(true);
    try {
      const result = await mangaService.syncCovers(id);
      if (result.found === 0) {
        toast.error("Aucune couverture trouvée sur MangaDex pour ce manga");
      } else {
        toast.success(`${result.updated} couverture${result.updated > 1 ? "s" : ""} importée${result.updated > 1 ? "s" : ""} depuis MangaDex`);
        const updatedVolumes = await mangaService.getVolumes(id);
        setVolumes(updatedVolumes);
      }
    } catch {
      toast.error("Erreur lors de l'import des couvertures");
    } finally {
      setSyncingCovers(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-black/20" />
      </div>
    );
  }

  if (!manga) return null;

  const startDate = formatDate(manga.startYear, manga.startMonth, manga.startDay);
  const endDate = formatDate(manga.endYear, manga.endMonth, manga.endDay);
  const coverCount = volumes.filter((v) => v.coverImageUrl).length;

  return (
    <div className="space-y-8">
      {/* Back */}
      <div>
        <Link
          href="/admin/manga"
          className="inline-flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          Retour au catalogue admin
        </Link>
      </div>

      {/* Banner */}
      <div className="relative w-full h-44 sm:h-56 bg-zinc-100 rounded-2xl overflow-hidden">
        {manga.bannerImageUrl ? (
          <Image src={manga.bannerImageUrl} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Cover + title */}
      <div className="flex items-end gap-5 -mt-14 sm:-mt-16 px-2 mb-6">
        <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden shadow-xl border-2 border-white shrink-0">
          {manga.coverImageUrl ? (
            <Image src={manga.coverImageUrl} alt={manga.titleRomaji} fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 bg-zinc-200" />
          )}
        </div>
        <div className="flex-1 min-w-0 pb-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[manga.status]}`}>
              {STATUS_LABELS[manga.status]}
            </span>
            {manga.isAdult && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-medium">18+</span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 font-mono">
              AniList #{manga.anilistId}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">{manga.titleRomaji}</h1>
          {manga.titleEnglish && manga.titleEnglish !== manga.titleRomaji && (
            <p className="text-sm text-black/50">{manga.titleEnglish}</p>
          )}
          {manga.titleNative && <p className="text-xs text-black/30">{manga.titleNative}</p>}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Manga metadata */}
        <div className="lg:col-span-1 space-y-6">
          {/* Score/popularity */}
          {(manga.averageScore != null || manga.popularity != null || manga.favourites != null) && (
            <div className="grid grid-cols-1 gap-3">
              {manga.averageScore != null && (
                <div className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Star size={16} className="text-yellow-500 shrink-0" />
                  <div>
                    <p className="text-xs text-black/40">Score AniList</p>
                    <p className="font-semibold">{(manga.averageScore / 10).toFixed(1)}/10 ({manga.averageScore}/100)</p>
                  </div>
                </div>
              )}
              {manga.popularity != null && (
                <div className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Users size={16} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs text-black/40">Popularité</p>
                    <p className="font-semibold">{manga.popularity.toLocaleString("fr-FR")}</p>
                  </div>
                </div>
              )}
              {manga.favourites != null && (
                <div className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Heart size={16} className="text-red-400 shrink-0" />
                  <div>
                    <p className="text-xs text-black/40">Favoris</p>
                    <p className="font-semibold">{manga.favourites.toLocaleString("fr-FR")}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="bg-zinc-50 rounded-2xl p-5 space-y-3">
            {manga.authorName && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">Auteur</p>
                <p className="text-sm font-medium">{manga.authorName}</p>
              </div>
            )}
            {manga.artistName && manga.artistName !== manga.authorName && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">Artiste</p>
                <p className="text-sm font-medium">{manga.artistName}</p>
              </div>
            )}
            {manga.volumes != null && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">Volumes</p>
                <p className="text-sm font-medium">{manga.volumes} tomes</p>
              </div>
            )}
            {manga.chapters != null && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">Chapitres</p>
                <p className="text-sm font-medium">{manga.chapters}</p>
              </div>
            )}
            {startDate && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">Début</p>
                <p className="text-sm font-medium">{startDate}</p>
              </div>
            )}
            {endDate && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">Fin</p>
                <p className="text-sm font-medium">{endDate}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">Importé le</p>
              <p className="text-sm font-medium">{new Date(manga.importedAt).toLocaleDateString("fr-FR")}</p>
            </div>
            <div>
              <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">Mise à jour source</p>
              <p className="text-sm font-medium">{new Date(manga.updatedFromSourceAt).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          {/* Genres */}
          {manga.genres.length > 0 && (
            <div>
              <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-2">Genres</p>
              <div className="flex flex-wrap gap-1.5">
                {manga.genres.map((g) => (
                  <span key={g} className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full">{g}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {manga.description && (
            <div>
              <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-2">Synopsis</p>
              <div
                className="text-sm text-black/60 leading-relaxed [&_br]:block [&_br]:mt-2"
                dangerouslySetInnerHTML={{ __html: manga.description }}
              />
            </div>
          )}
        </div>

        {/* Right: Volumes */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold">Volumes</h2>
              <p className="text-xs text-black/40 mt-0.5">
                {volumes.length} tomes · {coverCount} couverture{coverCount > 1 ? "s" : ""} renseignée{coverCount > 1 ? "s" : ""}
                {volumes.length > 0 && coverCount < volumes.length && (
                  <span className="text-amber-500 ml-1">
                    · {volumes.length - coverCount} sans image
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncCovers}
                disabled={syncingCovers || syncing || syncingAll}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-zinc-100 text-black rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Importer les couvertures depuis MangaDex"
              >
                {syncingCovers ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ImageDown size={14} />
                )}
                {syncingCovers ? "Import en cours…" : "Couvertures MangaDex"}
              </button>
              <button
                onClick={handleSyncVolumes}
                disabled={syncing || syncingCovers || syncingAll}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-zinc-100 text-black rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                {syncing ? "Synchronisation…" : "Sync AniList"}
              </button>
              <button
                onClick={handleSyncAll}
                disabled={syncingAll || syncing || syncingCovers}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Synchroniser les volumes puis les couvertures"
              >
                {syncingAll ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} />
                )}
                {syncingAll ? "Synchronisation…" : "Sync complet"}
              </button>
            </div>
          </div>

          {loadingVolumes ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-zinc-100 animate-pulse aspect-[2/3]" />
              ))}
            </div>
          ) : volumes.length === 0 ? (
            <div className="text-center py-16 text-black/30 text-sm">
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              Aucun volume importé pour ce manga.
              <p className="text-xs mt-1 text-black/20">Les volumes sont créés lors de l&apos;import AniList.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {volumes.map((v) => (
                <VolumeCard key={v.id} volume={v} onUpdated={handleVolumeUpdated} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

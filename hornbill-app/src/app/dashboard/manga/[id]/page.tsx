"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Star,
  Heart,
  Users,
  BookOpen,
  BookMarked,
  Check,
} from "lucide-react";
import { mangaService } from "@/services/manga.service";
import type { UserMangaCollection, UserMangaStatus, MangaVolume } from "@/types/manga.type";
import toast from "react-hot-toast";

const STATUS_OPTIONS: Array<{ value: UserMangaStatus; label: string }> = [
  { value: "PLAN_TO_READ", label: "Planifié" },
  { value: "READING", label: "En train de lire" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "ON_HOLD", label: "En pause" },
  { value: "DROPPED", label: "Abandonné" },
];

const MANGA_STATUS_LABELS: Record<string, string> = {
  PUBLISHING: "En cours",
  FINISHED: "Terminé",
  CANCELLED: "Annulé",
  HIATUS: "Pause",
  NOT_YET_RELEASED: "À venir",
};

const MANGA_STATUS_COLORS: Record<string, string> = {
  PUBLISHING: "bg-green-100 text-green-700",
  FINISHED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-600",
  HIATUS: "bg-yellow-100 text-yellow-700",
  NOT_YET_RELEASED: "bg-zinc-100 text-zinc-600",
};

function formatDate(
  year?: number | null,
  month?: number | null,
  day?: number | null,
) {
  if (!year) return null;
  const parts = [day, month, year].filter(Boolean);
  return parts.join("/");
}

interface VolumeCardProps {
  volume: MangaVolume;
  owned: boolean;
  read: boolean;
  onToggleOwned: () => void;
  onToggleRead: () => void;
}

function VolumeCard({ volume, owned, read, onToggleOwned, onToggleRead }: VolumeCardProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Cover */}
      <div className="relative w-full aspect-[2/3] bg-zinc-100 rounded-lg overflow-hidden">
        {volume.coverImageUrl ? (
          <Image
            src={volume.coverImageUrl}
            alt={`Tome ${volume.volumeNumber}`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={20} className="text-black/20" />
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          {volume.volumeNumber}
        </span>
      </div>

      {/* Owned / Read toggles */}
      <div className="flex gap-1">
        <button
          onClick={onToggleOwned}
          title="Possédé"
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-xs font-medium transition-colors ${
            owned
              ? "bg-black text-white"
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          }`}
        >
          <BookMarked size={10} />
          {owned && <Check size={10} />}
        </button>
        <button
          onClick={onToggleRead}
          title="Lu"
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-xs font-medium transition-colors ${
            read
              ? "bg-blue-500 text-white"
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          }`}
        >
          <BookOpen size={10} />
          {read && <Check size={10} />}
        </button>
      </div>
    </div>
  );
}

export default function MangaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [entry, setEntry] = useState<UserMangaCollection | null>(null);
  const [volumes, setVolumes] = useState<MangaVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<UserMangaStatus>("PLAN_TO_READ");
  const [ownedVolumes, setOwnedVolumes] = useState<number[]>([]);
  const [readVolumes, setReadVolumes] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadEntry = useCallback(async () => {
    setLoading(true);
    try {
      const [data, vols] = await Promise.all([
        mangaService.getCollectionEntry(id),
        mangaService.getCollectionVolumes(id),
      ]);
      setEntry(data);
      setStatus(data.status);
      setOwnedVolumes(data.ownedVolumes);
      setReadVolumes(data.readVolumes);
      setVolumes(vols);
    } catch {
      toast.error("Manga introuvable");
      router.push("/dashboard/manga");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void loadEntry();
  }, [loadEntry]);

  const handleSave = async () => {
    if (!entry) return;
    setSaving(true);
    try {
      const updated = await mangaService.updateCollectionEntry(entry.id, {
        status,
        ownedVolumes,
        readVolumes,
      });
      setEntry(updated);
      toast.success("Collection mise à jour");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!entry) return;
    setRemoving(true);
    try {
      await mangaService.removeFromCollection(entry.id);
      toast.success(
        `${entry.mangaReference.titleRomaji} retiré de votre collection`,
      );
      router.push("/dashboard/manga");
    } catch {
      toast.error("Erreur lors de la suppression");
      setRemoving(false);
    }
  };

  const toggleOwned = (vol: number) => {
    setOwnedVolumes((prev) =>
      prev.includes(vol) ? prev.filter((v) => v !== vol) : [...prev, vol].sort((a, b) => a - b),
    );
  };

  const toggleRead = (vol: number) => {
    setReadVolumes((prev) =>
      prev.includes(vol) ? prev.filter((v) => v !== vol) : [...prev, vol].sort((a, b) => a - b),
    );
  };

  const markAllOwned = () => {
    const all = volumes.map((v) => v.volumeNumber);
    setOwnedVolumes(all);
  };

  const markAllRead = () => {
    const all = volumes.map((v) => v.volumeNumber);
    setReadVolumes(all);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-black/20" />
      </div>
    );
  }

  if (!entry) return null;

  const manga = entry.mangaReference;
  const startDate = formatDate(manga.startYear, manga.startMonth, manga.startDay);
  const endDate = formatDate(manga.endYear, manga.endMonth, manga.endDay);

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard/manga"
          className="inline-flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          Retour à ma collection
        </Link>
      </div>

      {/* Banner */}
      <div className="relative w-full h-40 sm:h-52 bg-zinc-100 rounded-2xl overflow-hidden">
        {manga.bannerImageUrl ? (
          <Image
            src={manga.bannerImageUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Cover + Title */}
      <div className="flex items-end gap-5 -mt-14 sm:-mt-16 px-2 mb-6">
        <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden shadow-xl border-2 border-white shrink-0">
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
        <div className="flex-1 min-w-0 pb-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${MANGA_STATUS_COLORS[manga.status]}`}
            >
              {MANGA_STATUS_LABELS[manga.status]}
            </span>
            {manga.isAdult && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                18+
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">
            {manga.titleRomaji}
          </h1>
          {manga.titleEnglish && manga.titleEnglish !== manga.titleRomaji && (
            <p className="text-sm text-black/50 mt-0.5">{manga.titleEnglish}</p>
          )}
          {manga.titleNative && (
            <p className="text-xs text-black/30 mt-0.5">{manga.titleNative}</p>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Manga details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score / Popularity / Favorites */}
          {(manga.averageScore != null ||
            manga.popularity != null ||
            manga.favourites != null) && (
            <div className="grid grid-cols-3 gap-3">
              {manga.averageScore != null && (
                <div className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Star size={16} className="text-yellow-500 shrink-0" />
                  <div>
                    <p className="text-xs text-black/40">Score</p>
                    <p className="font-semibold text-sm">
                      {(manga.averageScore / 10).toFixed(1)}/10
                    </p>
                  </div>
                </div>
              )}
              {manga.popularity != null && (
                <div className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Users size={16} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs text-black/40">Popularité</p>
                    <p className="font-semibold text-sm">
                      {manga.popularity.toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              )}
              {manga.favourites != null && (
                <div className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Heart size={16} className="text-red-400 shrink-0" />
                  <div>
                    <p className="text-xs text-black/40">Favoris</p>
                    <p className="font-semibold text-sm">
                      {manga.favourites.toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info grid */}
          <div className="bg-zinc-50 rounded-2xl p-5 grid grid-cols-2 gap-x-8 gap-y-4">
            {manga.authorName && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">
                  Auteur
                </p>
                <p className="text-sm font-medium">{manga.authorName}</p>
              </div>
            )}
            {manga.artistName && manga.artistName !== manga.authorName && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">
                  Artiste
                </p>
                <p className="text-sm font-medium">{manga.artistName}</p>
              </div>
            )}
            {manga.volumes != null && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">
                  Volumes
                </p>
                <p className="text-sm font-medium">{manga.volumes} tomes</p>
              </div>
            )}
            {manga.chapters != null && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">
                  Chapitres
                </p>
                <p className="text-sm font-medium">{manga.chapters}</p>
              </div>
            )}
            {startDate && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">
                  Début
                </p>
                <p className="text-sm font-medium">{startDate}</p>
              </div>
            )}
            {endDate && (
              <div>
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-0.5">
                  Fin
                </p>
                <p className="text-sm font-medium">{endDate}</p>
              </div>
            )}
          </div>

          {/* Genres */}
          {manga.genres.length > 0 && (
            <div>
              <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-2">
                Genres
              </p>
              <div className="flex flex-wrap gap-2">
                {manga.genres.map((g) => (
                  <span
                    key={g}
                    className="text-sm px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {manga.description && (
            <div>
              <p className="text-xs text-black/40 uppercase tracking-wide font-medium mb-2">
                Synopsis
              </p>
              <div
                className="text-sm text-black/65 leading-relaxed [&_br]:block [&_br]:mt-2"
                dangerouslySetInnerHTML={{ __html: manga.description }}
              />
            </div>
          )}

          {/* Volumes */}
          {volumes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-black/40 uppercase tracking-wide font-medium">
                  Tomes ({volumes.length})
                </p>
                <div className="flex gap-3 text-xs text-black/50">
                  <span className="flex items-center gap-1">
                    <BookMarked size={11} className="text-black" /> Possédé
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} className="text-blue-500" /> Lu
                  </span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-2 mb-4">
                <div>
                  <div className="flex justify-between text-xs text-black/40 mb-1">
                    <span className="flex items-center gap-1"><BookMarked size={10} /> Possédés</span>
                    <span>{ownedVolumes.length}/{volumes.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all"
                      style={{ width: `${Math.min(100, (ownedVolumes.length / volumes.length) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-black/40 mb-1">
                    <span className="flex items-center gap-1"><BookOpen size={10} /> Lus</span>
                    <span>{readVolumes.length}/{volumes.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (readVolumes.length / volumes.length) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={markAllOwned}
                  className="text-xs text-black/50 hover:text-black underline-offset-2 hover:underline transition-colors"
                >
                  Tout posséder
                </button>
                <button
                  onClick={markAllRead}
                  className="text-xs text-black/50 hover:text-black underline-offset-2 hover:underline transition-colors"
                >
                  Tout lire
                </button>
                <button
                  onClick={() => { setOwnedVolumes([]); setReadVolumes([]); }}
                  className="text-xs text-black/50 hover:text-black underline-offset-2 hover:underline transition-colors"
                >
                  Tout effacer
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {volumes.map((vol) => (
                  <VolumeCard
                    key={vol.id}
                    volume={vol}
                    owned={ownedVolumes.includes(vol.volumeNumber)}
                    read={readVolumes.includes(vol.volumeNumber)}
                    onToggleOwned={() => toggleOwned(vol.volumeNumber)}
                    onToggleRead={() => toggleRead(vol.volumeNumber)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Collection editor */}
        <div className="space-y-4">
          <div className="bg-zinc-50 rounded-2xl p-5 space-y-5">
            <p className="text-xs font-medium text-black/50 uppercase tracking-wide">
              Ma collection
            </p>

            {/* Status */}
            <div>
              <label className="text-xs text-black/40 block mb-1.5">
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

            {/* Summary */}
            {volumes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-black/50 flex items-center gap-1.5">
                    <BookMarked size={13} /> Possédés
                  </span>
                  <span className="font-medium">{ownedVolumes.length} / {volumes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-black/50 flex items-center gap-1.5">
                    <BookOpen size={13} /> Lus
                  </span>
                  <span className="font-medium">{readVolumes.length} / {volumes.length}</span>
                </div>
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm rounded-xl hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Sauvegarder
            </button>
          </div>

          {/* Remove */}
          {confirmDelete ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
              <p className="text-sm text-red-700 font-medium">
                Retirer ce manga de votre collection ?
              </p>
              <p className="text-xs text-red-400">
                Votre progression sera perdue.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 px-4 py-2 text-sm border border-black/10 bg-white rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {removing && <Loader2 size={14} className="animate-spin" />}
                  Confirmer
                </button>
              </div>
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



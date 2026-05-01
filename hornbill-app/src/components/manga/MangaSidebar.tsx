"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { MangaReference } from "@/types/manga.type";

interface MangaSidebarProps {
  manga: MangaReference;
  onClose: () => void;
}

const STATUS_LABELS: Record<MangaReference["status"], string> = {
  PUBLISHING: "En cours",
  FINISHED: "Terminé",
  CANCELLED: "Annulé",
  HIATUS: "Pause",
  NOT_YET_RELEASED: "À venir",
};

function formatDate(
  year?: number | null,
  month?: number | null,
  day?: number | null,
) {
  if (!year) return null;
  const parts = [year, month, day].filter(Boolean);
  return parts.join("/");
}

export default function MangaSidebar({ manga, onClose }: MangaSidebarProps) {
  const showEnglish =
    manga.titleEnglish && manga.titleEnglish !== manga.titleRomaji;
  const startDate = formatDate(
    manga.startYear,
    manga.startMonth,
    manga.startDay,
  );
  const endDate = formatDate(manga.endYear, manga.endMonth, manga.endDay);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-lg h-full flex flex-col shadow-xl overflow-y-auto">
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

        <div className="p-6 space-y-6">
          {/* Cover + basic info */}
          <div className="flex gap-5">
            <div className="relative w-32 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-100 shrink-0">
              {manga.coverImageUrl ? (
                <Image
                  src={manga.coverImageUrl}
                  alt={manga.titleRomaji}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-black/20 text-xs">
                  No cover
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <p className="font-semibold leading-tight">{manga.titleRomaji}</p>
              {showEnglish && (
                <p className="text-sm text-black/50">{manga.titleEnglish}</p>
              )}
              {manga.titleNative && (
                <p className="text-sm text-black/40">{manga.titleNative}</p>
              )}
              {manga.isAdult && (
                <span className="inline-block bg-black text-white text-xs px-2 py-0.5 rounded font-medium">
                  18+
                </span>
              )}
            </div>
          </div>

          {/* Genres */}
          {manga.genres.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-black/50 uppercase tracking-wide mb-2">
                Genres
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {manga.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded-full"
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
              <h3 className="text-xs font-medium text-black/50 uppercase tracking-wide mb-2">
                Synopsis
              </h3>
              <div
                className="text-sm text-black/70 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: manga.description }}
              />
            </div>
          )}

          {/* Details */}
          <div>
            <h3 className="text-xs font-medium text-black/50 uppercase tracking-wide mb-3">
              Détails
            </h3>
            <div className="bg-zinc-50 rounded-xl px-4 divide-y divide-black/5">
              {[
                { label: "Status", value: STATUS_LABELS[manga.status] },
                { label: "Auteur", value: manga.authorName },
                { label: "Artiste", value: manga.artistName },
                { label: "Volumes", value: manga.volumes },
                { label: "Chapitres", value: manga.chapters },
                {
                  label: "Score moyen",
                  value: manga.averageScore
                    ? `${manga.averageScore}/100`
                    : null,
                },
                {
                  label: "Popularité",
                  value: manga.popularity?.toLocaleString(),
                },
                { label: "Favoris", value: manga.favourites?.toLocaleString() },
                { label: "Début", value: startDate },
                { label: "Fin", value: endDate },
              ]
                .filter(({ value }) => value !== null && value !== undefined)
                .map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2.5"
                  >
                    <span className="text-sm text-black/50">{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

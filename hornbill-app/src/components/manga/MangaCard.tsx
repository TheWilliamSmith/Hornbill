"use client";

import Image from "next/image";
import Link from "next/link";
import type { MangaReference } from "@/types/manga.type";

interface MangaCardProps {
  manga: MangaReference;
}

const STATUS_STYLES: Record<MangaReference["status"], string> = {
  PUBLISHING: "bg-green-50 text-green-700",
  FINISHED: "bg-zinc-100 text-zinc-600",
  CANCELLED: "bg-red-50 text-red-600",
  HIATUS: "bg-yellow-50 text-yellow-700",
  NOT_YET_RELEASED: "bg-blue-50 text-blue-600",
};

const STATUS_LABELS: Record<MangaReference["status"], string> = {
  PUBLISHING: "En cours",
  FINISHED: "Terminé",
  CANCELLED: "Annulé",
  HIATUS: "Pause",
  NOT_YET_RELEASED: "À venir",
};

export default function MangaCard({ manga }: MangaCardProps) {
  const showEnglish =
    manga.titleEnglish && manga.titleEnglish !== manga.titleRomaji;

  return (
    <Link
      href={`/admin/manga/${manga.id}`}
      className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-black/5 group block"
    >
      {/* Cover */}
      <div className="relative w-full aspect-[2/3] bg-zinc-100">
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
        {manga.isAdult && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            18+
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2">
            {manga.titleRomaji}
          </p>
          {showEnglish && (
            <p className="text-xs text-black/40 leading-tight mt-0.5 line-clamp-1">
              {manga.titleEnglish}
            </p>
          )}
        </div>

        {/* Genres */}
        {manga.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {manga.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-xs bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[manga.status]}`}
          >
            {STATUS_LABELS[manga.status]}
          </span>
          {manga.averageScore && (
            <span className="text-xs text-black/50 font-medium">
              {manga.averageScore}/100
            </span>
          )}
        </div>

        {(manga.volumes || manga.chapters) && (
          <p className="text-xs text-black/40">
            {manga.volumes ? `${manga.volumes} vol.` : ""}
            {manga.volumes && manga.chapters ? " · " : ""}
            {manga.chapters ? `${manga.chapters} ch.` : ""}
          </p>
        )}
      </div>
    </Link>
  );
}

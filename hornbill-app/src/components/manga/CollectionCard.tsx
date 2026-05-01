"use client";

import Image from "next/image";
import Link from "next/link";
import type { UserMangaCollection } from "@/types/manga.type";

interface Props {
  entry: UserMangaCollection;
}

const STATUS_STYLES: Record<string, string> = {
  PLAN_TO_READ: "bg-zinc-100 text-zinc-600",
  READING: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  ON_HOLD: "bg-yellow-50 text-yellow-700",
  DROPPED: "bg-red-50 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  PLAN_TO_READ: "Planifié",
  READING: "En lecture",
  COMPLETED: "Terminé",
  ON_HOLD: "En pause",
  DROPPED: "Abandonné",
};

export default function CollectionCard({ entry }: Props) {
  const manga = entry.mangaReference;
  const showEnglish =
    manga.titleEnglish && manga.titleEnglish !== manga.titleRomaji;
  const totalVolumes = manga.volumes;
  const ownedCount = entry.ownedVolumes.length;

  return (
    <Link
      href={`/dashboard/manga/${entry.id}`}
      className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-black/5 group block"
    >
      {/* Cover */}
      <div className="relative w-full aspect-[2/3] bg-zinc-100 overflow-hidden">
        {manga.coverImageUrl ? (
          <Image
            src={manga.coverImageUrl}
            alt={manga.titleRomaji}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-black/20 text-xs">
            No cover
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-6 bg-gradient-to-t from-black/60 to-transparent">
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[entry.status]}`}
          >
            {STATUS_LABELS[entry.status]}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="font-semibold text-sm leading-tight line-clamp-2">
          {manga.titleRomaji}
        </p>
        {showEnglish && (
          <p className="text-xs text-black/40 leading-tight line-clamp-1">
            {manga.titleEnglish}
          </p>
        )}

        {/* Volumes */}
        {(ownedCount > 0 || totalVolumes) && (
          <div>
            <div className="flex items-center justify-between text-xs text-black/50 mb-1">
              <span>
                {ownedCount} possédé{ownedCount > 1 ? "s" : ""}
              </span>
              {totalVolumes && <span>/ {totalVolumes}</span>}
            </div>
            {totalVolumes && (
              <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (ownedCount / totalVolumes) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

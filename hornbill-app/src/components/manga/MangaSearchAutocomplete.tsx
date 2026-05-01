"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Search, Loader2, CheckCircle2 } from "lucide-react";
import { mangaService } from "@/services/manga.service";
import type { MangaSearchResult } from "@/types/manga.type";

const DEBOUNCE_MS = 300;
const MIN_CHARS = 1;

const STATUS_LABELS: Record<string, string> = {
  PUBLISHING: "En cours",
  FINISHED: "Terminé",
  CANCELLED: "Annulé",
  HIATUS: "Pause",
  NOT_YET_RELEASED: "À venir",
};

interface Props {
  onSelect: (manga: MangaSearchResult) => void;
  placeholder?: string;
}

export default function MangaSearchAutocomplete({
  onSelect,
  placeholder = "Rechercher un manga…",
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MangaSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < MIN_CHARS) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await mangaService.searchManga(q.trim());
      setResults(data);
      setOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Close on click outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (manga: MangaSearchResult) => {
    setQuery("");
    setOpen(false);
    setResults([]);
    onSelect(manga);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 text-sm border border-black/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all"
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 animate-spin"
          />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-black/10 rounded-xl shadow-lg z-50 overflow-hidden">
          {results.length === 0 && !loading ? (
            <p className="px-4 py-3 text-sm text-black/40">
              Aucun résultat pour &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul>
              {results.map((manga, idx) => {
                const inCollection = manga.userCollections.length > 0;
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={manga.id}
                    onMouseDown={() => handleSelect(manga)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      isActive ? "bg-zinc-50" : "hover:bg-zinc-50"
                    }`}
                  >
                    {/* Cover thumbnail */}
                    <div className="relative w-8 h-12 rounded-md overflow-hidden bg-zinc-100 shrink-0">
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

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {manga.titleRomaji}
                      </p>
                      {manga.titleEnglish &&
                        manga.titleEnglish !== manga.titleRomaji && (
                          <p className="text-xs text-black/40 truncate">
                            {manga.titleEnglish}
                          </p>
                        )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-black/40">
                          {STATUS_LABELS[manga.status] ?? manga.status}
                        </span>
                        {manga.volumes && (
                          <span className="text-xs text-black/30">
                            {manga.volumes} tomes
                          </span>
                        )}
                        {manga.averageScore && (
                          <span className="text-xs text-black/30">
                            ★ {manga.averageScore}/100
                          </span>
                        )}
                      </div>
                    </div>

                    {/* In collection badge */}
                    {inCollection && (
                      <CheckCircle2
                        size={16}
                        className="text-green-500 shrink-0"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

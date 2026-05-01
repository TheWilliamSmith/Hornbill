import { apiClient } from "@/lib/api-client";
import type {
  ImportJob,
  PaginatedManga,
  CatalogStats,
  MangaReference,
  MangaVolume,
  MangaSearchResult,
  UserMangaCollection,
  ListCatalogParams,
  AddToCollectionRequest,
  UpdateCollectionRequest,
} from "@/types/manga.type";

function buildQuery(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "" && v !== null,
  );
  if (entries.length === 0) return "";
  return (
    "?" +
    new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
  );
}

export const mangaService = {
  triggerTop10: () => apiClient.post<ImportJob>("admin/manga/import/top"),
  triggerFull: () => apiClient.post<ImportJob>("admin/manga/import/full"),
  listImports: () => apiClient.get<ImportJob[]>("admin/manga/imports"),
  getImport: (id: string) =>
    apiClient.get<ImportJob>(`admin/manga/imports/${encodeURIComponent(id)}`),
  cancelImport: (id: string) =>
    apiClient.post<void>(
      `admin/manga/imports/${encodeURIComponent(id)}/cancel`,
    ),

  listCatalog: (params: ListCatalogParams = {}) =>
    apiClient.get<PaginatedManga>(
      `admin/manga/catalog${buildQuery(params as Record<string, unknown>)}`,
    ),
  getManga: (id: string) =>
    apiClient.get<MangaReference>(
      `admin/manga/catalog/${encodeURIComponent(id)}`,
    ),
  getCatalogStats: () =>
    apiClient.get<CatalogStats>("admin/manga/catalog/stats"),
  getVolumes: (mangaId: string) =>
    apiClient.get<MangaVolume[]>(
      `admin/manga/catalog/${encodeURIComponent(mangaId)}/volumes`,
    ),
  syncVolumes: (mangaId: string) =>
    apiClient.post<{ volumeCount: number }>(
      `admin/manga/catalog/${encodeURIComponent(mangaId)}/sync-volumes`,
    ),
  syncAllVolumes: () =>
    apiClient.post<ImportJob>(`admin/manga/catalog/sync-all-volumes`),
  syncCovers: (mangaId: string) =>
    apiClient.post<{ found: number; updated: number }>(
      `admin/manga/catalog/${encodeURIComponent(mangaId)}/sync-covers`,
    ),
  updateVolume: (
    volumeId: string,
    data: {
      coverImageUrl?: string;
      isbn?: string;
      title?: string;
      releaseYear?: number;
      releaseMonth?: number;
      notes?: string;
    },
  ) =>
    apiClient.patch<MangaVolume>(
      `admin/manga/catalog/volumes/${encodeURIComponent(volumeId)}`,
      data,
    ),

  // User collection
  searchManga: (q: string) =>
    apiClient.get<MangaSearchResult[]>(
      `manga/search?q=${encodeURIComponent(q)}`,
    ),
  getCollection: () => apiClient.get<UserMangaCollection[]>("manga/collection"),
  getCollectionEntry: (id: string) =>
    apiClient.get<UserMangaCollection>(
      `manga/collection/${encodeURIComponent(id)}`,
    ),
  getCollectionVolumes: (id: string) =>
    apiClient.get<MangaVolume[]>(
      `manga/collection/${encodeURIComponent(id)}/volumes`,
    ),
  addToCollection: (data: AddToCollectionRequest) =>
    apiClient.post<UserMangaCollection>("manga/collection", data),
  updateCollectionEntry: (id: string, data: UpdateCollectionRequest) =>
    apiClient.patch<UserMangaCollection>(
      `manga/collection/${encodeURIComponent(id)}`,
      data,
    ),
  removeFromCollection: (id: string) =>
    apiClient.delete<void>(`manga/collection/${encodeURIComponent(id)}`),
};

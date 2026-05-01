export type MangaStatus =
  | "PUBLISHING"
  | "FINISHED"
  | "CANCELLED"
  | "HIATUS"
  | "NOT_YET_RELEASED";
export type ImportJobType = "TOP_10" | "FULL";
export type ImportJobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type UserMangaStatus =
  | "PLAN_TO_READ"
  | "READING"
  | "COMPLETED"
  | "ON_HOLD"
  | "DROPPED";

export interface ImportJob {
  id: string;
  type: ImportJobType;
  status: ImportJobStatus;
  triggeredById: string;
  triggeredBy?: { id: string; email: string };
  totalPages: number | null;
  currentPage: number;
  totalImported: number;
  totalUpdated: number;
  totalSkipped: number;
  totalErrors: number;
  errorLog: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface MangaReference {
  id: string;
  anilistId: number;
  titleRomaji: string;
  titleEnglish: string | null;
  titleNative: string | null;
  description: string | null;
  coverImageUrl: string | null;
  bannerImageUrl: string | null;
  genres: string[];
  status: MangaStatus;
  chapters: number | null;
  volumes: number | null;
  startYear: number | null;
  startMonth: number | null;
  startDay: number | null;
  endYear: number | null;
  endMonth: number | null;
  endDay: number | null;
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  authorName: string | null;
  artistName: string | null;
  isAdult: boolean;
  importedAt: string;
  updatedFromSourceAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedManga {
  data: MangaReference[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CatalogStats {
  total: number;
  byStatus: Record<string, number>;
  topGenres: Array<{ genre: string; count: number }>;
  adultCount: number;
  lastImportAt: string | null;
}

export interface MangaVolume {
  id: string;
  mangaReferenceId: string;
  volumeNumber: number;
  coverImageUrl: string | null;
  isbn: string | null;
  title: string | null;
  releaseYear: number | null;
  releaseMonth: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListCatalogParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: MangaStatus | "";
  genre?: string;
  author?: string;
  minVolumes?: number;
  maxVolumes?: number;
  minScore?: number;
  maxScore?: number;
  includeAdult?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserMangaCollection {
  id: string;
  userId: string;
  mangaReferenceId: string;
  ownedVolumes: number[];
  readVolumes: number[];
  status: UserMangaStatus;
  createdAt: string;
  updatedAt: string;
  mangaReference: MangaReference;
}

export interface MangaSearchResult extends MangaReference {
  userCollections: Array<{
    id: string;
    status: UserMangaStatus;
    ownedVolumes: number[];
    readVolumes: number[];
  }>;
}

export interface AddToCollectionRequest {
  mangaReferenceId: string;
  status?: UserMangaStatus;
  importAllVolumes?: boolean;
}

export interface UpdateCollectionRequest {
  status?: UserMangaStatus;
  ownedVolumes?: number[];
  readVolumes?: number[];
}

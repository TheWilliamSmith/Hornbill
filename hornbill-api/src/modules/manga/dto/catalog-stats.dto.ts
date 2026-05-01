export class CatalogStatsDto {
  total: number;
  byStatus: Record<string, number>;
  topGenres: Array<{ genre: string; count: number }>;
  adultCount: number;
  lastImportAt: Date | null;
}

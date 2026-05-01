import { MangaStatus } from '../enums/manga-status.enum';

export class MangaReferenceDto {
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
  importedAt: Date;
  updatedFromSourceAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

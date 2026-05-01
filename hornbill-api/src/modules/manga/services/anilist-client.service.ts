import { Injectable, Logger } from '@nestjs/common';
import { ANILIST_MANGA_QUERY, ANILIST_SINGLE_MANGA_QUERY } from '../graphql/anilist-queries';

const ANILIST_URL = 'https://graphql.anilist.co';
const MAX_RETRIES = 3;

export interface AniListPageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface AniListStaffEdge {
  role: string;
  node: {
    name: {
      full: string;
      native: string | null;
    };
  };
}

export interface AniListMedia {
  id: number;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  coverImage: {
    extraLarge: string | null;
    large: string | null;
    medium: string | null;
  } | null;
  bannerImage: string | null;
  genres: string[];
  tags: Array<{ name: string; rank: number }>;
  status: string | null;
  chapters: number | null;
  volumes: number | null;
  startDate: { year: number | null; month: number | null; day: number | null } | null;
  endDate: { year: number | null; month: number | null; day: number | null } | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  favourites: number | null;
  staff: { edges: AniListStaffEdge[] } | null;
  isAdult: boolean;
}

export interface AniListPageResponse {
  pageInfo: AniListPageInfo;
  media: AniListMedia[];
}

@Injectable()
export class AnilistClientService {
  private readonly logger = new Logger(AnilistClientService.name);

  async fetchMangaPage(
    page: number,
    perPage: number,
    sort: string[] = ['POPULARITY_DESC'],
  ): Promise<AniListPageResponse> {
    const variables = { page, perPage, sort };
    return this.executeWithRetry(variables);
  }

  async fetchSingleManga(anilistId: number): Promise<AniListMedia> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.warn(`Retry attempt ${attempt}/${MAX_RETRIES - 1} after ${delay}ms`);
        await this.sleep(delay);
      }

      try {
        const response = await fetch(ANILIST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ query: ANILIST_SINGLE_MANGA_QUERY, variables: { id: anilistId } }),
          signal: AbortSignal.timeout(30000),
        });

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') ?? '60', 10);
          this.logger.warn(`Rate limited by AniList. Waiting ${retryAfter}s`);
          await this.sleep(retryAfter * 1000);
          lastError = new Error('Rate limited');
          continue;
        }

        if (!response.ok) {
          throw new Error(`AniList returned status ${response.status}`);
        }

        const json = (await response.json()) as {
          data?: { Media: AniListMedia };
          errors?: unknown[];
        };

        if (json.errors?.length) {
          throw new Error(`AniList GraphQL errors: ${JSON.stringify(json.errors)}`);
        }

        if (!json.data?.Media) {
          throw new Error('Unexpected AniList response structure');
        }

        return json.data.Media;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.error(
          `AniList single manga request failed (attempt ${attempt + 1}): ${lastError.message}`,
        );
      }
    }

    throw lastError ?? new Error('AniList request failed after all retries');
  }

  private async executeWithRetry(variables: Record<string, unknown>): Promise<AniListPageResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.warn(`Retry attempt ${attempt}/${MAX_RETRIES - 1} after ${delay}ms`);
        await this.sleep(delay);
      }

      try {
        const response = await fetch(ANILIST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ query: ANILIST_MANGA_QUERY, variables }),
          signal: AbortSignal.timeout(30000),
        });

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') ?? '60', 10);
          this.logger.warn(`Rate limited by AniList. Waiting ${retryAfter}s`);
          await this.sleep(retryAfter * 1000);
          lastError = new Error('Rate limited');
          continue;
        }

        if (!response.ok) {
          throw new Error(`AniList returned status ${response.status}`);
        }

        const json = (await response.json()) as {
          data?: { Page: AniListPageResponse };
          errors?: unknown[];
        };

        if (json.errors?.length) {
          throw new Error(`AniList GraphQL errors: ${JSON.stringify(json.errors)}`);
        }

        if (!json.data?.Page) {
          throw new Error('Unexpected AniList response structure');
        }

        return json.data.Page;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.error(`AniList request failed (attempt ${attempt + 1}): ${lastError.message}`);
      }
    }

    throw lastError ?? new Error('AniList request failed after all retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

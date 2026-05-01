import { Injectable, Logger } from '@nestjs/common';

const MANGADEX_API = 'https://api.mangadex.org';
const MAX_RETRIES = 3;
const REQUEST_DELAY_MS = 300; // MangaDex rate limit: ~5 req/s

export interface MangaDexCover {
  mangaDexMangaId: string;
  volumeNumber: number;
  coverUrl: string;
}

interface MangaDexSearchResult {
  id: string;
  attributes: {
    title: Record<string, string>;
    altTitles: Array<Record<string, string>>;
  };
}

interface MangaDexCoverResult {
  id: string;
  attributes: {
    volume: string | null;
    fileName: string;
    locale: string | null;
  };
  relationships: Array<{ id: string; type: string }>;
}

@Injectable()
export class MangaDexClientService {
  private readonly logger = new Logger(MangaDexClientService.name);

  /**
   * Search MangaDex for a manga by title and return the best matching ID.
   */
  async searchManga(title: string): Promise<string | null> {
    try {
      const url = `${MANGADEX_API}/manga?title=${encodeURIComponent(title)}&limit=5&order[relevance]=desc&availableTranslatedLanguage[]=fr&availableTranslatedLanguage[]=en`;
      const response = await this.fetchWithRetry(url);
      const json = response as { data: MangaDexSearchResult[] };
      if (!json.data?.length) {
        this.logger.warn(`[MangaDex] Aucun résultat pour la recherche "${title}"`);
        return null;
      }
      const best = json.data[0];
      const bestTitle = Object.values(best.attributes.title)[0] ?? '?';
      this.logger.log(
        `[MangaDex] Meilleur résultat pour "${title}" → "${bestTitle}" (id: ${best.id})`,
      );
      return best.id;
    } catch (err) {
      this.logger.warn(
        `[MangaDex] Recherche échouée pour "${title}": ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  /**
   * Fetch all volume covers for a given MangaDex manga ID.
   * Returns covers mapped by volume number.
   */
  async getVolumeCovers(mangaDexMangaId: string): Promise<MangaDexCover[]> {
    const covers: MangaDexCover[] = [];
    let offset = 0;
    const limit = 100;
    let page = 0;

    this.logger.log(`[MangaDex] Récupération des couvertures pour id=${mangaDexMangaId}`);

    while (true) {
      page++;
      const url = `${MANGADEX_API}/cover?manga[]=${mangaDexMangaId}&limit=${limit}&offset=${offset}&order[volume]=asc`;
      const json = (await this.fetchWithRetry(url)) as {
        data: MangaDexCoverResult[];
        total: number;
      };

      let accepted = 0;
      let skipped = 0;
      for (const item of json.data) {
        const vol = item.attributes.volume;
        if (!vol) {
          skipped++;
          continue;
        }
        const volumeNumber = parseFloat(vol);
        if (!Number.isInteger(volumeNumber) || volumeNumber <= 0) {
          this.logger.warn(
            `[MangaDex] Couverture ignorée — volume="${vol}" non entier (fichier: ${item.attributes.fileName})`,
          );
          skipped++;
          continue;
        }
        const mangaRel = item.relationships.find((r) => r.type === 'manga');
        if (!mangaRel) {
          skipped++;
          continue;
        }
        covers.push({
          mangaDexMangaId,
          volumeNumber,
          coverUrl: `https://uploads.mangadex.org/covers/${mangaDexMangaId}/${item.attributes.fileName}.256.jpg`,
        });
        this.logger.debug(
          `[MangaDex] Tome ${volumeNumber} → https://uploads.mangadex.org/covers/${mangaDexMangaId}/${item.attributes.fileName}.256.jpg`,
        );
        accepted++;
      }

      this.logger.log(
        `[MangaDex] Page ${page}: ${json.data.length} reçus (total=${json.total}), ${accepted} acceptés, ${skipped} ignorés`,
      );

      offset += json.data.length;
      if (offset >= json.total || json.data.length === 0) break;
      await this.sleep(REQUEST_DELAY_MS);
    }

    this.logger.log(
      `[MangaDex] Terminé — ${covers.length} couvertures valides pour id=${mangaDexMangaId}`,
    );
    return covers;
  }

  /**
   * High-level: search by title then fetch covers. Returns empty array on any failure.
   */
  async findCoversByTitle(
    titleRomaji: string,
    titleEnglish?: string | null,
  ): Promise<MangaDexCover[]> {
    this.logger.log(`[MangaDex] Recherche par titre romaji: "${titleRomaji}"`);
    let mangaDexId = await this.searchManga(titleRomaji);

    if (!mangaDexId && titleEnglish) {
      this.logger.log(
        `[MangaDex] Romaji non trouvé — tentative avec titre anglais: "${titleEnglish}"`,
      );
      await this.sleep(REQUEST_DELAY_MS);
      mangaDexId = await this.searchManga(titleEnglish);
    }

    if (!mangaDexId) {
      this.logger.warn(
        `[MangaDex] Aucun match trouvé pour "${titleRomaji}"${titleEnglish ? ` / "${titleEnglish}"` : ''}`,
      );
      return [];
    }

    this.logger.log(`[MangaDex] ID trouvé: ${mangaDexId} — récupération des couvertures`);
    await this.sleep(REQUEST_DELAY_MS);
    return this.getVolumeCovers(mangaDexId);
  }

  private async fetchWithRetry(url: string): Promise<unknown> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.warn(
          `MangaDex retry ${attempt}/${MAX_RETRIES - 1} — url=${url} — attente ${delay}ms`,
        );
        await this.sleep(delay);
      }

      try {
        this.logger.debug(`[MangaDex] GET ${url}`);
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(15000),
        });

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') ?? '10', 10);
          this.logger.warn(`[MangaDex] Rate limited — url=${url} — attente ${retryAfter}s`);
          await this.sleep(retryAfter * 1000);
          lastError = new Error('Rate limited');
          continue;
        }

        if (!response.ok) throw new Error(`MangaDex status ${response.status} — url=${url}`);
        return await response.json();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.error(
          `[MangaDex] Requête échouée (tentative ${attempt + 1}) — url=${url} — ${lastError.message}`,
        );
      }
    }

    throw lastError ?? new Error(`MangaDex request failed after all retries — url=${url}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

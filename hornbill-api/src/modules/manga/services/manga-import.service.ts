import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { MangaImportJobStatus, MangaImportJobType, MangaStatus } from '@src/generated/prisma/enums';
import { AnilistClientService, AniListMedia } from './anilist-client.service';
import { MangaImportJobRepository } from '../repositories/manga-import-job.repository';
import {
  MangaReferenceRepository,
  UpsertMangaData,
} from '../repositories/manga-reference.repository';
import { MangaVolumeRepository } from '../repositories/manga-volume.repository';
import { MangaDexClientService } from './mangadex-client.service';

const PAGE_DELAY_MS = 2000;

@Injectable()
export class MangaImportService {
  private readonly logger = new Logger(MangaImportService.name);
  private readonly cancelledJobs = new Set<string>();

  constructor(
    private readonly anilistClient: AnilistClientService,
    private readonly mangaDexClient: MangaDexClientService,
    private readonly importJobRepo: MangaImportJobRepository,
    private readonly mangaRepo: MangaReferenceRepository,
    private readonly volumeRepo: MangaVolumeRepository,
  ) {}

  async triggerTop10Import(adminId: string) {
    const job = await this.importJobRepo.create({
      type: MangaImportJobType.TOP_10,
      triggeredById: adminId,
    });

    setTimeout(() => this.runTop10Import(job.id), 0);
    return job;
  }

  async cancelImport(jobId: string) {
    const job = await this.importJobRepo.findById(jobId);
    if (!job) throw new NotFoundException('Import introuvable');
    if (
      job.status !== MangaImportJobStatus.RUNNING &&
      job.status !== MangaImportJobStatus.PENDING
    ) {
      throw new ConflictException('Cet import ne peut pas être annulé');
    }
    this.cancelledJobs.add(jobId);
    await this.importJobRepo.update(jobId, {
      status: MangaImportJobStatus.FAILED,
      errorLog: "Annulé par l'administrateur",
      completedAt: new Date(),
    });
  }

  async syncVolumeCovers(mangaId: string): Promise<{ found: number; updated: number }> {
    const manga = await this.mangaRepo.findById(mangaId);
    if (!manga) throw new NotFoundException('Manga introuvable');

    this.logger.log(
      `[syncCovers] "${manga.titleRomaji}" — recherche MangaDex (titleEnglish: "${manga.titleEnglish ?? 'none'}")`,
    );

    const covers = await this.mangaDexClient.findCoversByTitle(
      manga.titleRomaji,
      manga.titleEnglish,
    );

    if (covers.length === 0) {
      this.logger.warn(
        `[syncCovers] Aucune couverture trouvée sur MangaDex pour "${manga.titleRomaji}"`,
      );
      return { found: 0, updated: 0 };
    }

    this.logger.log(
      `[syncCovers] ${covers.length} couvertures récupérées — mise à jour en base pour "${manga.titleRomaji}"`,
    );
    const updated = await this.volumeRepo.updateCoverBulk(
      manga.id,
      covers.map((c) => ({ volumeNumber: c.volumeNumber, coverUrl: c.coverUrl })),
    );
    this.logger.log(
      `[syncCovers] Terminé — ${updated} tomes mis à jour pour "${manga.titleRomaji}"`,
    );

    return { found: covers.length, updated };
  }

  async syncMangaVolumes(mangaId: string): Promise<{ volumeCount: number }> {
    const manga = await this.mangaRepo.findById(mangaId);
    if (!manga) throw new NotFoundException('Manga introuvable');

    this.logger.log(`[syncVolumes] "${manga.titleRomaji}" (AniList #${manga.anilistId})`);
    const media = await this.anilistClient.fetchSingleManga(manga.anilistId);
    const parsed = this.parseMedia(media);

    this.logger.log(
      `[syncVolumes] Réponse AniList — volumes: ${parsed.volumes ?? 'null'}, chapitres: ${parsed.chapters ?? 'null'}, statut: ${parsed.status}`,
    );

    await this.mangaRepo.update(manga.id, parsed);

    const volumeCount = parsed.volumes ?? 0;
    if (volumeCount > 0) {
      const nums = Array.from({ length: volumeCount }, (_, i) => i + 1);
      await this.volumeRepo.upsertMany(manga.id, nums);
      await this.volumeRepo.deleteExtraVolumes(manga.id, volumeCount);
      this.logger.log(
        `[syncVolumes] Terminé — ${volumeCount} tomes upsertés pour "${manga.titleRomaji}"`,
      );
    } else {
      this.logger.warn(
        `[syncVolumes] Le champ "volumes" est null/0 sur AniList pour "${manga.titleRomaji}" — aucun tome synchronisé`,
      );
    }

    return { volumeCount };
  }

  async triggerSyncAllVolumes(adminId: string) {
    const running = await this.importJobRepo.findRunningSyncVolumes();
    if (running) {
      throw new ConflictException('Une synchronisation de volumes est déjà en cours');
    }
    const job = await this.importJobRepo.create({
      type: MangaImportJobType.SYNC_VOLUMES,
      triggeredById: adminId,
    });
    setTimeout(() => this.runSyncAllVolumes(job.id), 0);
    return job;
  }

  private async runSyncAllVolumes(jobId: string) {
    await this.importJobRepo.update(jobId, {
      status: MangaImportJobStatus.RUNNING,
      startedAt: new Date(),
    });

    const allMangas = await this.mangaRepo.findAllIds();
    const total = allMangas.length;
    await this.importJobRepo.update(jobId, { totalPages: total });

    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < allMangas.length; i++) {
        if (this.cancelledJobs.has(jobId)) {
          this.cancelledJobs.delete(jobId);
          return;
        }

        const manga = allMangas[i];
        try {
          const media = await this.anilistClient.fetchSingleManga(manga.anilistId);
          const parsed = this.parseMedia(media);
          await this.mangaRepo.update(manga.id, parsed);

          const volumeCount = parsed.volumes ?? 0;
          if (volumeCount > 0) {
            const nums = Array.from({ length: volumeCount }, (_, k) => k + 1);
            await this.volumeRepo.upsertMany(manga.id, nums);
            await this.volumeRepo.deleteExtraVolumes(manga.id, volumeCount);
            totalImported++;

            // Sync covers from MangaDex
            try {
              const covers = await this.mangaDexClient.findCoversByTitle(
                parsed.titleRomaji,
                parsed.titleEnglish ?? undefined,
              );
              if (covers.length > 0) {
                const updated = await this.volumeRepo.updateCoverBulk(
                  manga.id,
                  covers.map((c) => ({ volumeNumber: c.volumeNumber, coverUrl: c.coverUrl })),
                );
                totalUpdated += updated;
              }
            } catch (coverErr) {
              const msg = coverErr instanceof Error ? coverErr.message : String(coverErr);
              this.logger.warn(
                `[syncAllVolumes] Couvertures échouées pour "${parsed.titleRomaji}": ${msg}`,
              );
            }
          } else {
            totalSkipped++;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          this.logger.error(`[syncAllVolumes] Erreur manga ${manga.id}: ${message}`);
          errors.push(`Manga ${manga.id}: ${message}`);
          totalErrors++;
        }

        await this.importJobRepo.update(jobId, {
          currentPage: i + 1,
          totalImported,
          totalUpdated,
          totalSkipped,
          totalErrors,
          ...(errors.length > 0 ? { errorLog: errors.join('\n') } : {}),
        });

        if (i < allMangas.length - 1) {
          await this.sleep(300);
        }
      }

      await this.importJobRepo.update(jobId, {
        status: MangaImportJobStatus.COMPLETED,
        completedAt: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`[syncAllVolumes] Job ${jobId} failed: ${message}`);
      await this.importJobRepo.update(jobId, {
        status: MangaImportJobStatus.FAILED,
        errorLog: message,
        completedAt: new Date(),
      });
    }
  }

  async triggerFullImport(adminId: string) {
    const running = await this.importJobRepo.findRunningFull();
    if (running) {
      throw new ConflictException('A full import is already running');
    }

    const job = await this.importJobRepo.create({
      type: MangaImportJobType.FULL,
      triggeredById: adminId,
    });

    setTimeout(() => this.runFullImport(job.id), 0);
    return job;
  }

  private async runTop10Import(jobId: string) {
    await this.importJobRepo.update(jobId, {
      status: MangaImportJobStatus.RUNNING,
      startedAt: new Date(),
      totalPages: 1,
    });

    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const errors: string[] = [];

    try {
      const page = await this.anilistClient.fetchMangaPage(1, 10, ['POPULARITY_DESC']);

      for (const media of page.media) {
        const result = await this.processSingleManga(media);
        if (result === 'created') totalImported++;
        else if (result === 'updated') totalUpdated++;
        else if (result === 'skipped') totalSkipped++;
        else {
          totalErrors++;
          errors.push(result);
        }
      }

      await this.importJobRepo.update(jobId, {
        status: MangaImportJobStatus.COMPLETED,
        currentPage: 1,
        totalImported,
        totalUpdated,
        totalSkipped,
        totalErrors,
        errorLog: errors.length > 0 ? errors.join('\n') : undefined,
        completedAt: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Top10 import job ${jobId} failed: ${message}`);
      await this.importJobRepo.update(jobId, {
        status: MangaImportJobStatus.FAILED,
        errorLog: message,
        completedAt: new Date(),
      });
    }
  }

  private async runFullImport(jobId: string) {
    await this.importJobRepo.update(jobId, {
      status: MangaImportJobStatus.RUNNING,
      startedAt: new Date(),
    });

    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const errors: string[] = [];
    let currentPage = 1;

    try {
      while (true) {
        if (this.cancelledJobs.has(jobId)) {
          this.cancelledJobs.delete(jobId);
          return;
        }

        let pageData;
        try {
          pageData = await this.anilistClient.fetchMangaPage(currentPage, 50, ['POPULARITY_DESC']);
        } catch (fetchErr) {
          const message = `Failed to fetch page ${currentPage}: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`;
          this.logger.error(message);
          errors.push(message);
          totalErrors++;

          await this.importJobRepo.update(jobId, {
            currentPage,
            totalErrors,
            errorLog: errors.join('\n'),
          });

          if (!pageData) {
            currentPage++;
            if (currentPage > 500) break;
            await this.sleep(PAGE_DELAY_MS);
            continue;
          }
        }

        if (!pageData) break;

        if (currentPage === 1) {
          await this.importJobRepo.update(jobId, { totalPages: pageData.pageInfo.lastPage });
        }

        for (const media of pageData.media) {
          const result = await this.processSingleManga(media);
          if (result === 'created') totalImported++;
          else if (result === 'updated') totalUpdated++;
          else if (result === 'skipped') totalSkipped++;
          else {
            totalErrors++;
            errors.push(result);
          }
        }

        await this.importJobRepo.update(jobId, {
          currentPage,
          totalImported,
          totalUpdated,
          totalSkipped,
          totalErrors,
          errorLog: errors.length > 0 ? errors.join('\n') : undefined,
        });

        if (!pageData.pageInfo.hasNextPage) break;

        currentPage++;
        await this.sleep(PAGE_DELAY_MS);

        if (this.cancelledJobs.has(jobId)) {
          this.cancelledJobs.delete(jobId);
          return;
        }
      }

      await this.importJobRepo.update(jobId, {
        status: MangaImportJobStatus.COMPLETED,
        completedAt: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Full import job ${jobId} failed: ${message}`);
      await this.importJobRepo.update(jobId, {
        status: MangaImportJobStatus.FAILED,
        errorLog: [...errors, message].join('\n'),
        completedAt: new Date(),
      });
    }
  }

  private async processSingleManga(
    media: AniListMedia,
  ): Promise<'created' | 'updated' | 'skipped' | string> {
    try {
      const parsed = this.parseMedia(media);
      const existing = await this.mangaRepo.findByAnilistId(media.id);

      let mangaId: string;
      let result: 'created' | 'updated' | 'skipped';

      if (!existing) {
        const created = await this.mangaRepo.create(parsed);
        mangaId = created.id;
        result = 'created';
      } else if (this.hasChanged(existing, parsed)) {
        await this.mangaRepo.update(existing.id, parsed);
        mangaId = existing.id;
        result = 'updated';
      } else {
        return 'skipped';
      }

      // Sync volume entries
      if (parsed.volumes && parsed.volumes > 0) {
        const nums = Array.from({ length: parsed.volumes }, (_, i) => i + 1);
        await this.volumeRepo.upsertMany(mangaId, nums);
        await this.volumeRepo.deleteExtraVolumes(mangaId, parsed.volumes);
      }

      return result;
    } catch (err) {
      const message = `Error processing anilistId=${media.id}: ${err instanceof Error ? err.message : String(err)}`;
      this.logger.error(message);
      return message;
    }
  }

  private parseMedia(media: AniListMedia): UpsertMangaData {
    const coverImageUrl =
      media.coverImage?.extraLarge ?? media.coverImage?.large ?? media.coverImage?.medium ?? null;

    const authorName = this.extractStaff(media, 'Story');
    const artistName = this.extractArtist(media, authorName);

    return {
      anilistId: media.id,
      titleRomaji: media.title?.romaji ?? `Manga #${media.id}`,
      titleEnglish: media.title?.english ?? null,
      titleNative: media.title?.native ?? null,
      description: media.description ?? null,
      coverImageUrl,
      bannerImageUrl: media.bannerImage ?? null,
      genres: media.genres ?? [],
      status: this.mapStatus(media.status),
      chapters: media.chapters ?? null,
      volumes: media.volumes ?? null,
      startYear: media.startDate?.year ?? null,
      startMonth: media.startDate?.month ?? null,
      startDay: media.startDate?.day ?? null,
      endYear: media.endDate?.year ?? null,
      endMonth: media.endDate?.month ?? null,
      endDay: media.endDate?.day ?? null,
      averageScore: media.averageScore ?? null,
      popularity: media.popularity ?? null,
      favourites: media.favourites ?? null,
      authorName,
      artistName,
      isAdult: media.isAdult ?? false,
    };
  }

  private extractStaff(media: AniListMedia, roleKeyword: string): string | null {
    const edge = media.staff?.edges.find((e) =>
      e.role.toLowerCase().includes(roleKeyword.toLowerCase()),
    );
    return edge?.node?.name?.full ?? null;
  }

  private extractArtist(media: AniListMedia, authorName: string | null): string | null {
    const storyAndArtEdge = media.staff?.edges.find(
      (e) =>
        e.role.toLowerCase().includes('story & art') || e.role.toLowerCase().includes('story&art'),
    );
    if (storyAndArtEdge) return null;

    const artEdge = media.staff?.edges.find(
      (e) =>
        e.role.toLowerCase().includes('art') &&
        !e.role.toLowerCase().includes('story') &&
        e.node?.name?.full !== authorName,
    );
    return artEdge?.node?.name?.full ?? null;
  }

  private mapStatus(status: string | null): MangaStatus {
    const map: Record<string, MangaStatus> = {
      RELEASING: MangaStatus.PUBLISHING,
      FINISHED: MangaStatus.FINISHED,
      CANCELLED: MangaStatus.CANCELLED,
      HIATUS: MangaStatus.HIATUS,
      NOT_YET_RELEASED: MangaStatus.NOT_YET_RELEASED,
    };
    return map[status ?? ''] ?? MangaStatus.NOT_YET_RELEASED;
  }

  private hasChanged(existing: Record<string, unknown>, incoming: UpsertMangaData): boolean {
    const fields: Array<keyof UpsertMangaData> = [
      'titleRomaji',
      'titleEnglish',
      'titleNative',
      'description',
      'coverImageUrl',
      'bannerImageUrl',
      'status',
      'chapters',
      'volumes',
      'startYear',
      'startMonth',
      'startDay',
      'endYear',
      'endMonth',
      'endDay',
      'averageScore',
      'popularity',
      'favourites',
      'authorName',
      'artistName',
      'isAdult',
    ];

    for (const field of fields) {
      if (existing[field] !== incoming[field]) return true;
    }

    const existingGenres = (existing['genres'] as string[]) ?? [];
    const incomingGenres = incoming.genres ?? [];
    if (existingGenres.join(',') !== incomingGenres.join(',')) return true;

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { MangaStatus } from '@src/generated/prisma/enums';

export interface UpsertMangaData {
  anilistId: number;
  titleRomaji: string;
  titleEnglish?: string | null;
  titleNative?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  genres: string[];
  status: MangaStatus;
  chapters?: number | null;
  volumes?: number | null;
  startYear?: number | null;
  startMonth?: number | null;
  startDay?: number | null;
  endYear?: number | null;
  endMonth?: number | null;
  endDay?: number | null;
  averageScore?: number | null;
  popularity?: number | null;
  favourites?: number | null;
  authorName?: string | null;
  artistName?: string | null;
  isAdult: boolean;
}

@Injectable()
export class MangaReferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAnilistId(anilistId: number) {
    return this.prisma.mangaReference.findUnique({ where: { anilistId } });
  }

  async findAllIds(): Promise<
    Array<{ id: string; anilistId: number; titleRomaji: string; titleEnglish: string | null }>
  > {
    return this.prisma.mangaReference.findMany({
      select: { id: true, anilistId: true, titleRomaji: true, titleEnglish: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: UpsertMangaData) {
    const now = new Date();
    return this.prisma.mangaReference.create({
      data: { ...data, importedAt: now, updatedFromSourceAt: now },
    });
  }

  async update(id: string, data: Partial<UpsertMangaData>) {
    return this.prisma.mangaReference.update({
      where: { id },
      data: { ...data, updatedFromSourceAt: new Date() },
    });
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: MangaStatus;
    genre?: string;
    author?: string;
    minVolumes?: number;
    maxVolumes?: number;
    minScore?: number;
    maxScore?: number;
    includeAdult?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      search,
      status,
      genre,
      author,
      minVolumes,
      maxVolumes,
      minScore,
      maxScore,
      includeAdult,
      sortBy = 'popularity',
      sortOrder = 'desc',
    } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { titleRomaji: { contains: search, mode: 'insensitive' } },
        { titleEnglish: { contains: search, mode: 'insensitive' } },
        { titleNative: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (genre) where.genres = { has: genre };
    if (author) where.authorName = { contains: author, mode: 'insensitive' };
    if (!includeAdult) where.isAdult = false;

    if (minVolumes !== undefined || maxVolumes !== undefined) {
      where.volumes = {
        ...(minVolumes !== undefined ? { gte: minVolumes } : {}),
        ...(maxVolumes !== undefined ? { lte: maxVolumes } : {}),
      };
    }

    if (minScore !== undefined || maxScore !== undefined) {
      where.averageScore = {
        ...(minScore !== undefined ? { gte: minScore } : {}),
        ...(maxScore !== undefined ? { lte: maxScore } : {}),
      };
    }

    const sortableFields: Record<string, string> = {
      popularity: 'popularity',
      averageScore: 'averageScore',
      favourites: 'favourites',
      titleRomaji: 'titleRomaji',
      startYear: 'startYear',
      volumes: 'volumes',
      chapters: 'chapters',
      updatedAt: 'updatedAt',
    };

    const orderBy = { [sortableFields[sortBy] ?? 'popularity']: sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.mangaReference.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.mangaReference.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.prisma.mangaReference.findUnique({ where: { id } });
  }

  async getStats() {
    const [total, byStatusRaw, allGenres, adultCount, lastImport] = await Promise.all([
      this.prisma.mangaReference.count(),
      this.prisma.mangaReference.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.mangaReference.findMany({ select: { genres: true } }),
      this.prisma.mangaReference.count({ where: { isAdult: true } }),
      this.prisma.mangaReference.findFirst({
        orderBy: { importedAt: 'desc' },
        select: { importedAt: true },
      }),
    ]);

    const byStatus = Object.fromEntries(byStatusRaw.map((r) => [r.status, r._count.id]));

    const genreMap = new Map<string, number>();
    for (const { genres } of allGenres) {
      for (const g of genres) {
        genreMap.set(g, (genreMap.get(g) ?? 0) + 1);
      }
    }

    const topGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre, count]) => ({ genre, count }));

    return {
      total,
      byStatus,
      topGenres,
      adultCount,
      lastImportAt: lastImport?.importedAt ?? null,
    };
  }

  async searchForUser(query: string, userId: string, limit = 8) {
    return this.prisma.mangaReference.findMany({
      where: {
        OR: [
          { titleRomaji: { contains: query, mode: 'insensitive' } },
          { titleEnglish: { contains: query, mode: 'insensitive' } },
          { titleNative: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { popularity: 'desc' },
      include: {
        userCollections: {
          where: { userId },
          select: { id: true, status: true, ownedVolumes: true, readVolumes: true },
        },
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class MangaVolumeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByManga(mangaReferenceId: string) {
    return this.prisma.mangaVolume.findMany({
      where: { mangaReferenceId },
      orderBy: { volumeNumber: 'asc' },
    });
  }

  async upsertMany(mangaReferenceId: string, volumes: number[]) {
    await Promise.all(
      volumes.map((n) =>
        this.prisma.mangaVolume.upsert({
          where: { mangaReferenceId_volumeNumber: { mangaReferenceId, volumeNumber: n } },
          create: { mangaReferenceId, volumeNumber: n },
          update: {},
        }),
      ),
    );
  }

  async update(
    id: string,
    data: {
      coverImageUrl?: string | null;
      isbn?: string | null;
      title?: string | null;
      releaseYear?: number | null;
      releaseMonth?: number | null;
      notes?: string | null;
    },
  ) {
    return this.prisma.mangaVolume.update({ where: { id }, data });
  }

  async deleteExtraVolumes(mangaReferenceId: string, keepUpTo: number) {
    return this.prisma.mangaVolume.deleteMany({
      where: { mangaReferenceId, volumeNumber: { gt: keepUpTo } },
    });
  }

  async updateCoverBulk(
    mangaReferenceId: string,
    covers: Array<{ volumeNumber: number; coverUrl: string }>,
  ): Promise<number> {
    let updated = 0;
    await Promise.all(
      covers.map(async ({ volumeNumber, coverUrl }) => {
        const result = await this.prisma.mangaVolume.updateMany({
          where: { mangaReferenceId, volumeNumber },
          data: { coverImageUrl: coverUrl },
        });
        updated += result.count;
      }),
    );
    return updated;
  }
}

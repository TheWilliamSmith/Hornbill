import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { MangaImportJobStatus, MangaImportJobType } from '@src/generated/prisma/enums';

@Injectable()
export class MangaImportJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { type: MangaImportJobType; triggeredById: string }) {
    return this.prisma.mangaImportJob.create({
      data: {
        type: data.type,
        triggeredById: data.triggeredById,
        status: MangaImportJobStatus.PENDING,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.mangaImportJob.findUnique({
      where: { id },
      include: { triggeredBy: { select: { id: true, email: true } } },
    });
  }

  async findAll() {
    return this.prisma.mangaImportJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: { triggeredBy: { select: { id: true, email: true } } },
    });
  }

  async findRunningFull() {
    return this.prisma.mangaImportJob.findFirst({
      where: { type: MangaImportJobType.FULL, status: MangaImportJobStatus.RUNNING },
    });
  }

  async findRunningSyncVolumes() {
    return this.prisma.mangaImportJob.findFirst({
      where: {
        type: MangaImportJobType.SYNC_VOLUMES,
        status: { in: [MangaImportJobStatus.RUNNING, MangaImportJobStatus.PENDING] },
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      status: MangaImportJobStatus;
      currentPage: number;
      totalPages: number;
      totalImported: number;
      totalUpdated: number;
      totalSkipped: number;
      totalErrors: number;
      errorLog: string;
      startedAt: Date;
      completedAt: Date;
    }>,
  ) {
    return this.prisma.mangaImportJob.update({ where: { id }, data });
  }
}

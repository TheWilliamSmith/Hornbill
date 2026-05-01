import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UserMangaStatus } from '@src/generated/prisma/enums';

@Injectable()
export class UserMangaCollectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.userMangaCollection.findMany({
      where: { userId },
      include: { mangaReference: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findByUserAndManga(userId: string, mangaReferenceId: string) {
    return this.prisma.userMangaCollection.findUnique({
      where: { userId_mangaReferenceId: { userId, mangaReferenceId } },
    });
  }

  async findByIdAndUser(id: string, userId: string) {
    return this.prisma.userMangaCollection.findFirst({
      where: { id, userId },
      include: { mangaReference: true },
    });
  }

  async create(data: {
    userId: string;
    mangaReferenceId: string;
    status: UserMangaStatus;
    ownedVolumes: number[];
  }) {
    return this.prisma.userMangaCollection.create({
      data,
      include: { mangaReference: true },
    });
  }

  async update(
    id: string,
    data: { status?: UserMangaStatus; ownedVolumes?: number[]; readVolumes?: number[] },
  ) {
    return this.prisma.userMangaCollection.update({
      where: { id },
      data,
      include: { mangaReference: true },
    });
  }

  async delete(id: string) {
    return this.prisma.userMangaCollection.delete({ where: { id } });
  }
}

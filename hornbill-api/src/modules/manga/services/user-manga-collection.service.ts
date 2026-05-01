import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserMangaStatus } from '@src/generated/prisma/enums';
import { UserMangaCollectionRepository } from '../repositories/user-manga-collection.repository';
import { MangaReferenceRepository } from '../repositories/manga-reference.repository';
import { AddToCollectionDto } from '../dto/add-to-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';

@Injectable()
export class UserMangaCollectionService {
  constructor(
    private readonly collectionRepo: UserMangaCollectionRepository,
    private readonly mangaRepo: MangaReferenceRepository,
  ) {}

  async search(query: string, userId: string) {
    if (!query || query.trim().length === 0) return [];
    return this.mangaRepo.searchForUser(query.trim(), userId);
  }

  async getCollection(userId: string) {
    return this.collectionRepo.findAllByUser(userId);
  }

  async findOne(userId: string, id: string) {
    const entry = await this.collectionRepo.findByIdAndUser(id, userId);
    if (!entry) throw new NotFoundException('Entrée introuvable dans votre collection');
    return entry;
  }

  async addToCollection(userId: string, dto: AddToCollectionDto) {
    const existing = await this.collectionRepo.findByUserAndManga(userId, dto.mangaReferenceId);
    if (existing) {
      throw new ConflictException('Ce manga est déjà dans votre collection');
    }

    let ownedVolumes: number[] = [];
    if (dto.importAllVolumes) {
      const manga = await this.mangaRepo.findById(dto.mangaReferenceId);
      if (!manga) throw new NotFoundException('Manga introuvable');
      if (manga.volumes && manga.volumes > 0) {
        ownedVolumes = Array.from({ length: manga.volumes }, (_, i) => i + 1);
      }
    }

    return this.collectionRepo.create({
      userId,
      mangaReferenceId: dto.mangaReferenceId,
      status: (dto.status ?? 'PLAN_TO_READ') as UserMangaStatus,
      ownedVolumes,
    });
  }

  async updateEntry(userId: string, id: string, dto: UpdateCollectionDto) {
    const entry = await this.collectionRepo.findByIdAndUser(id, userId);
    if (!entry) throw new NotFoundException('Entrée introuvable dans votre collection');

    return this.collectionRepo.update(id, {
      status: dto.status as UserMangaStatus | undefined,
      ownedVolumes: dto.ownedVolumes,
      readVolumes: dto.readVolumes,
    });
  }

  async removeFromCollection(userId: string, id: string) {
    const entry = await this.collectionRepo.findByIdAndUser(id, userId);
    if (!entry) throw new NotFoundException('Entrée introuvable dans votre collection');
    await this.collectionRepo.delete(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { MangaStatus } from '@src/generated/prisma/enums';
import { MangaReferenceRepository } from '../repositories/manga-reference.repository';
import { ListCatalogQueryDto } from '../dto/list-catalog-query.dto';

@Injectable()
export class MangaCatalogService {
  constructor(private readonly mangaRepo: MangaReferenceRepository) {}

  async list(query: ListCatalogQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      genre,
      author,
      minVolumes,
      maxVolumes,
      minScore,
      maxScore,
      includeAdult,
      sortBy,
      sortOrder,
    } = query;

    const { data, total } = await this.mangaRepo.findAll({
      page,
      limit,
      search,
      status: status as MangaStatus | undefined,
      genre,
      author,
      minVolumes,
      maxVolumes,
      minScore,
      maxScore,
      includeAdult,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const manga = await this.mangaRepo.findById(id);
    if (!manga) throw new NotFoundException(`Manga ${id} not found`);
    return manga;
  }

  async getStats() {
    return this.mangaRepo.getStats();
  }
}

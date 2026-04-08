import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWeightEntryDto } from '../dto/weight-entry-dto/create-weight-entry.dto';
import { WeightEntryRepository } from '../repositories/weight-entry.repository';
import { GetWeightEntriesQueryDto } from '../dto/weight-entry-dto/get-weight-entries-query.dto';
import { WeightEntryMapper } from '../mappers/weight-entry.mapper';
import { PaginationMapper } from 'src/common/mappers/pagination.mapper';

@Injectable()
export class WeightService {
  constructor(private readonly repo: WeightEntryRepository) {}

  async createWeightEntry(dto: CreateWeightEntryDto, userId: string) {
    const newWeightEntry = await this.repo.createWeightEntry(
      {
        weight: dto.weight,
        unit: dto.unit,
        measuredAt: dto.measuredAt,
        note: dto.note,
      },
      userId,
    );

    return newWeightEntry;
  }

  async getEntries(userId: string, { page, limit, from, to }: GetWeightEntriesQueryDto) {
    const fromDate = from ?? new Date(0);
    const toDate = to ?? new Date();

    const [entries, total] = await Promise.all([
      this.repo.findManyByUserId(userId, page, limit, fromDate, toDate),
      this.repo.countByUserId(userId, fromDate, toDate),
    ]);

    const mapped = entries.map(WeightEntryMapper.toWeightEntriesResponse);

    return PaginationMapper.toPaginatedResponse(mapped, total, page, limit);
  }

  async updateWeightEntry(id: string, dto: Partial<CreateWeightEntryDto>, userId: string) {
    const updatedEntry = await this.repo.updateWeightEntry(id, dto, userId);
    return WeightEntryMapper.toUpdateResponse(updatedEntry);
  }

  async deleteWeightEntry(id: string, userId: string) {
    const isWeigthEntryExists = await this.repo.findById(id, userId);

    if (!isWeigthEntryExists) {
      throw new NotFoundException(
        `An error occurred while trying to delete weight entry. Entry not found.`,
      );
    }

    await this.repo.deleteWeightEntry(id, userId);
  }
}

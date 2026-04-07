import { Injectable } from '@nestjs/common';
import { CreateWeightEntryDto } from '../dto/create-weight-entry.dto';
import { WeightRepository } from '../repositories/weight.repository';
import { GetWeightEntriesQueryDto } from '../dto/get-weight-entries-query.dto';
import { WeightEntryMapper } from '../mappers/weight-entry.mapper';
import { PaginationMapper } from 'src/common/mappers/pagination.mapper';

@Injectable()
export class WeightService {
  constructor(private readonly repo: WeightRepository) {}

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
}

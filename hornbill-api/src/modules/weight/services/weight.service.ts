import { Injectable } from '@nestjs/common';
import { CreateWeightEntryDto } from '../dto/create-weight-entry.dto';
import { WeightRepository } from '../repositories/weight.repository';

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
}

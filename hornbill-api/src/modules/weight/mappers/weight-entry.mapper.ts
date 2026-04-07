import { WeightEntry } from '../entities/weight.entity';
import { GetWeightEntriesResponseDto } from '../dto/get-weight-entries-query-response.dto';

export class WeightEntryMapper {
  static toWeightEntriesResponse(weightEntry: WeightEntry): GetWeightEntriesResponseDto {
    const dto = new GetWeightEntriesResponseDto();
    dto.id = weightEntry.id;
    dto.weight = weightEntry.weight;
    dto.unit = weightEntry.unit;
    dto.measuredAt = weightEntry.measuredAt;
    dto.note = weightEntry.note ?? undefined;
    dto.createdAt = weightEntry.createdAt;
    dto.updatedAt = weightEntry.updatedAt;
    return dto;
  }
}

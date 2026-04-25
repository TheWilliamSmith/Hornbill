import { WeightEntry } from '../entities/weight.entity';
import { CreateWeightEntryResponseDto } from '../dto/weight-entry-dto/create-weight-entry-response.dto';
import { GetWeightEntriesResponseDto } from '../dto/weight-entry-dto/get-weight-entries-query-response.dto';
import { UpdateWeightEntryResponseDto } from '../dto/weight-entry-dto/update-weight-entry-response.dto';

export class WeightEntryMapper {
  static toCreateResponse(weightEntry: WeightEntry): CreateWeightEntryResponseDto {
    const dto = new CreateWeightEntryResponseDto();
    dto.id = weightEntry.id;
    dto.weight = weightEntry.weight;
    dto.unit = weightEntry.unit;
    dto.measuredAt = weightEntry.measuredAt;
    dto.note = weightEntry.note ?? undefined;
    dto.createdAt = weightEntry.createdAt;
    dto.updatedAt = weightEntry.updatedAt;
    return dto;
  }

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

  static toUpdateResponse(weightEntry: WeightEntry): UpdateWeightEntryResponseDto {
    const dto = new UpdateWeightEntryResponseDto();
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

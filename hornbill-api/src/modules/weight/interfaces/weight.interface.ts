import { WeightUnit } from 'src/generated/prisma/enums';

export interface createWeightEntryData {
  weight: number;
  unit: WeightUnit;
  measuredAt?: Date;
  note?: string;
}

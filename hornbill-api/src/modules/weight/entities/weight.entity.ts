import { WeightUnit } from 'src/generated/prisma/enums';

export interface WeightEntry {
  id: string;
  userId: string;
  weight: number;
  unit: WeightUnit;
  measuredAt: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

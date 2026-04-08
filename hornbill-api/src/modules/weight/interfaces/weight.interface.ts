import { WeightUnit, WeightGoalDirection, WeightGoalMode } from 'src/generated/prisma/enums';

export interface CreateWeightEntryData {
  weight: number;
  unit: WeightUnit;
  measuredAt?: Date;
  note?: string;
}

export interface CreateWeightGoalData {
  targetWeight: number;
  unit: WeightUnit;
  direction: WeightGoalDirection;
  mode: WeightGoalMode;
  deadline?: Date;
  toleranceWeight?: number;
  note?: string;
}

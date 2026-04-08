import { WeightUnit } from 'src/generated/prisma/enums';
import { WeightGoalDirection } from 'src/generated/prisma/enums';
import { WeightGoalMode } from 'src/generated/prisma/enums';
import { WeightGoalStatus } from 'src/generated/prisma/enums';

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

export interface WeightGoal {
  id: string;
  userId: string;
  targetWeight: number;
  unit: WeightUnit;
  direction: WeightGoalDirection;
  mode: WeightGoalMode;
  status: WeightGoalStatus;
  deadline?: Date;
  toleranceWeight?: number;
  note?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

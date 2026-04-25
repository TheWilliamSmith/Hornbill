import {
  WeightUnit,
  WeightGoalDirection,
  WeightGoalMode,
  WeightGoalStatus,
} from '@src/generated/prisma/enums';

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
  deadline: Date | null;
  toleranceWeight: number | null;
  note: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

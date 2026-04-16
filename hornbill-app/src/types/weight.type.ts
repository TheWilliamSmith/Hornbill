export enum WeightUnit {
  KG = "KG",
  LBS = "LBS",
}

export enum WeightGoalDirection {
  GAIN = "GAIN",
  LOSE = "LOSE",
  MAINTAIN = "MAINTAIN",
}

export enum WeightGoalMode {
  MILESTONE = "MILESTONE",
  DEADLINE = "DEADLINE",
}

export enum WeightGoalStatus {
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
  IN_PROGRESS = "IN_PROGRESS",
}

export interface WeightEntry {
  id: string;
  weight: number;
  unit: WeightUnit;
  measuredAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeightGoal {
  id: string;
  targetWeight: number;
  unit: WeightUnit;
  direction: WeightGoalDirection;
  mode: WeightGoalMode;
  status: WeightGoalStatus;
  deadline?: string;
  toleranceWeight?: number;
  note?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWeightEntryRequest {
  weight: number;
  unit: WeightUnit;
  note?: string;
  measuredAt?: string;
}

export interface CreateWeightGoalRequest {
  targetWeight: number;
  unit: WeightUnit;
  mode: WeightGoalMode;
  deadline?: string;
  toleranceWeight?: number;
  note?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type PlantStatus = "ACTIVE" | "ARCHIVED";
export type PlantCareType =
  | "WATERING"
  | "FERTILIZING"
  | "REPOTTING"
  | "MISTING"
  | "LEAF_CLEANING"
  | "ROTATION"
  | "TREATMENT"
  | "PRUNING"
  | "OTHER";
export type PlantHealthStatus =
  | "EXCELLENT"
  | "GOOD"
  | "FAIR"
  | "POOR"
  | "CRITICAL";
export type WishlistPriority = "HIGH" | "MEDIUM" | "LOW";
export type AcquisitionMode = "PURCHASE" | "CUTTING" | "GIFT" | "OTHER";
export type PlantLightLevel =
  | "FULL_SHADE"
  | "PARTIAL_SHADE"
  | "INDIRECT"
  | "BRIGHT_INDIRECT"
  | "FULL_SUN";
export type PlantHumidityLevel = "LOW" | "MEDIUM" | "HIGH";

export interface Plant {
  id: string;
  userId: string;
  locationId: string | null;
  customName: string;
  speciesName: string | null;
  photoUrl: string | null;
  acquiredAt: string | null;
  acquisitionMode: AcquisitionMode | null;
  purchasePrice: number | null;
  notes: string | null;
  status: PlantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlantCareProfile {
  id: string;
  plantId: string;
  wateringFrequencyGrowth: number | null;
  wateringFrequencyRest: number | null;
  lightLevel: PlantLightLevel | null;
  humidity: PlantHumidityLevel | null;
  minTemperature: number | null;
  maxTemperature: number | null;
  fertilizingFrequency: number | null;
  repottingFrequencyMonths: number | null;
  substrateType: string | null;
  toxicCats: boolean;
  toxicDogs: boolean;
  toxicChildren: boolean;
}

export interface PlantCareReminder {
  id: string;
  plantId: string;
  careType: PlantCareType;
  frequencyGrowth: number;
  frequencyRest: number | null;
  nextCareAt: string;
  isActive: boolean;
  plant?: { id: string; customName: string; speciesName: string | null };
}

export interface PlantCareLog {
  id: string;
  plantId: string;
  careType: PlantCareType;
  performedAt: string;
  note: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface PlantHealthLog {
  id: string;
  plantId: string;
  status: PlantHealthStatus;
  symptoms: string[];
  note: string | null;
  photoUrl: string | null;
  loggedAt: string;
}

export interface PlantGrowthLog {
  id: string;
  plantId: string;
  heightCm: number | null;
  leafCount: number | null;
  shootCount: number | null;
  spreadCm: number | null;
  note: string | null;
  measuredAt: string;
}

export interface PlantWishlistItem {
  id: string;
  speciesName: string;
  note: string | null;
  estimatedPrice: number | null;
  priority: WishlistPriority;
  link: string | null;
  convertedAt: string | null;
  createdAt: string;
}

export interface PlantStats {
  totalActive: number;
  totalAll: number;
  totalArchived: number;
  survivalRate: number;
  oldestPlant: { id: string; customName: string; acquiredAt: string | null } | null;
  weeklyWaterings: number;
  mostNeedyPlantId: string | null;
}

export interface TodayCareItem {
  date: string;
  grouped: Record<PlantCareType, PlantCareReminder[]>;
}

export interface WeekCareItem {
  from: string;
  to: string;
  grouped: Record<string, PlantCareReminder[]>;
}

export interface CreatePlantRequest {
  customName: string;
  speciesName?: string;
  photoUrl?: string;
  acquiredAt?: string;
  acquisitionMode?: AcquisitionMode;
  purchasePrice?: number;
  notes?: string;
  locationId?: string;
}

export interface CreateCareLogRequest {
  careType: PlantCareType;
  performedAt?: string;
  note?: string;
}

export interface CreateGrowthLogRequest {
  heightCm?: number;
  leafCount?: number;
  shootCount?: number;
  spreadCm?: number;
  note?: string;
  measuredAt?: string;
}

export interface CreateWishlistItemRequest {
  speciesName: string;
  note?: string;
  estimatedPrice?: number;
  priority?: WishlistPriority;
  link?: string;
}

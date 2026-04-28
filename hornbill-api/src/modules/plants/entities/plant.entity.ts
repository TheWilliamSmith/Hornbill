import {
  AcquisitionMode,
  ArchiveReason,
  PlantCareType,
  PlantHealthStatus,
  PlantHumidityLevel,
  PlantLightLevel,
  PlantStatus,
  WindowOrientation,
  WishlistPriority,
} from '@src/generated/prisma/enums';

export interface PlantLocation {
  id: string;
  userId: string;
  name: string;
  orientation: WindowOrientation | null;
  lightLevel: PlantLightLevel | null;
  hasRadiator: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plant {
  id: string;
  userId: string;
  locationId: string | null;
  customName: string;
  speciesName: string | null;
  photoUrl: string | null;
  acquiredAt: Date | null;
  acquisitionMode: AcquisitionMode | null;
  purchasePrice: number | null;
  notes: string | null;
  status: PlantStatus;
  archiveReason: ArchiveReason | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface PlantCareReminder {
  id: string;
  plantId: string;
  careType: PlantCareType;
  frequencyGrowth: number;
  frequencyRest: number | null;
  nextCareAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlantCareLog {
  id: string;
  plantId: string;
  careType: PlantCareType;
  performedAt: Date;
  note: string | null;
  photoUrl: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

export interface PlantHealthLog {
  id: string;
  plantId: string;
  status: PlantHealthStatus;
  symptoms: string[];
  note: string | null;
  photoUrl: string | null;
  loggedAt: Date;
  createdAt: Date;
}

export interface PlantGrowthLog {
  id: string;
  plantId: string;
  heightCm: number | null;
  leafCount: number | null;
  shootCount: number | null;
  spreadCm: number | null;
  photoUrl: string | null;
  note: string | null;
  measuredAt: Date;
  createdAt: Date;
}

export interface PlantWishlist {
  id: string;
  userId: string;
  speciesName: string;
  note: string | null;
  estimatedPrice: number | null;
  priority: WishlistPriority;
  link: string | null;
  convertedAt: Date | null;
  convertedPlantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

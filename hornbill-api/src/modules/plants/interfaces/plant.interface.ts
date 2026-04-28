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

export interface CreatePlantData {
  customName: string;
  speciesName?: string;
  photoUrl?: string;
  acquiredAt?: Date;
  acquisitionMode?: AcquisitionMode;
  purchasePrice?: number;
  notes?: string;
  locationId?: string;
}

export interface UpdatePlantData {
  customName?: string;
  speciesName?: string;
  photoUrl?: string;
  acquiredAt?: Date;
  acquisitionMode?: AcquisitionMode;
  purchasePrice?: number;
  notes?: string;
  locationId?: string;
}

export interface ArchivePlantData {
  archiveReason: ArchiveReason;
}

export interface UpsertCareProfileData {
  wateringFrequencyGrowth?: number;
  wateringFrequencyRest?: number;
  lightLevel?: PlantLightLevel;
  humidity?: PlantHumidityLevel;
  minTemperature?: number;
  maxTemperature?: number;
  fertilizingFrequency?: number;
  repottingFrequencyMonths?: number;
  substrateType?: string;
  toxicCats?: boolean;
  toxicDogs?: boolean;
  toxicChildren?: boolean;
}

export interface CreateReminderData {
  careType: PlantCareType;
  frequencyGrowth: number;
  frequencyRest?: number;
  nextCareAt: Date;
}

export interface UpdateReminderData {
  careType?: PlantCareType;
  frequencyGrowth?: number;
  frequencyRest?: number;
  nextCareAt?: Date;
  isActive?: boolean;
}

export interface CreateCareLogData {
  careType: PlantCareType;
  performedAt?: Date;
  note?: string;
  photoUrl?: string;
  details?: Record<string, unknown>;
}

export interface CreateHealthLogData {
  status: PlantHealthStatus;
  symptoms?: string[];
  note?: string;
  photoUrl?: string;
  loggedAt?: Date;
}

export interface CreateGrowthLogData {
  heightCm?: number;
  leafCount?: number;
  shootCount?: number;
  spreadCm?: number;
  photoUrl?: string;
  note?: string;
  measuredAt?: Date;
}

export interface CreateLocationData {
  name: string;
  orientation?: WindowOrientation;
  lightLevel?: PlantLightLevel;
  hasRadiator?: boolean;
}

export interface UpdateLocationData {
  name?: string;
  orientation?: WindowOrientation;
  lightLevel?: PlantLightLevel;
  hasRadiator?: boolean;
}

export interface CreateWishlistItemData {
  speciesName: string;
  note?: string;
  estimatedPrice?: number;
  priority?: WishlistPriority;
  link?: string;
}

export interface UpdateWishlistItemData {
  speciesName?: string;
  note?: string;
  estimatedPrice?: number;
  priority?: WishlistPriority;
  link?: string;
}

export interface PlantWithRelations {
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
  location: {
    id: string;
    name: string;
    orientation: WindowOrientation | null;
    lightLevel: PlantLightLevel | null;
  } | null;
  careProfile: {
    id: string;
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
  } | null;
}

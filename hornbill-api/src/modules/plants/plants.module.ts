import { Module } from '@nestjs/common';
import { PlantController } from './controllers/plant.controller';
import { PlantLocationController } from './controllers/plant-location.controller';
import { PlantWishlistController } from './controllers/plant-wishlist.controller';
import { PlantRepository } from './repositories/plant.repository';
import { PlantCareProfileRepository } from './repositories/plant-care-profile.repository';
import { PlantCareReminderRepository } from './repositories/plant-care-reminder.repository';
import { PlantCareLogRepository } from './repositories/plant-care-log.repository';
import { PlantHealthLogRepository } from './repositories/plant-health-log.repository';
import { PlantGrowthLogRepository } from './repositories/plant-growth-log.repository';
import { PlantLocationRepository } from './repositories/plant-location.repository';
import { PlantWishlistRepository } from './repositories/plant-wishlist.repository';
import { PlantService } from './services/plant.service';
import { PlantCareService } from './services/plant-care.service';
import { PlantHealthService } from './services/plant-health.service';
import { PlantGrowthService } from './services/plant-growth.service';
import { PlantStatsService } from './services/plant-stats.service';
import { PlantLocationService } from './services/plant-location.service';
import { PlantWishlistService } from './services/plant-wishlist.service';

@Module({
  controllers: [PlantController, PlantLocationController, PlantWishlistController],
  providers: [
    PlantRepository,
    PlantCareProfileRepository,
    PlantCareReminderRepository,
    PlantCareLogRepository,
    PlantHealthLogRepository,
    PlantGrowthLogRepository,
    PlantLocationRepository,
    PlantWishlistRepository,
    PlantService,
    PlantCareService,
    PlantHealthService,
    PlantGrowthService,
    PlantStatsService,
    PlantLocationService,
    PlantWishlistService,
  ],
})
export class PlantsModule {}

import { Module } from '@nestjs/common';
import { WeightController } from './controllers/weight.controller';
import { WeightEntryRepository } from './repositories/weight-entry.repository';
import { WeightGoalRepository } from './repositories/weight-goal-repository';
import { WeightService } from './services/weight.service';
import { WeightGoalService } from './services/weight-goal.service';

@Module({
  controllers: [WeightController],
  providers: [WeightEntryRepository, WeightGoalRepository, WeightService, WeightGoalService],
})
export class WeightModule {}

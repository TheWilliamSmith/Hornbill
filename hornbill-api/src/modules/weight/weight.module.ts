import { Module } from '@nestjs/common';
import { WeightController } from './controllers/weight.controller';
import { WeightEntryRepository } from './repositories/weight-entry.repository';
import { WeightService } from './services/weight.service';

@Module({
  controllers: [WeightController],
  providers: [WeightEntryRepository, WeightService],
})
export class WeightModule {}

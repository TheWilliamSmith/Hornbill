import { Module } from '@nestjs/common';
import { WeightController } from './controllers/weight.controller';
import { WeightRepository } from './repositories/weight.repository';
import { WeightService } from './services/weight.service';

@Module({
  controllers: [WeightController],
  providers: [WeightRepository, WeightService],
})
export class WeightModule {}

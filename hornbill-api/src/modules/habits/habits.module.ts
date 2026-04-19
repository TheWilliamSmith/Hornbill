import { Module } from '@nestjs/common';
import { HabitsController } from './controllers/habits.controller';
import { HabitLogsController } from './controllers/habit-logs.controller';
import { HabitsService } from './services/habits.service';
import { HabitLogsService } from './services/habit-logs.service';
import { HabitStatsService } from './services/habit-stats.service';
import { HabitsRepository } from './repositories/habits.repository';
import { HabitLogsRepository } from './repositories/habit-logs.repository';

@Module({
  controllers: [HabitsController, HabitLogsController],
  providers: [
    HabitsService,
    HabitLogsService,
    HabitStatsService,
    HabitsRepository,
    HabitLogsRepository,
  ],
})
export class HabitsModule {}

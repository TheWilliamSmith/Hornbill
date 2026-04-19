import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { HabitsService } from '../services/habits.service';
import { HabitStatsService } from '../services/habit-stats.service';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';

@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(
    private readonly habitsService: HabitsService,
    private readonly statsService: HabitStatsService,
  ) {}

  @Post()
  async create(@Body() dto: CreateHabitDto, @CurrentUser('sub') userId: string) {
    return this.habitsService.create(dto, userId);
  }

  @Get()
  async findAll(@CurrentUser('sub') userId: string) {
    return this.habitsService.findAll(userId);
  }

  @Get('today')
  async getToday(@CurrentUser('sub') userId: string) {
    return this.habitsService.getToday(userId);
  }

  @Get('archived')
  async findArchived(@CurrentUser('sub') userId: string) {
    return this.habitsService.findArchived(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.habitsService.findOne(id, userId);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.statsService.getStats(id, userId);
  }

  @Get(':id/heatmap')
  async getHeatmap(
    @Param('id') id: string,
    @Query('year') year: string,
    @CurrentUser('sub') userId: string,
  ) {
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.statsService.getHeatmap(id, y, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.habitsService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.habitsService.archive(id, userId);
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.habitsService.restore(id, userId);
  }
}

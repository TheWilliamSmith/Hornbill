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
} from '@nestjs/common';
import { CreateWeightEntryDto } from '../dto/weight-entry-dto/create-weight-entry.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { WeightService } from '../services/weight.service';
import { WeightGoalService } from '../services/weight-goal.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { GetWeightEntriesQueryDto } from '../dto/weight-entry-dto/get-weight-entries-query.dto';
import { UpdateWeightEntryDto } from '../dto/weight-entry-dto/update-weight-entry.dto';
import { CreateWeightGoalDto } from '../dto/weight-goal-dto/create-weight-goal.dto';
import { UpdateWeightGoalDto } from '../dto/weight-goal-dto/update-weight-goal.dto';
import { GetWeightGoalsQueryDto } from '../dto/weight-goal-dto/get-weight-goals-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('weight')
export class WeightController {
  constructor(
    private readonly weightService: WeightService,
    private readonly weightGoalService: WeightGoalService,
  ) {}

  @Post('entry')
  async create(@Body() dto: CreateWeightEntryDto, @CurrentUser('sub') userId: string) {
    return await this.weightService.createWeightEntry(dto, userId);
  }

  @Get('entries')
  async getEntries(@CurrentUser('sub') userId: string, @Query() query: GetWeightEntriesQueryDto) {
    return await this.weightService.getEntries(userId, query);
  }

  @Patch('entry/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWeightEntryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.weightService.updateWeightEntry(id, dto, userId);
  }

  @Delete('entry/:id')
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return await this.weightService.deleteWeightEntry(id, userId);
  }

  @Post('goal')
  async createGoal(@Body() dto: CreateWeightGoalDto, @CurrentUser('sub') userId: string) {
    return await this.weightGoalService.createWeightGoal(dto, userId);
  }

  @Get('goals')
  async getGoals(@CurrentUser('sub') userId: string, @Query() query: GetWeightGoalsQueryDto) {
    return await this.weightGoalService.getGoals(userId, query);
  }

  @Get('goal/:id')
  async getGoal(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return await this.weightGoalService.getGoal(id, userId);
  }

  @Patch('goal/:id')
  async updateGoal(
    @Param('id') id: string,
    @Body() dto: UpdateWeightGoalDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.weightGoalService.updateWeightGoal(id, dto, userId);
  }

  @Delete('goal/:id')
  async deleteGoal(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return await this.weightGoalService.deleteWeightGoal(id, userId);
  }
}

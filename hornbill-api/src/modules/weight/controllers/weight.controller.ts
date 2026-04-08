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
}

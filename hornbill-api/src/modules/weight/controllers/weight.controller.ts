import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CreateWeightEntryDto } from '../dto/create-weight-entry.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { WeightService } from '../services/weight.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { GetWeightEntriesQueryDto } from '../dto/get-weight-entries-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('weight')
export class WeightController {
  constructor(private readonly weightService: WeightService) {}

  @Post('entry')
  async create(@Body() dto: CreateWeightEntryDto, @CurrentUser('sub') userId: string) {
    return await this.weightService.createWeightEntry(dto, userId);
  }

  @Get('entries')
  async getEntries(@CurrentUser('sub') userId: string, @Query() query: GetWeightEntriesQueryDto) {
    return await this.weightService.getEntries(userId, query);
  }
}

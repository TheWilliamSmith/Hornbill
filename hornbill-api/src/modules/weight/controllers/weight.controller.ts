import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateWeightEntryDto } from '../dto/create-weight-entry.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WeightService } from '../services/weight.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('weight')
export class WeightController {
  constructor(private readonly weightService: WeightService) {}

  @Post('entry')
  async create(@Body() dto: CreateWeightEntryDto, @CurrentUser('sub') userId: string) {
    return await this.weightService.createWeightEntry(dto, userId);
  }
}

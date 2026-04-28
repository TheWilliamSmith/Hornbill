import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PlantLocationService } from '../services/plant-location.service';
import { CreateLocationDto } from '../dto/location-dto/create-location.dto';
import { UpdateLocationDto } from '../dto/location-dto/update-location.dto';

@UseGuards(JwtAuthGuard)
@Controller('plant-locations')
export class PlantLocationController {
  constructor(private readonly locationService: PlantLocationService) {}

  @Post()
  async create(@Body() dto: CreateLocationDto, @CurrentUser('sub') userId: string) {
    return this.locationService.createLocation(dto, userId);
  }

  @Get()
  async getAll(@CurrentUser('sub') userId: string) {
    return this.locationService.getLocations(userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.locationService.getLocation(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.locationService.updateLocation(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.locationService.deleteLocation(id, userId);
  }
}

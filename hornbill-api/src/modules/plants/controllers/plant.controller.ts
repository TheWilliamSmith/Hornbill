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
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PlantService } from '../services/plant.service';
import { PlantCareService } from '../services/plant-care.service';
import { PlantHealthService } from '../services/plant-health.service';
import { PlantGrowthService } from '../services/plant-growth.service';
import { PlantStatsService } from '../services/plant-stats.service';
import { CreatePlantDto } from '../dto/plant-dto/create-plant.dto';
import { UpdatePlantDto } from '../dto/plant-dto/update-plant.dto';
import { ArchivePlantDto } from '../dto/plant-dto/archive-plant.dto';
import { GetPlantsQueryDto } from '../dto/plant-dto/get-plants-query.dto';
import { UpsertCareProfileDto } from '../dto/care-profile-dto/upsert-care-profile.dto';
import { CreateReminderDto } from '../dto/reminder-dto/create-reminder.dto';
import { UpdateReminderDto } from '../dto/reminder-dto/update-reminder.dto';
import { CreateCareLogDto } from '../dto/care-log-dto/create-care-log.dto';
import { GetCareLogsQueryDto } from '../dto/care-log-dto/get-care-logs-query.dto';
import { CreateHealthLogDto } from '../dto/health-log-dto/create-health-log.dto';
import { CreateGrowthLogDto } from '../dto/growth-log-dto/create-growth-log.dto';
import { GetGrowthLogsQueryDto } from '../dto/growth-log-dto/get-growth-logs-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('plants')
export class PlantController {
  constructor(
    private readonly plantService: PlantService,
    private readonly careService: PlantCareService,
    private readonly healthService: PlantHealthService,
    private readonly growthService: PlantGrowthService,
    private readonly statsService: PlantStatsService,
  ) {}

  // --- Stats & views (static routes before :id) ---

  @Get('stats')
  async getStats(@CurrentUser('sub') userId: string) {
    return this.statsService.getStats(userId);
  }

  @Get('today')
  async getToday(@CurrentUser('sub') userId: string) {
    return this.statsService.getToday(userId);
  }

  @Get('week')
  async getWeek(@CurrentUser('sub') userId: string) {
    return this.statsService.getWeek(userId);
  }

  @Get('gallery')
  async getGallery(@CurrentUser('sub') userId: string, @Query('plantId') plantId?: string) {
    return this.statsService.getGallery(userId, plantId);
  }

  // --- Plant CRUD ---

  @Post()
  async create(@Body() dto: CreatePlantDto, @CurrentUser('sub') userId: string) {
    return this.plantService.createPlant(dto, userId);
  }

  @Get()
  async getAll(@CurrentUser('sub') userId: string, @Query() query: GetPlantsQueryDto) {
    return this.plantService.getPlants(userId, query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.plantService.getPlant(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlantDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.plantService.updatePlant(id, dto, userId);
  }

  @Post(':id/archive')
  async archive(
    @Param('id') id: string,
    @Body() dto: ArchivePlantDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.plantService.archivePlant(id, dto, userId);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.plantService.restorePlant(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.plantService.deletePlant(id, userId);
  }

  // --- Care Profile ---

  @Post(':plantId/care-profile')
  async upsertCareProfile(
    @Param('plantId') plantId: string,
    @Body() dto: UpsertCareProfileDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.careService.upsertCareProfile(plantId, dto, userId);
  }

  @Get(':plantId/care-profile')
  async getCareProfile(@Param('plantId') plantId: string, @CurrentUser('sub') userId: string) {
    return this.careService.getCareProfile(plantId, userId);
  }

  @Delete(':plantId/care-profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCareProfile(@Param('plantId') plantId: string, @CurrentUser('sub') userId: string) {
    await this.careService.deleteCareProfile(plantId, userId);
  }

  // --- Reminders ---

  @Post(':plantId/reminders')
  async createReminder(
    @Param('plantId') plantId: string,
    @Body() dto: CreateReminderDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.careService.createReminder(plantId, dto, userId);
  }

  @Get(':plantId/reminders')
  async getReminders(@Param('plantId') plantId: string, @CurrentUser('sub') userId: string) {
    return this.careService.getReminders(plantId, userId);
  }

  @Patch('reminders/:reminderId')
  async updateReminder(
    @Param('reminderId') reminderId: string,
    @Body() dto: UpdateReminderDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.careService.updateReminder(reminderId, dto, userId);
  }

  @Delete('reminders/:reminderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReminder(@Param('reminderId') reminderId: string, @CurrentUser('sub') userId: string) {
    await this.careService.deleteReminder(reminderId, userId);
  }

  // --- Care Logs ---

  @Post(':plantId/care-logs')
  async createCareLog(
    @Param('plantId') plantId: string,
    @Body() dto: CreateCareLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.careService.createCareLog(plantId, dto, userId);
  }

  @Get(':plantId/care-logs')
  async getCareLogs(
    @Param('plantId') plantId: string,
    @Query() query: GetCareLogsQueryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.careService.getCareLogs(plantId, query, userId);
  }

  @Delete('care-logs/:logId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCareLog(@Param('logId') logId: string, @CurrentUser('sub') userId: string) {
    await this.careService.deleteCareLog(logId, userId);
  }

  // --- Health Logs ---

  @Post(':plantId/health-logs')
  async createHealthLog(
    @Param('plantId') plantId: string,
    @Body() dto: CreateHealthLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.healthService.createHealthLog(plantId, dto, userId);
  }

  @Get(':plantId/health-logs')
  async getHealthLogs(
    @Param('plantId') plantId: string,
    @Query() query: GetGrowthLogsQueryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.healthService.getHealthLogs(plantId, query, userId);
  }

  @Delete('health-logs/:logId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHealthLog(@Param('logId') logId: string, @CurrentUser('sub') userId: string) {
    await this.healthService.deleteHealthLog(logId, userId);
  }

  // --- Growth Logs ---

  @Post(':plantId/growth-logs')
  async createGrowthLog(
    @Param('plantId') plantId: string,
    @Body() dto: CreateGrowthLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.growthService.createGrowthLog(plantId, dto, userId);
  }

  @Get(':plantId/growth-logs')
  async getGrowthLogs(
    @Param('plantId') plantId: string,
    @Query() query: GetGrowthLogsQueryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.growthService.getGrowthLogs(plantId, query, userId);
  }

  @Delete('growth-logs/:logId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGrowthLog(@Param('logId') logId: string, @CurrentUser('sub') userId: string) {
    await this.growthService.deleteGrowthLog(logId, userId);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationMapper } from '@common/mappers/pagination.mapper';
import { PlantRepository } from '../repositories/plant.repository';
import { PlantCareProfileRepository } from '../repositories/plant-care-profile.repository';
import { PlantCareReminderRepository } from '../repositories/plant-care-reminder.repository';
import { PlantCareLogRepository } from '../repositories/plant-care-log.repository';
import { UpsertCareProfileDto } from '../dto/care-profile-dto/upsert-care-profile.dto';
import { CreateReminderDto } from '../dto/reminder-dto/create-reminder.dto';
import { UpdateReminderDto } from '../dto/reminder-dto/update-reminder.dto';
import { CreateCareLogDto } from '../dto/care-log-dto/create-care-log.dto';
import { GetCareLogsQueryDto } from '../dto/care-log-dto/get-care-logs-query.dto';

@Injectable()
export class PlantCareService {
  constructor(
    private readonly plantRepo: PlantRepository,
    private readonly careProfileRepo: PlantCareProfileRepository,
    private readonly reminderRepo: PlantCareReminderRepository,
    private readonly careLogRepo: PlantCareLogRepository,
  ) {}

  private async assertPlantOwnership(plantId: string, userId: string): Promise<void> {
    const plant = await this.plantRepo.findByIdAndUserId(plantId, userId);
    if (!plant) throw new NotFoundException(`Plant with id ${plantId} not found`);
  }

  // --- Care Profile ---

  async upsertCareProfile(plantId: string, dto: UpsertCareProfileDto, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    return this.careProfileRepo.upsert(plantId, dto);
  }

  async getCareProfile(plantId: string, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    const profile = await this.careProfileRepo.findByPlantId(plantId);
    if (!profile) throw new NotFoundException(`Care profile for plant ${plantId} not found`);
    return profile;
  }

  async deleteCareProfile(plantId: string, userId: string): Promise<void> {
    await this.assertPlantOwnership(plantId, userId);
    await this.careProfileRepo.delete(plantId);
  }

  // --- Reminders ---

  async createReminder(plantId: string, dto: CreateReminderDto, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    return this.reminderRepo.create(plantId, dto);
  }

  async getReminders(plantId: string, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    return this.reminderRepo.findManyByPlantId(plantId);
  }

  async updateReminder(reminderId: string, dto: UpdateReminderDto, userId: string) {
    const reminder = await this.reminderRepo.findById(reminderId);
    if (!reminder) throw new NotFoundException(`Reminder with id ${reminderId} not found`);
    await this.assertPlantOwnership(reminder.plantId, userId);
    return this.reminderRepo.update(reminderId, dto);
  }

  async deleteReminder(reminderId: string, userId: string): Promise<void> {
    const reminder = await this.reminderRepo.findById(reminderId);
    if (!reminder) throw new NotFoundException(`Reminder with id ${reminderId} not found`);
    await this.assertPlantOwnership(reminder.plantId, userId);
    await this.reminderRepo.delete(reminderId);
  }

  // --- Care Logs ---

  async createCareLog(plantId: string, dto: CreateCareLogDto, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    const log = await this.careLogRepo.create(plantId, dto);

    // Update next care date on matching active reminder
    const reminders = await this.reminderRepo.findManyByPlantId(plantId);
    const matchingReminder = reminders.find((r) => r.careType === dto.careType && r.isActive);
    if (matchingReminder) {
      const performedAt = dto.performedAt ? new Date(dto.performedAt) : new Date();
      const frequency = this.getCurrentFrequency(matchingReminder.frequencyGrowth, matchingReminder.frequencyRest);
      const nextCareAt = new Date(performedAt.getTime() + frequency * 24 * 60 * 60 * 1000);
      await this.reminderRepo.update(matchingReminder.id, { nextCareAt });
    }

    return log;
  }

  async getCareLogs(plantId: string, query: GetCareLogsQueryDto, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    const { page, limit, careType } = query;
    const [logs, total] = await Promise.all([
      this.careLogRepo.findManyByPlantId(plantId, page, limit, careType),
      this.careLogRepo.countByPlantId(plantId, careType),
    ]);
    return PaginationMapper.toPaginatedResponse(logs, total, page, limit);
  }

  async deleteCareLog(logId: string, userId: string): Promise<void> {
    const log = await this.careLogRepo.findById(logId);
    if (!log) throw new NotFoundException(`Care log with id ${logId} not found`);
    await this.assertPlantOwnership(log.plantId, userId);
    await this.careLogRepo.delete(logId);
  }

  private getCurrentFrequency(frequencyGrowth: number, frequencyRest: number | null): number {
    const month = new Date().getMonth() + 1; // 1-12
    const isGrowthSeason = month >= 3 && month <= 9;
    return isGrowthSeason || !frequencyRest ? frequencyGrowth : frequencyRest;
  }
}

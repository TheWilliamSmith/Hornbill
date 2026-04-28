import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationMapper } from '@common/mappers/pagination.mapper';
import { PlantRepository } from '../repositories/plant.repository';
import { PlantGrowthLogRepository } from '../repositories/plant-growth-log.repository';
import { CreateGrowthLogDto } from '../dto/growth-log-dto/create-growth-log.dto';
import { GetGrowthLogsQueryDto } from '../dto/growth-log-dto/get-growth-logs-query.dto';

@Injectable()
export class PlantGrowthService {
  constructor(
    private readonly plantRepo: PlantRepository,
    private readonly growthLogRepo: PlantGrowthLogRepository,
  ) {}

  private async assertPlantOwnership(plantId: string, userId: string): Promise<void> {
    const plant = await this.plantRepo.findByIdAndUserId(plantId, userId);
    if (!plant) throw new NotFoundException(`Plant with id ${plantId} not found`);
  }

  async createGrowthLog(plantId: string, dto: CreateGrowthLogDto, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    return this.growthLogRepo.create(plantId, dto);
  }

  async getGrowthLogs(plantId: string, query: GetGrowthLogsQueryDto, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    const { page, limit } = query;
    const [logs, total] = await Promise.all([
      this.growthLogRepo.findManyByPlantId(plantId, page, limit),
      this.growthLogRepo.countByPlantId(plantId),
    ]);
    return PaginationMapper.toPaginatedResponse(logs, total, page, limit);
  }

  async deleteGrowthLog(logId: string, userId: string): Promise<void> {
    const log = await this.growthLogRepo.findById(logId);
    if (!log) throw new NotFoundException(`Growth log with id ${logId} not found`);
    await this.assertPlantOwnership(log.plantId, userId);
    await this.growthLogRepo.delete(logId);
  }
}

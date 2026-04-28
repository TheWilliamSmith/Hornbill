import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationMapper } from '@common/mappers/pagination.mapper';
import { PlantRepository } from '../repositories/plant.repository';
import { PlantHealthLogRepository } from '../repositories/plant-health-log.repository';
import { CreateHealthLogDto } from '../dto/health-log-dto/create-health-log.dto';
import { GetGrowthLogsQueryDto } from '../dto/growth-log-dto/get-growth-logs-query.dto';

@Injectable()
export class PlantHealthService {
  constructor(
    private readonly plantRepo: PlantRepository,
    private readonly healthLogRepo: PlantHealthLogRepository,
  ) {}

  private async assertPlantOwnership(plantId: string, userId: string): Promise<void> {
    const plant = await this.plantRepo.findByIdAndUserId(plantId, userId);
    if (!plant) throw new NotFoundException(`Plant with id ${plantId} not found`);
  }

  async createHealthLog(plantId: string, dto: CreateHealthLogDto, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    return this.healthLogRepo.create(plantId, {
      ...dto,
      symptoms: dto.symptoms ?? [],
    });
  }

  async getHealthLogs(plantId: string, query: GetGrowthLogsQueryDto, userId: string) {
    await this.assertPlantOwnership(plantId, userId);
    const { page, limit } = query;
    const [logs, total] = await Promise.all([
      this.healthLogRepo.findManyByPlantId(plantId, page, limit),
      this.healthLogRepo.countByPlantId(plantId),
    ]);
    return PaginationMapper.toPaginatedResponse(logs, total, page, limit);
  }

  async deleteHealthLog(logId: string, userId: string): Promise<void> {
    const log = await this.healthLogRepo.findById(logId);
    if (!log) throw new NotFoundException(`Health log with id ${logId} not found`);
    await this.assertPlantOwnership(log.plantId, userId);
    await this.healthLogRepo.delete(logId);
  }
}

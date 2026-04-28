import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationMapper } from '@common/mappers/pagination.mapper';
import { PlantRepository } from '../repositories/plant.repository';
import { CreatePlantDto } from '../dto/plant-dto/create-plant.dto';
import { UpdatePlantDto } from '../dto/plant-dto/update-plant.dto';
import { ArchivePlantDto } from '../dto/plant-dto/archive-plant.dto';
import { GetPlantsQueryDto } from '../dto/plant-dto/get-plants-query.dto';

@Injectable()
export class PlantService {
  constructor(private readonly repo: PlantRepository) {}

  async createPlant(dto: CreatePlantDto, userId: string) {
    return this.repo.create(dto, userId);
  }

  async getPlants(userId: string, query: GetPlantsQueryDto) {
    const { page, limit, status, locationId } = query;
    const [plants, total] = await Promise.all([
      this.repo.findManyByUserId(userId, page, limit, status, locationId),
      this.repo.countByUserId(userId, status, locationId),
    ]);
    return PaginationMapper.toPaginatedResponse(plants, total, page, limit);
  }

  async getPlant(id: string, userId: string) {
    const plant = await this.repo.findByIdAndUserId(id, userId);
    if (!plant) throw new NotFoundException(`Plant with id ${id} not found`);
    return plant;
  }

  async updatePlant(id: string, dto: UpdatePlantDto, userId: string) {
    await this.getPlant(id, userId);
    return this.repo.update(id, userId, dto);
  }

  async archivePlant(id: string, dto: ArchivePlantDto, userId: string) {
    await this.getPlant(id, userId);
    return this.repo.archive(id, userId, dto.archiveReason);
  }

  async restorePlant(id: string, userId: string) {
    await this.getPlant(id, userId);
    return this.repo.restore(id, userId);
  }

  async deletePlant(id: string, userId: string): Promise<void> {
    await this.getPlant(id, userId);
    await this.repo.delete(id, userId);
  }
}

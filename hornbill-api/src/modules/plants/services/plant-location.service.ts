import { Injectable, NotFoundException } from '@nestjs/common';
import { PlantLocationRepository } from '../repositories/plant-location.repository';
import { CreateLocationDto } from '../dto/location-dto/create-location.dto';
import { UpdateLocationDto } from '../dto/location-dto/update-location.dto';

@Injectable()
export class PlantLocationService {
  constructor(private readonly repo: PlantLocationRepository) {}

  async createLocation(dto: CreateLocationDto, userId: string) {
    return this.repo.create(userId, dto);
  }

  async getLocations(userId: string) {
    return this.repo.findManyByUserId(userId);
  }

  async getLocation(id: string, userId: string) {
    const location = await this.repo.findByIdAndUserId(id, userId);
    if (!location) throw new NotFoundException(`Location with id ${id} not found`);
    return location;
  }

  async updateLocation(id: string, dto: UpdateLocationDto, userId: string) {
    await this.getLocation(id, userId);
    return this.repo.update(id, userId, dto);
  }

  async deleteLocation(id: string, userId: string): Promise<void> {
    await this.getLocation(id, userId);
    await this.repo.delete(id, userId);
  }
}

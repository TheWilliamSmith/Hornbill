import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationMapper } from '@common/mappers/pagination.mapper';
import { PlantWishlistRepository } from '../repositories/plant-wishlist.repository';
import { PlantRepository } from '../repositories/plant.repository';
import { CreateWishlistItemDto } from '../dto/wishlist-dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from '../dto/wishlist-dto/update-wishlist-item.dto';
import { ConvertWishlistItemDto } from '../dto/wishlist-dto/convert-wishlist-item.dto';
import { GetPlantsQueryDto } from '../dto/plant-dto/get-plants-query.dto';

@Injectable()
export class PlantWishlistService {
  constructor(
    private readonly wishlistRepo: PlantWishlistRepository,
    private readonly plantRepo: PlantRepository,
  ) {}

  async createItem(dto: CreateWishlistItemDto, userId: string) {
    return this.wishlistRepo.create(userId, dto);
  }

  async getItems(userId: string, query: GetPlantsQueryDto) {
    const { page, limit } = query;
    const [items, total] = await Promise.all([
      this.wishlistRepo.findManyByUserId(userId, page, limit),
      this.wishlistRepo.countByUserId(userId),
    ]);
    return PaginationMapper.toPaginatedResponse(items, total, page, limit);
  }

  async getItem(id: string, userId: string) {
    const item = await this.wishlistRepo.findByIdAndUserId(id, userId);
    if (!item) throw new NotFoundException(`Wishlist item with id ${id} not found`);
    return item;
  }

  async updateItem(id: string, dto: UpdateWishlistItemDto, userId: string) {
    await this.getItem(id, userId);
    return this.wishlistRepo.update(id, dto);
  }

  async deleteItem(id: string, userId: string): Promise<void> {
    await this.getItem(id, userId);
    await this.wishlistRepo.delete(id, userId);
  }

  async convertToPlant(id: string, dto: ConvertWishlistItemDto, userId: string) {
    const wishlistItem = await this.getItem(id, userId);

    const plant = await this.plantRepo.create(
      {
        customName: dto.customName,
        speciesName: wishlistItem.speciesName,
        photoUrl: dto.photoUrl,
        acquiredAt: dto.acquiredAt,
        acquisitionMode: dto.acquisitionMode,
        purchasePrice: dto.purchasePrice ?? wishlistItem.estimatedPrice ?? undefined,
        notes: dto.notes,
        locationId: dto.locationId,
      },
      userId,
    );

    await this.wishlistRepo.markConverted(id, plant.id);

    return plant;
  }
}

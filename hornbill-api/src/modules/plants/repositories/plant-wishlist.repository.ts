import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { CreateWishlistItemData, UpdateWishlistItemData } from '../interfaces/plant.interface';
import { PlantWishlist } from '../entities/plant.entity';

@Injectable()
export class PlantWishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateWishlistItemData): Promise<PlantWishlist> {
    return this.prisma.plantWishlist.create({ data: { ...data, userId } });
  }

  async findManyByUserId(userId: string, page: number, limit: number): Promise<PlantWishlist[]> {
    return this.prisma.plantWishlist.findMany({
      where: { userId },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.plantWishlist.count({ where: { userId } });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<PlantWishlist | null> {
    return this.prisma.plantWishlist.findFirst({ where: { id, userId } });
  }

  async update(id: string, data: UpdateWishlistItemData): Promise<PlantWishlist> {
    return this.prisma.plantWishlist.update({ where: { id }, data });
  }

  async markConverted(id: string, plantId: string): Promise<PlantWishlist> {
    return this.prisma.plantWishlist.update({
      where: { id },
      data: { convertedAt: new Date(), convertedPlantId: plantId },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.prisma.plantWishlist.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      throw new Error('Wishlist item not found or user unauthorized');
    }
  }
}

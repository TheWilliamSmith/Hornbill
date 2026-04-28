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
import { PlantWishlistService } from '../services/plant-wishlist.service';
import { CreateWishlistItemDto } from '../dto/wishlist-dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from '../dto/wishlist-dto/update-wishlist-item.dto';
import { ConvertWishlistItemDto } from '../dto/wishlist-dto/convert-wishlist-item.dto';
import { GetPlantsQueryDto } from '../dto/plant-dto/get-plants-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('plant-wishlist')
export class PlantWishlistController {
  constructor(private readonly wishlistService: PlantWishlistService) {}

  @Post()
  async create(@Body() dto: CreateWishlistItemDto, @CurrentUser('sub') userId: string) {
    return this.wishlistService.createItem(dto, userId);
  }

  @Get()
  async getAll(@CurrentUser('sub') userId: string, @Query() query: GetPlantsQueryDto) {
    return this.wishlistService.getItems(userId, query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.wishlistService.getItem(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWishlistItemDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.wishlistService.updateItem(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.wishlistService.deleteItem(id, userId);
  }

  @Post(':id/convert')
  async convert(
    @Param('id') id: string,
    @Body() dto: ConvertWishlistItemDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.wishlistService.convertToPlant(id, dto, userId);
  }
}

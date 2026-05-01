import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserMangaCollectionService } from '../services/user-manga-collection.service';
import { MangaVolumeRepository } from '../repositories/manga-volume.repository';
import { AddToCollectionDto } from '../dto/add-to-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';

@UseGuards(JwtAuthGuard)
@Controller('manga')
export class MangaUserController {
  constructor(
    private readonly collectionService: UserMangaCollectionService,
    private readonly volumeRepo: MangaVolumeRepository,
  ) {}

  @Get('search')
  search(@Query('q') q: string = '', @CurrentUser('sub') userId: string) {
    return this.collectionService.search(q, userId);
  }

  @Get('collection')
  getCollection(@CurrentUser('sub') userId: string) {
    return this.collectionService.getCollection(userId);
  }

  @Get('collection/:id')
  findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.collectionService.findOne(userId, id);
  }

  @Get('collection/:id/volumes')
  async getCollectionVolumes(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    const entry = await this.collectionService.findOne(userId, id);
    return this.volumeRepo.findByManga(entry.mangaReferenceId);
  }

  @Post('collection')
  @HttpCode(HttpStatus.CREATED)
  addToCollection(@CurrentUser('sub') userId: string, @Body() dto: AddToCollectionDto) {
    return this.collectionService.addToCollection(userId, dto);
  }

  @Patch('collection/:id')
  updateEntry(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionService.updateEntry(userId, id, dto);
  }

  @Delete('collection/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromCollection(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    await this.collectionService.removeFromCollection(userId, id);
  }
}

import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/admin/guards/roles.guard';
import { Roles } from '@modules/admin/guards/roles.decorator';
import { UserRole } from '@src/generated/prisma/enums';
import { MangaCatalogService } from '../services/manga-catalog.service';
import { MangaImportService } from '../services/manga-import.service';
import { ListCatalogQueryDto } from '../dto/list-catalog-query.dto';
import { MangaVolumeRepository } from '../repositories/manga-volume.repository';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/manga/catalog')
export class MangaCatalogController {
  constructor(
    private readonly catalogService: MangaCatalogService,
    private readonly importService: MangaImportService,
    private readonly volumeRepo: MangaVolumeRepository,
  ) {}

  @Get('stats')
  getStats() {
    return this.catalogService.getStats();
  }

  @Get()
  list(@Query() query: ListCatalogQueryDto) {
    return this.catalogService.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }

  @Post('sync-all-volumes')
  syncAllVolumes(@CurrentUser('sub') adminId: string) {
    return this.importService.triggerSyncAllVolumes(adminId);
  }

  @Post(':id/sync-volumes')
  syncVolumes(@Param('id') id: string) {
    return this.importService.syncMangaVolumes(id);
  }

  @Post(':id/sync-covers')
  syncCovers(@Param('id') id: string) {
    return this.importService.syncVolumeCovers(id);
  }

  @Get(':id/volumes')
  getVolumes(@Param('id') id: string) {
    return this.volumeRepo.findByManga(id);
  }

  @Patch('volumes/:volumeId')
  updateVolume(
    @Param('volumeId') volumeId: string,
    @Body()
    body: {
      coverImageUrl?: string;
      isbn?: string;
      title?: string;
      releaseYear?: number;
      releaseMonth?: number;
      notes?: string;
    },
  ) {
    return this.volumeRepo.update(volumeId, body);
  }
}

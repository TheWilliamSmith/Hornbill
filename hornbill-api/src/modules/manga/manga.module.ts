import { Module } from '@nestjs/common';
import { MangaAdminController } from './controllers/manga-admin.controller';
import { MangaCatalogController } from './controllers/manga-catalog.controller';
import { MangaUserController } from './controllers/manga-user.controller';
import { MangaImportService } from './services/manga-import.service';
import { MangaCatalogService } from './services/manga-catalog.service';
import { AnilistClientService } from './services/anilist-client.service';
import { MangaDexClientService } from './services/mangadex-client.service';
import { UserMangaCollectionService } from './services/user-manga-collection.service';
import { MangaReferenceRepository } from './repositories/manga-reference.repository';
import { MangaImportJobRepository } from './repositories/manga-import-job.repository';
import { MangaVolumeRepository } from './repositories/manga-volume.repository';
import { UserMangaCollectionRepository } from './repositories/user-manga-collection.repository';

@Module({
  controllers: [MangaAdminController, MangaCatalogController, MangaUserController],
  providers: [
    MangaImportService,
    MangaCatalogService,
    AnilistClientService,
    MangaDexClientService,
    UserMangaCollectionService,
    MangaReferenceRepository,
    MangaImportJobRepository,
    MangaVolumeRepository,
    UserMangaCollectionRepository,
  ],
})
export class MangaModule {}

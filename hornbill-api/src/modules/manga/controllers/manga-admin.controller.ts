import { Controller, Post, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/admin/guards/roles.guard';
import { Roles } from '@modules/admin/guards/roles.decorator';
import { UserRole } from '@src/generated/prisma/enums';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { MangaImportService } from '../services/manga-import.service';
import { MangaImportJobRepository } from '../repositories/manga-import-job.repository';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/manga')
export class MangaAdminController {
  constructor(
    private readonly importService: MangaImportService,
    private readonly importJobRepo: MangaImportJobRepository,
  ) {}

  @Post('import/top')
  @HttpCode(HttpStatus.CREATED)
  triggerTop10(@CurrentUser('sub') adminId: string) {
    return this.importService.triggerTop10Import(adminId);
  }

  @Post('import/full')
  @HttpCode(HttpStatus.CREATED)
  triggerFull(@CurrentUser('sub') adminId: string) {
    return this.importService.triggerFullImport(adminId);
  }

  @Get('imports')
  listImports() {
    return this.importJobRepo.findAll();
  }

  @Get('imports/:id')
  getImport(@Param('id') id: string) {
    return this.importJobRepo.findById(id);
  }

  @Post('imports/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelImport(@Param('id') id: string) {
    return this.importService.cancelImport(id);
  }
}

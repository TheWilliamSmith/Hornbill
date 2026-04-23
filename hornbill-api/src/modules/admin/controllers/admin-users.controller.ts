import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AdminUsersService } from '../services/admin-users.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UserRole } from '@src/generated/prisma/enums';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { UpdateUserAdminDto } from '../dto/update-user-admin.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('stats')
  getStats() {
    return this.adminUsersService.getStats();
  }

  @Get('users')
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminUsersService.listUsers(query);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminUsersService.getUser(id);
  }

  @Patch('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUser(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserAdminDto,
  ) {
    await this.adminUsersService.updateUser(adminId, id, dto);
  }

  @Patch('users/:id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateUser(@CurrentUser('sub') adminId: string, @Param('id') id: string) {
    await this.adminUsersService.deactivateUser(adminId, id);
  }

  @Patch('users/:id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async activateUser(@Param('id') id: string) {
    await this.adminUsersService.activateUser(id);
  }
}

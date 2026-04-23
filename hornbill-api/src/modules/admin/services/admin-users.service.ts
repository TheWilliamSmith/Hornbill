import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminUsersRepository } from '../repositories/admin-users.repository';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { UpdateUserAdminDto } from '../dto/update-user-admin.dto';
import { AdminUserDetailDto, AdminUserListItemDto } from '../dto/user-detail-admin.dto';
import { AdminStatsDto } from '../dto/admin-stats.dto';
import { UserRole } from '@src/generated/prisma/enums';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class AdminUsersService {
  constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  async listUsers(query: ListUsersQueryDto): Promise<PaginatedResponse<AdminUserListItemDto>> {
    const { data, total } = await this.adminUsersRepository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    };
  }

  async getUser(id: string): Promise<AdminUserDetailDto> {
    const user = await this.adminUsersRepository.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async updateUser(adminId: string, id: string, dto: UpdateUserAdminDto): Promise<void> {
    const target = await this.adminUsersRepository.findRawById(id);
    if (!target) throw new NotFoundException('Utilisateur introuvable');

    if (dto.role !== undefined && dto.role !== target.role) {
      if (adminId === id) {
        throw new ForbiddenException('Vous ne pouvez pas modifier votre propre rôle.');
      }

      if (target.role === UserRole.ADMIN && dto.role !== UserRole.ADMIN) {
        const activeAdmins = await this.adminUsersRepository.countActiveAdmins();
        if (activeAdmins <= 1) {
          throw new BadRequestException(
            'Impossible de rétrograder le dernier administrateur actif.',
          );
        }
      }
    }

    if (dto.email !== undefined && dto.email !== target.email) {
      const existing = await this.adminUsersRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Cet email est déjà utilisé.');
      }
    }

    await this.adminUsersRepository.updateUser(id, dto);
  }

  async deactivateUser(adminId: string, id: string): Promise<void> {
    if (adminId === id) {
      throw new ForbiddenException('Vous ne pouvez pas désactiver votre propre compte.');
    }

    const target = await this.adminUsersRepository.findRawById(id);
    if (!target) throw new NotFoundException('Utilisateur introuvable');

    if (!target.isActive) {
      throw new BadRequestException('Ce compte est déjà désactivé.');
    }

    await this.adminUsersRepository.deactivateUser(id, adminId);
  }

  async activateUser(id: string): Promise<void> {
    const target = await this.adminUsersRepository.findRawById(id);
    if (!target) throw new NotFoundException('Utilisateur introuvable');

    if (target.isActive) {
      throw new BadRequestException('Ce compte est déjà actif.');
    }

    await this.adminUsersRepository.activateUser(id);
  }

  async getStats(): Promise<AdminStatsDto> {
    return this.adminUsersRepository.getGlobalStats();
  }
}

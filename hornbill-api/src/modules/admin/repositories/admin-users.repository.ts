import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { AdminUserListItemDto, AdminUserDetailDto } from '../dto/user-detail-admin.dto';
import { AdminStatsDto } from '../dto/admin-stats.dto';
import { UserRole } from '@src/generated/prisma/enums';

@Injectable()
export class AdminUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListUsersQueryDto): Promise<{ data: AdminUserListItemDto[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, status, role } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search) {
      where['OR'] = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') where['isActive'] = true;
    else if (status === 'inactive') where['isActive'] = false;

    if (role) where['role'] = role;

    const orderBy: Record<string, string> = {};
    if (sortBy === 'lastLogin') orderBy['lastLogin'] = sortOrder;
    else orderBy[sortBy] = sortOrder;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              cryptoPositions: true,
              habits: true,
              taskWorkspaces: true,
              weightEntries: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const data: AdminUserListItemDto[] = users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLogin,
      modulesCount:
        u._count.cryptoPositions +
        u._count.habits +
        u._count.taskWorkspaces +
        u._count.weightEntries,
    }));

    return { data, total };
  }

  async findById(id: string): Promise<AdminUserDetailDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) return null;

    const now = new Date();

    const [
      cryptoPositions,
      activeHabits,
      taskWorkspaces,
      totalTasks,
      doneTasks,
      weightEntries,
      activeSessions,
      deactivatedByUser,
      lastWeightEntry,
      lastCryptoPosition,
      lastHabit,
      lastWorkspace,
    ] = await Promise.all([
      this.prisma.cryptoPosition.count({ where: { userId: id } }),
      this.prisma.habit.count({ where: { userId: id, isArchived: false } }),
      this.prisma.taskWorkspace.count({ where: { userId: id } }),
      this.prisma.task.count({
        where: { list: { workspace: { userId: id } } },
      }),
      this.prisma.task.count({
        where: { list: { workspace: { userId: id } }, isDone: true },
      }),
      this.prisma.weightEntry.count({ where: { userId: id } }),
      this.prisma.session.count({ where: { userId: id, expiresAt: { gt: now } } }),
      user.deactivatedBy
        ? this.prisma.user.findUnique({
            where: { id: user.deactivatedBy },
            select: { email: true },
          })
        : Promise.resolve(null),
      this.prisma.weightEntry.findFirst({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.cryptoPosition.findFirst({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.habit.findFirst({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.taskWorkspace.findFirst({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const activityDates = [lastWeightEntry, lastCryptoPosition, lastHabit, lastWorkspace]
      .filter(Boolean)
      .map((e) => e!.createdAt.getTime());

    const lastActivityAt =
      activityDates.length > 0 ? new Date(Math.max(...activityDates)) : null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLogin,
      deactivatedAt: user.deactivatedAt,
      deactivatedByEmail: deactivatedByUser?.email ?? null,
      stats: {
        cryptoPositions,
        activeHabits,
        taskWorkspaces,
        totalTasks,
        doneTasks,
        weightEntries,
        activeSessions,
        lastActivityAt,
      },
    };
  }

  async findRawById(id: string) {
    return this.prisma.user.findUnique({ where: { id, deletedAt: null } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async countActiveAdmins(): Promise<number> {
    return this.prisma.user.count({
      where: { role: UserRole.ADMIN, isActive: true, deletedAt: null },
    });
  }

  async updateUser(id: string, data: { email?: string; role?: UserRole }): Promise<void> {
    await this.prisma.user.update({ where: { id }, data });
  }

  async deactivateUser(id: string, adminId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.session.deleteMany({ where: { userId: id } }),
      this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: adminId,
        },
      }),
    ]);
  }

  async activateUser(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
      },
    });
  }

  async getGlobalStats(): Promise<AdminStatsDto> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const baseWhere = { deletedAt: null };

    const [totalUsers, activeUsers, inactiveUsers, newUsersLast7d, newUsersLast30d, usersWithActivityLast7d] =
      await Promise.all([
        this.prisma.user.count({ where: baseWhere }),
        this.prisma.user.count({ where: { ...baseWhere, isActive: true } }),
        this.prisma.user.count({ where: { ...baseWhere, isActive: false } }),
        this.prisma.user.count({ where: { ...baseWhere, createdAt: { gte: sevenDaysAgo } } }),
        this.prisma.user.count({ where: { ...baseWhere, createdAt: { gte: thirtyDaysAgo } } }),
        this.prisma.user.count({
          where: {
            ...baseWhere,
            OR: [
              { weightEntries: { some: { createdAt: { gte: sevenDaysAgo } } } },
              { cryptoPositions: { some: { createdAt: { gte: sevenDaysAgo } } } },
              { habits: { some: { createdAt: { gte: sevenDaysAgo } } } },
              { taskWorkspaces: { some: { createdAt: { gte: sevenDaysAgo } } } },
            ],
          },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersLast7d,
      newUsersLast30d,
      usersWithActivityLast7d,
    };
  }
}

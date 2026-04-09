import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { User } from '../entities/user.entity';
import { UserSessionResponseDto } from '../dto/user-session-response.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async updateUser(
    id: string,
    data: { username?: string; firstName?: string; lastName?: string },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getActiveSessions(userId: string): Promise<UserSessionResponseDto[]> {
    const now = new Date();
    return this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: now } },
      select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

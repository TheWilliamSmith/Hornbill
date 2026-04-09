import { User } from '../entities/user.entity';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { createUserData, CreateSessionData } from '../interfaces/auth.interfaces';

interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { username } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: createUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      },
    });

    return user;
  }

  async createSession(data: CreateSessionData): Promise<void> {
    await this.prisma.session.create({
      data: {
        userId: data.userId,
        refreshToken: data.refreshToken,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findSessionsByUserId(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { userId },
      select: { id: true, userId: true, refreshToken: true, expiresAt: true },
    });
  }

  async deleteSessionById(id: string): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

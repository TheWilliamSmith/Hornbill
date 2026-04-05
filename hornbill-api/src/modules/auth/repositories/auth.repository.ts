import { User } from '../entities/user.entity';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { createUserData } from '../interfaces/auth.interfaces';

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
}

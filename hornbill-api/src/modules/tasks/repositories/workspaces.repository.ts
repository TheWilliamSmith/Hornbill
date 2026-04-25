import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class WorkspacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: { name: string; icon?: string; color?: string; position: number },
  ) {
    return this.prisma.taskWorkspace.create({
      data: { userId, ...data },
    });
  }

  async findAllByUserId(userId: string) {
    return this.prisma.taskWorkspace.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
      include: {
        lists: {
          include: {
            tasks: { select: { isDone: true } },
            children: {
              include: {
                tasks: { select: { isDone: true } },
              },
            },
          },
        },
      },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.taskWorkspace.findFirst({
      where: { id, userId },
    });
  }

  async findFullByIdAndUserId(id: string, userId: string) {
    return this.prisma.taskWorkspace.findFirst({
      where: { id, userId },
      include: {
        lists: {
          where: { parentId: null },
          orderBy: { position: 'asc' },
          include: {
            tasks: { orderBy: { position: 'asc' } },
            children: {
              orderBy: { position: 'asc' },
              include: {
                tasks: { orderBy: { position: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; icon?: string; color?: string; position?: number },
  ) {
    return this.prisma.taskWorkspace.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.taskWorkspace.delete({ where: { id } });
  }

  async getMaxPosition(userId: string): Promise<number> {
    const result = await this.prisma.taskWorkspace.aggregate({
      where: { userId },
      _max: { position: true },
    });
    return result._max.position ?? -1;
  }
}

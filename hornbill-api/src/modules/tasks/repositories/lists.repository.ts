import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class ListsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { workspaceId: string; parentId?: string; name: string; position: number }) {
    return this.prisma.taskList.create({
      data,
      include: { tasks: true, children: { include: { tasks: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.taskList.findUnique({
      where: { id },
      include: { tasks: true, children: { include: { tasks: true } } },
    });
  }

  async findByIdWithWorkspace(id: string) {
    return this.prisma.taskList.findUnique({
      where: { id },
      include: { workspace: true },
    });
  }

  async update(
    id: string,
    data: { name?: string; position?: number; isCollapsed?: boolean; parentId?: string | null },
  ) {
    return this.prisma.taskList.update({
      where: { id },
      data,
      include: { tasks: true, children: { include: { tasks: true } } },
    });
  }

  async delete(id: string) {
    await this.prisma.taskList.delete({ where: { id } });
  }

  async getMaxPosition(workspaceId: string, parentId?: string | null): Promise<number> {
    const result = await this.prisma.taskList.aggregate({
      where: { workspaceId, parentId: parentId ?? null },
      _max: { position: true },
    });
    return result._max.position ?? -1;
  }
}

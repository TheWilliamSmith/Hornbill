import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { listId: string; content: string; position: number }) {
    return this.prisma.task.create({ data });
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { list: { include: { workspace: true } } },
    });
  }

  async update(
    id: string,
    data: {
      content?: string;
      isDone?: boolean;
      position?: number;
      listId?: string;
      completedAt?: Date | null;
    },
  ) {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.task.delete({ where: { id } });
  }

  async getMaxPosition(listId: string): Promise<number> {
    const result = await this.prisma.task.aggregate({
      where: { listId },
      _max: { position: true },
    });
    return result._max.position ?? -1;
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.task.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );
  }

  async deleteDoneByListId(listId: string) {
    await this.prisma.task.deleteMany({
      where: { listId, isDone: true },
    });
  }
}

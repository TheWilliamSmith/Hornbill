import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from '../repositories/tasks.repository';
import { ListsRepository } from '../repositories/lists.repository';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { ReorderDto } from '../dto/reorder.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly repo: TasksRepository,
    private readonly listsRepo: ListsRepository,
  ) {}

  async create(listId: string, dto: CreateTaskDto, userId: string) {
    const list = await this.listsRepo.findByIdWithWorkspace(listId);
    if (!list) throw new NotFoundException('List not found');
    if (list.workspace.userId !== userId) throw new NotFoundException('List not found');

    const maxPos = await this.repo.getMaxPosition(listId);
    return this.repo.create({
      listId,
      content: dto.content,
      position: maxPos + 1,
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.repo.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    if (task.list.workspace.userId !== userId) throw new NotFoundException('Task not found');

    const updateData: Record<string, unknown> = {};

    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.listId !== undefined) updateData.listId = dto.listId;

    if (dto.isDone !== undefined) {
      updateData.isDone = dto.isDone;
      updateData.completedAt = dto.isDone ? new Date() : null;
    }

    return this.repo.update(id, updateData as any);
  }

  async toggle(id: string, userId: string) {
    const task = await this.repo.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    if (task.list.workspace.userId !== userId) throw new NotFoundException('Task not found');

    const newDone = !task.isDone;
    return this.repo.update(id, {
      isDone: newDone,
      completedAt: newDone ? new Date() : null,
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.repo.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    if (task.list.workspace.userId !== userId) throw new NotFoundException('Task not found');
    await this.repo.delete(id);
  }

  async reorder(listId: string, dto: ReorderDto, userId: string) {
    const list = await this.listsRepo.findByIdWithWorkspace(listId);
    if (!list) throw new NotFoundException('List not found');
    if (list.workspace.userId !== userId) throw new NotFoundException('List not found');

    await this.repo.reorder(dto.ids);
  }

  async clearDone(listId: string, userId: string) {
    const list = await this.listsRepo.findByIdWithWorkspace(listId);
    if (!list) throw new NotFoundException('List not found');
    if (list.workspace.userId !== userId) throw new NotFoundException('List not found');

    await this.repo.deleteDoneByListId(listId);
  }
}

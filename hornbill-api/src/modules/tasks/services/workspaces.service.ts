import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkspacesRepository } from '../repositories/workspaces.repository';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly repo: WorkspacesRepository) {}

  async create(dto: CreateWorkspaceDto, userId: string) {
    const maxPos = await this.repo.getMaxPosition(userId);
    return this.repo.create(userId, {
      name: dto.name,
      icon: dto.icon,
      color: dto.color,
      position: maxPos + 1,
    });
  }

  async findAll(userId: string) {
    const workspaces = await this.repo.findAllByUserId(userId);

    return workspaces.map((ws) => {
      let totalTasks = 0;
      let doneTasks = 0;

      for (const list of ws.lists) {
        for (const task of list.tasks) {
          totalTasks++;
          if (task.isDone) doneTasks++;
        }
        for (const child of list.children) {
          for (const task of child.tasks) {
            totalTasks++;
            if (task.isDone) doneTasks++;
          }
        }
      }

      return {
        id: ws.id,
        name: ws.name,
        icon: ws.icon,
        color: ws.color,
        position: ws.position,
        totalTasks,
        doneTasks,
        createdAt: ws.createdAt,
        updatedAt: ws.updatedAt,
      };
    });
  }

  async findOne(id: string, userId: string) {
    const ws = await this.repo.findFullByIdAndUserId(id, userId);
    if (!ws) throw new NotFoundException('Workspace not found');
    return ws;
  }

  async update(id: string, dto: UpdateWorkspaceDto, userId: string) {
    const ws = await this.repo.findByIdAndUserId(id, userId);
    if (!ws) throw new NotFoundException('Workspace not found');
    return this.repo.update(id, dto);
  }

  async remove(id: string, userId: string) {
    const ws = await this.repo.findByIdAndUserId(id, userId);
    if (!ws) throw new NotFoundException('Workspace not found');
    await this.repo.delete(id);
  }
}

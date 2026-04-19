import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ListsRepository } from '../repositories/lists.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';
import { CreateListDto } from '../dto/create-list.dto';
import { UpdateListDto } from '../dto/update-list.dto';

@Injectable()
export class ListsService {
  constructor(
    private readonly repo: ListsRepository,
    private readonly workspacesRepo: WorkspacesRepository,
  ) {}

  async createInWorkspace(workspaceId: string, dto: CreateListDto, userId: string) {
    const ws = await this.workspacesRepo.findByIdAndUserId(workspaceId, userId);
    if (!ws) throw new NotFoundException('Workspace not found');

    const maxPos = await this.repo.getMaxPosition(workspaceId, null);
    return this.repo.create({
      workspaceId,
      name: dto.name,
      position: maxPos + 1,
    });
  }

  async createSublist(parentId: string, dto: CreateListDto, userId: string) {
    const parent = await this.repo.findByIdWithWorkspace(parentId);
    if (!parent) throw new NotFoundException('Parent list not found');
    if (parent.workspace.userId !== userId) throw new NotFoundException('Parent list not found');

    // Enforce max 2 levels: a sublist cannot have children
    if (parent.parentId) {
      throw new BadRequestException(
        'Cannot create a sub-sub-list. Maximum nesting depth is 2 levels.',
      );
    }

    const maxPos = await this.repo.getMaxPosition(parent.workspaceId, parentId);
    return this.repo.create({
      workspaceId: parent.workspaceId,
      parentId,
      name: dto.name,
      position: maxPos + 1,
    });
  }

  async update(id: string, dto: UpdateListDto, userId: string) {
    const list = await this.repo.findByIdWithWorkspace(id);
    if (!list) throw new NotFoundException('List not found');
    if (list.workspace.userId !== userId) throw new NotFoundException('List not found');

    // If moving to a new parent, validate nesting depth
    if (dto.parentId !== undefined && dto.parentId !== null) {
      const newParent = await this.repo.findByIdWithWorkspace(dto.parentId);
      if (!newParent) throw new NotFoundException('Target parent list not found');
      if (newParent.parentId) {
        throw new BadRequestException(
          'Cannot nest under a sub-list. Maximum nesting depth is 2 levels.',
        );
      }
    }

    return this.repo.update(id, dto);
  }

  async remove(id: string, userId: string) {
    const list = await this.repo.findByIdWithWorkspace(id);
    if (!list) throw new NotFoundException('List not found');
    if (list.workspace.userId !== userId) throw new NotFoundException('List not found');
    await this.repo.delete(id);
  }
}

import { Module } from '@nestjs/common';
import { WorkspacesController } from './controllers/workspaces.controller';
import { ListsController } from './controllers/lists.controller';
import { TasksController } from './controllers/tasks.controller';
import { WorkspacesService } from './services/workspaces.service';
import { ListsService } from './services/lists.service';
import { TasksService } from './services/tasks.service';
import { WorkspacesRepository } from './repositories/workspaces.repository';
import { ListsRepository } from './repositories/lists.repository';
import { TasksRepository } from './repositories/tasks.repository';

@Module({
  controllers: [WorkspacesController, ListsController, TasksController],
  providers: [
    WorkspacesService,
    ListsService,
    TasksService,
    WorkspacesRepository,
    ListsRepository,
    TasksRepository,
  ],
})
export class TasksModule {}

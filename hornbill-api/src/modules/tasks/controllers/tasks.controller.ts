import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { ReorderDto } from '../dto/reorder.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Post('lists/:listId/tasks')
  async create(
    @Param('listId') listId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.create(listId, dto, userId);
  }

  @Patch('tasks/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Patch('tasks/:id/toggle')
  async toggle(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.toggle(id, userId);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.service.remove(id, userId);
  }

  @Patch('lists/:listId/reorder')
  async reorder(
    @Param('listId') listId: string,
    @Body() dto: ReorderDto,
    @CurrentUser('sub') userId: string,
  ) {
    await this.service.reorder(listId, dto, userId);
  }

  @Delete('lists/:listId/clear-done')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearDone(@Param('listId') listId: string, @CurrentUser('sub') userId: string) {
    await this.service.clearDone(listId, userId);
  }
}

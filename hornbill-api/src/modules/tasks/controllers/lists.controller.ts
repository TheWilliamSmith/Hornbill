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
import { ListsService } from '../services/lists.service';
import { CreateListDto } from '../dto/create-list.dto';
import { UpdateListDto } from '../dto/update-list.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class ListsController {
  constructor(private readonly service: ListsService) {}

  @Post('workspaces/:workspaceId/lists')
  async createInWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateListDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.createInWorkspace(workspaceId, dto, userId);
  }

  @Post('lists/:listId/sublists')
  async createSublist(
    @Param('listId') listId: string,
    @Body() dto: CreateListDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.createSublist(listId, dto, userId);
  }

  @Patch('lists/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateListDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete('lists/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.service.remove(id, userId);
  }
}

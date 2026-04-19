import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { HabitLogsService } from '../services/habit-logs.service';
import { CreateLogDto } from '../dto/create-log.dto';

@UseGuards(JwtAuthGuard)
@Controller('habits/:habitId')
export class HabitLogsController {
  constructor(private readonly logsService: HabitLogsService) {}

  @Post('log')
  async log(
    @Param('habitId') habitId: string,
    @Body() dto: CreateLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.logsService.log(habitId, dto, userId);
  }

  @Delete('log/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlog(
    @Param('habitId') habitId: string,
    @Param('date') date: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.logsService.unlog(habitId, date, userId);
  }

  @Get('logs')
  async getLogs(
    @Param('habitId') habitId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.logsService.getLogs(habitId, from, to, userId);
  }

  @Patch('log/:date/note')
  async updateNote(
    @Param('habitId') habitId: string,
    @Param('date') date: string,
    @Body('note') note: string | null,
    @CurrentUser('sub') userId: string,
  ) {
    return this.logsService.updateNote(habitId, date, note, userId);
  }
}

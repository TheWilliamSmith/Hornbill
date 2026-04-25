import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { NotificationService } from '../services/notification.service';
import { UpdateDiscordWebhookDto } from '../dto/update-discord-webhook.dto';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /notifications — Liste des notifications (optionnel: ?unreadOnly=true&limit=50)
   */
  @Get()
  async getNotifications(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.getNotifications(
      userId,
      limit ? parseInt(limit, 10) : 50,
      unreadOnly === 'true',
    );
  }

  /**
   * GET /notifications/unread-count — Nombre de notifications non lues
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  /**
   * PATCH /notifications/:id/read — Marquer une notification comme lue
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.notificationService.markAsRead(id, userId);
  }

  /**
   * PATCH /notifications/read-all — Marquer toutes les notifications comme lues
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@CurrentUser('sub') userId: string) {
    await this.notificationService.markAllAsRead(userId);
  }

  /**
   * DELETE /notifications/:id — Supprimer une notification
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.notificationService.deleteNotification(id, userId);
  }

  /**
   * GET /notifications/discord — Récupérer le webhook Discord configuré
   */
  @Get('discord')
  async getDiscordWebhook(@CurrentUser('sub') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { discordWebhookUrl: true },
    });
    return {
      webhookUrl: user?.discordWebhookUrl ?? null,
      isConfigured: !!user?.discordWebhookUrl,
    };
  }

  /**
   * PUT /notifications/discord — Configurer le webhook Discord
   */
  @Put('discord')
  async updateDiscordWebhook(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateDiscordWebhookDto,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { discordWebhookUrl: dto.webhookUrl ?? null },
    });
    return {
      webhookUrl: dto.webhookUrl ?? null,
      isConfigured: !!dto.webhookUrl,
    };
  }

  /**
   * DELETE /notifications/discord — Supprimer le webhook Discord
   */
  @Delete('discord')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDiscordWebhook(@CurrentUser('sub') userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { discordWebhookUrl: null },
    });
  }
}

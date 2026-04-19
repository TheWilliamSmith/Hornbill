import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { DiscordService } from './discord.service';
import { NotificationType } from '@src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly discordService: DiscordService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Récupère les notifications d'un utilisateur
   */
  async getNotifications(userId: string, limit = 50, unreadOnly = false) {
    return this.notificationRepository.findByUserId(userId, limit, unreadOnly);
  }

  /**
   * Compte les notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.notificationRepository.markAsRead(notificationId, userId);
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  /**
   * Supprime une notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    return this.notificationRepository.delete(notificationId, userId);
  }

  /**
   * Envoie une notification quand un target est triggered
   */
  async notifyTargetTriggered(
    userId: string,
    data: {
      symbol: string;
      triggerPercent: number;
      sellPercent: number;
      targetPrice: number;
      currentPrice: number;
      positionId: string;
      targetId: string;
    },
  ): Promise<void> {
    // 1. Créer la notification in-app
    await this.notificationRepository.create({
      userId,
      type: NotificationType.TARGET_TRIGGERED,
      title: `🎯 Target atteint : ${data.symbol}`,
      message: `Le prix de ${data.symbol} a atteint +${data.triggerPercent}% (${data.targetPrice.toFixed(2)}€). Vendre ${data.sellPercent}% recommandé.`,
      data: {
        symbol: data.symbol,
        triggerPercent: data.triggerPercent,
        sellPercent: data.sellPercent,
        targetPrice: data.targetPrice,
        currentPrice: data.currentPrice,
        positionId: data.positionId,
        targetId: data.targetId,
      },
    });

    // 2. Envoyer via Discord si l'utilisateur a configuré un webhook
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { discordWebhookUrl: true },
    });

    if (user?.discordWebhookUrl) {
      await this.discordService.sendTargetTriggered(user.discordWebhookUrl, {
        symbol: data.symbol,
        triggerPercent: data.triggerPercent,
        sellPercent: data.sellPercent,
        targetPrice: data.targetPrice,
        currentPrice: data.currentPrice,
      });
    }
  }
}

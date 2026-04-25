import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { SellTargetStatus, CryptoPositionStatus } from '@src/generated/prisma/enums';
import { NotificationService } from 'src/modules/notification/services/notification.service';

@Injectable()
export class TargetCheckerService {
  private readonly logger = new Logger(TargetCheckerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Vérifie tous les targets PENDING et les déclenche si le prix actuel >= prix cible
   */
  async checkTargets(prices: Map<string, number>): Promise<void> {
    try {
      // Récupérer tous les targets PENDING avec leurs positions OPEN ou PARTIALLY_SOLD
      const targets = await this.prisma.sellTarget.findMany({
        where: {
          status: SellTargetStatus.PENDING,
          position: {
            status: {
              in: [CryptoPositionStatus.OPEN, CryptoPositionStatus.PARTIALLY_SOLD],
            },
          },
        },
        include: {
          position: {
            select: {
              id: true,
              userId: true,
              symbol: true,
              status: true,
            },
          },
        },
      });

      if (targets.length === 0) {
        return;
      }

      this.logger.log(`Checking ${targets.length} pending targets...`);

      let triggeredCount = 0;

      for (const target of targets) {
        const currentPrice = prices.get(target.position.symbol);

        if (!currentPrice) {
          // Prix non disponible pour ce symbole
          continue;
        }

        // Vérifier si le prix actuel a atteint le prix cible
        if (currentPrice >= target.targetPrice) {
          await this.prisma.sellTarget.update({
            where: { id: target.id },
            data: {
              status: SellTargetStatus.TRIGGERED,
              triggeredAt: new Date(),
            },
          });

          triggeredCount++;

          this.logger.log(
            `🎯 Target triggered: ${target.position.symbol} +${target.triggerPercent}% ` +
              `(target: ${target.targetPrice.toFixed(2)}€, current: ${currentPrice.toFixed(2)}€)`,
          );

          // Envoyer la notification (in-app + Discord si configuré)
          await this.notificationService.notifyTargetTriggered(target.position.userId, {
            symbol: target.position.symbol,
            triggerPercent: target.triggerPercent,
            sellPercent: target.sellPercent,
            targetPrice: target.targetPrice,
            currentPrice,
            positionId: target.position.id,
            targetId: target.id,
          });
        }
      }

      if (triggeredCount > 0) {
        this.logger.log(`✅ ${triggeredCount} target(s) triggered`);
      }
    } catch (error) {
      this.logger.error('Failed to check targets', error);
    }
  }
}

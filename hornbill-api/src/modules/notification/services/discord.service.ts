import { Injectable, Logger } from '@nestjs/common';

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
}

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  /**
   * Envoie un message via un webhook Discord
   */
  async sendWebhook(webhookUrl: string, embed: DiscordEmbed): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Hornbill Crypto',
          embeds: [
            {
              ...embed,
              timestamp: embed.timestamp ?? new Date().toISOString(),
            },
          ],
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Discord webhook failed: ${response.status} ${response.statusText}`);
        return false;
      }

      this.logger.log('Discord notification sent successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to send Discord notification', error);
      return false;
    }
  }

  /**
   * Envoie une notification de target triggered via Discord
   */
  async sendTargetTriggered(
    webhookUrl: string,
    data: {
      symbol: string;
      triggerPercent: number;
      sellPercent: number;
      targetPrice: number;
      currentPrice: number;
    },
  ): Promise<boolean> {
    return this.sendWebhook(webhookUrl, {
      title: `🎯 Target atteint : ${data.symbol}`,
      description: `Le prix de **${data.symbol}** a atteint votre objectif de **+${data.triggerPercent}%** !`,
      color: 0x10b981, // emerald
      fields: [
        {
          name: 'Prix cible',
          value: `${data.targetPrice.toFixed(2)}€`,
          inline: true,
        },
        {
          name: 'Prix actuel',
          value: `${data.currentPrice.toFixed(2)}€`,
          inline: true,
        },
        {
          name: 'Action recommandée',
          value: `Vendre **${data.sellPercent}%** de la position`,
          inline: false,
        },
      ],
    });
  }
}

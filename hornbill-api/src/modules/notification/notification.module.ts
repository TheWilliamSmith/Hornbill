import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { DiscordService } from './services/discord.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationRepository, NotificationService, DiscordService],
  exports: [NotificationService],
})
export class NotificationModule {}

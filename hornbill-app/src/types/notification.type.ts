export enum NotificationType {
  TARGET_TRIGGERED = "TARGET_TRIGGERED",
  TARGET_EXECUTED = "TARGET_EXECUTED",
  PRICE_ALERT = "PRICE_ALERT",
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface DiscordWebhookConfig {
  webhookUrl: string | null;
  isConfigured: boolean;
}

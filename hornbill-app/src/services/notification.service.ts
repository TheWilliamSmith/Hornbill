import { apiClient } from "@/lib/api-client";
import type {
  Notification,
  DiscordWebhookConfig,
} from "@/types/notification.type";

export const notificationService = {
  getNotifications: (params?: { limit?: number; unreadOnly?: boolean }) =>
    apiClient.get<Notification[]>("notifications", {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>("notifications/unread-count"),

  markAsRead: (id: string) =>
    apiClient.patch(`notifications/${encodeURIComponent(id)}/read`),

  markAllAsRead: () => apiClient.patch("notifications/read-all"),

  deleteNotification: (id: string) =>
    apiClient.delete(`notifications/${encodeURIComponent(id)}`),

  // ─── Discord ────────────────────────────────────────────

  getDiscordWebhook: () =>
    apiClient.get<DiscordWebhookConfig>("notifications/discord"),

  updateDiscordWebhook: (webhookUrl: string) =>
    apiClient.put<DiscordWebhookConfig>("notifications/discord", {
      webhookUrl,
    }),

  deleteDiscordWebhook: () => apiClient.delete("notifications/discord"),
};

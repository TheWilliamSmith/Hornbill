"use client";

import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notification.service";
import type {
  Notification,
  DiscordWebhookConfig,
} from "@/types/notification.type";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifs, countRes] = await Promise.all([
        notificationService.getNotifications({ limit: 30 }),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(countRes.count);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll toutes les 30s pour les nouvelles notifs
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, []);

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const notif = notifications.find((n) => n.id === id);
        await notificationService.deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notif && !notif.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch {
        // silently fail
      }
    },
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}

export function useDiscordWebhook() {
  const [config, setConfig] = useState<DiscordWebhookConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notificationService
      .getDiscordWebhook()
      .then(setConfig)
      .catch(() => setConfig({ webhookUrl: null, isConfigured: false }))
      .finally(() => setLoading(false));
  }, []);

  const saveWebhook = useCallback(async (url: string) => {
    setSaving(true);
    setError(null);
    try {
      const result = await notificationService.updateDiscordWebhook(url);
      setConfig(result);
    } catch {
      setError("Impossible de sauvegarder le webhook");
    } finally {
      setSaving(false);
    }
  }, []);

  const removeWebhook = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await notificationService.deleteDiscordWebhook();
      setConfig({ webhookUrl: null, isConfigured: false });
    } catch {
      setError("Impossible de supprimer le webhook");
    } finally {
      setSaving(false);
    }
  }, []);

  return { config, loading, saving, error, saveWebhook, removeWebhook };
}

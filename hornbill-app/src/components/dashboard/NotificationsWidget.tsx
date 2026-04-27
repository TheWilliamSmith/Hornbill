"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types/notification.type";

export default function NotificationsWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [notifs, countRes] = await Promise.all([
        notificationService.getNotifications({ limit: 5 }),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(countRes.count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-pink-500" />
          <span className="font-semibold text-sm text-zinc-900">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="bg-pink-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/notifications"
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-zinc-100 rounded animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-4">
          Aucune notification
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => !notif.isRead && markRead(notif.id)}
              className="flex items-start gap-2.5 text-left w-full group"
            >
              {!notif.isRead && (
                <AlertCircle className="w-3.5 h-3.5 text-pink-500 mt-0.5 shrink-0" />
              )}
              {notif.isRead && (
                <div className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${notif.isRead ? "text-zinc-400" : "text-zinc-700 font-medium"}`}>
                  {notif.title}
                </p>
                {notif.message && (
                  <p className="text-xs text-zinc-400 truncate">{notif.message}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

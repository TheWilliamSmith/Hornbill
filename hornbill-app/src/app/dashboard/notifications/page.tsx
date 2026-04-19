"use client";

import {
  Bell,
  CheckCheck,
  Trash2,
  Crosshair,
  Check,
  Loader2,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationType } from "@/types/notification.type";
import type { Notification } from "@/types/notification.type";

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function notificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.TARGET_TRIGGERED:
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Crosshair size={16} className="text-emerald-600" />
        </div>
      );
    case NotificationType.TARGET_EXECUTED:
      return (
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Check size={16} className="text-blue-600" />
        </div>
      );
    case NotificationType.PRICE_ALERT:
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Bell size={16} className="text-amber-600" />
        </div>
      );
  }
}

function NotificationRow({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-start gap-4 px-5 py-4 transition-colors border-b border-black/[0.04] last:border-0 ${
        notification.isRead ? "bg-white" : "bg-blue-50/30"
      }`}
    >
      {notificationIcon(notification.type)}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`text-sm leading-tight ${
                notification.isRead ? "text-black/60" : "text-black font-medium"
              }`}
            >
              {notification.title}
            </p>
            <p className="text-xs text-black/40 mt-1 leading-relaxed">
              {notification.message}
            </p>
            <p className="text-[10px] text-black/25 mt-1.5">
              {formatDate(notification.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!notification.isRead && (
              <button
                onClick={() => onRead(notification.id)}
                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                title="Marquer comme lu"
              >
                <Check size={14} className="text-blue-500" />
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Supprimer"
            >
              <Trash2 size={14} className="text-black/20 hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bell size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Notifications
            </h1>
            <p className="text-sm text-black/40">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Toutes les notifications sont lues"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <CheckCheck size={14} />
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-black/20" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={32} className="mx-auto text-black/10 mb-3" />
            <p className="text-sm text-black/30">
              Aucune notification pour le moment
            </p>
            <p className="text-xs text-black/20 mt-1">
              Vous recevrez des notifications quand un sell target sera atteint
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationRow
              key={notif.id}
              notification={notif}
              onRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </div>
  );
}

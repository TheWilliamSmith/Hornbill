"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, Crosshair } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/types/notification.type";
import { NotificationType } from "@/types/notification.type";

function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "À l'instant";
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}min`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}j`;
}

function notificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.TARGET_TRIGGERED:
      return <Crosshair size={14} className="text-emerald-600" />;
    case NotificationType.TARGET_EXECUTED:
      return <Check size={14} className="text-blue-600" />;
    case NotificationType.PRICE_ALERT:
      return <Bell size={14} className="text-amber-600" />;
  }
}

function NotificationItem({
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
      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
        notification.isRead ? "bg-white" : "bg-blue-50/50 hover:bg-blue-50/80"
      }`}
    >
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-black/[0.04] flex items-center justify-center flex-shrink-0">
        {notificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-tight ${
              notification.isRead ? "text-black/60" : "text-black font-medium"
            }`}
          >
            {notification.title}
          </p>
          <span className="text-[10px] text-black/30 whitespace-nowrap flex-shrink-0">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-black/40 mt-0.5 leading-relaxed">
          {notification.message}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead(notification.id);
              }}
              className="text-[10px] text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
            >
              Marquer lu
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="text-[10px] text-black/25 hover:text-red-500 cursor-pointer"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
      >
        <Bell
          size={18}
          className={unreadCount > 0 ? "text-black" : "text-black/30"}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl border border-black/[0.08] shadow-xl shadow-black/10 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
            <h3 className="text-sm font-semibold text-black">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal text-black/40">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
              >
                <CheckCheck size={12} />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-black/[0.04]">
            {notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell size={24} className="mx-auto text-black/15 mb-2" />
                <p className="text-sm text-black/30">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

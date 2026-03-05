import { useCallback, useEffect, useState } from "react";
import type { ContactStatus } from "../types/contact";
import type { AppNotification } from "../types/notification";

const STORAGE_KEY = "wa-tracker-notifications";
const MAX_NOTIFICATIONS = 20;

function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

export function useNotifications() {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(loadNotifications);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback(
    (contactId: string, contactName: string, status: ContactStatus) => {
      const notif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        contactId,
        contactName,
        status,
        timestamp: Date.now(),
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev].slice(0, MAX_NOTIFICATIONS));
    },
    [],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, addNotification, markAllRead, clearAll, unreadCount };
}

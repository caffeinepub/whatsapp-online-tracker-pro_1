import { useCallback, useRef, useState } from "react";

export interface ToastItem {
  id: string;
  contactName: string;
  message: string;
  timestamp: number;
}

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS = 4000;

export function useToastNotifications() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (contactName: string, message: string) => {
      // Unique ID using timestamp + random suffix to prevent collisions
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = {
        id,
        contactName,
        message,
        timestamp: Date.now(),
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        // If we exceed max, remove oldest and clear their timers
        if (updated.length > MAX_TOASTS) {
          const removed = updated.slice(MAX_TOASTS);
          for (const t of removed) {
            const timer = timersRef.current.get(t.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(t.id);
            }
          }
          return updated.slice(0, MAX_TOASTS);
        }
        return updated;
      });

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        removeToast(id);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  return { toasts, addToast, removeToast };
}

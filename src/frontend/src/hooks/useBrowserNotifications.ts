import { useCallback } from "react";

export function useBrowserNotifications() {
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    try {
      if (Notification.permission === "default") {
        const result = await Notification.requestPermission();
        return result;
      }
    } catch (err) {
      console.warn("[BrowserNotifications] requestPermission failed:", err);
    }
    return Notification.permission;
  }, []);

  /**
   * Attempt a browser (OS-level) notification.
   * - If permission is already granted → fire the Notification.
   * - If not granted (or API unavailable) → silently skip; the in-app toast
   *   is fired separately in App.tsx and will always work regardless.
   */
  const showNotification = useCallback(
    (title: string, body: string, iconUrl?: string) => {
      if (!("Notification" in window)) {
        // Browser doesn't support Notification API — in-app toast covers the UX
        return;
      }

      if (Notification.permission !== "granted") {
        // Not yet granted — in-app toast still fires (handled in App.tsx)
        return;
      }

      try {
        // Use timestamp in tag so each notification is unique and never replaces a previous one
        const tag = `contact-online-${title}-${Date.now()}`;
        const n = new Notification(title, {
          body,
          tag,
          icon: iconUrl?.startsWith("data:")
            ? iconUrl
            : "/assets/generated/app-icon.dim_512x512.png",
          badge: "/assets/generated/favicon.dim_64x64.png",
          requireInteraction: false,
        });
        // Auto-close after 5s in case the OS doesn't auto-dismiss it
        setTimeout(() => {
          try {
            n.close();
          } catch {
            /* ignore */
          }
        }, 5000);
      } catch (err) {
        // Some browsers (e.g. Firefox in private mode) throw even with permission granted
        console.warn("[BrowserNotifications] showNotification failed:", err);
      }
    },
    [],
  );

  return { showNotification, requestPermission };
}

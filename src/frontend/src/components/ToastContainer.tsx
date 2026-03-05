import type { ToastItem } from "../hooks/useToastNotifications";
import { ToastNotification } from "./ToastNotification";

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-16 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastNotification toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

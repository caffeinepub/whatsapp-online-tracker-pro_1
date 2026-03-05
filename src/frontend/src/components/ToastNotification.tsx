import { Wifi, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ToastItem } from "../hooks/useToastNotifications";
import { cn } from "../lib/utils";

interface ToastNotificationProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function ToastNotification({
  toast,
  onDismiss,
}: ToastNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation on mount
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 280);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-card-hover px-4 py-3 transition-all duration-300 ease-out will-change-transform",
        visible && !leaving
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-full",
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full wa-gradient flex items-center justify-center mt-0.5">
        <Wifi className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate font-display">
          {toast.contactName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{toast.message}</p>
      </div>

      {/* Online dot + dismiss */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-wa-green animate-pulse-online" />
        <button
          type="button"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

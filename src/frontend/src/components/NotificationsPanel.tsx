import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatRelativeTime } from "../lib/app-utils";
import { cn } from "../lib/utils";
import type { AppNotification } from "../types/notification";
import { StatusIndicator } from "./StatusIndicator";

interface NotificationsPanelProps {
  notifications: AppNotification[];
  unreadCount: number;
  onOpen: () => void;
  onClear: () => void;
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  onOpen,
  onClear,
}: NotificationsPanelProps) {
  const prevCountRef = useRef(unreadCount);

  useEffect(() => {
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  return (
    <Popover onOpenChange={(open) => open && onOpen()}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              key={unreadCount}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 animate-badge-pop"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 rounded-2xl overflow-hidden shadow-card-hover"
        sideOffset={8}
      >
        {/* Header */}
        <div className="wa-gradient px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-white" />
            <span className="text-white font-display font-semibold text-sm">
              Notifications
            </span>
            {notifications.length > 0 && (
              <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="h-7 w-7 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="h-72 scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                <BellOff className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Status changes will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif, idx) => (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40 animate-slide-in-right",
                    !notif.isRead && "bg-primary/5",
                  )}
                  style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                >
                  <div className="mt-0.5">
                    <StatusIndicator status={notif.status} size="md" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {notif.contactName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notif.status === "online"
                        ? "came online"
                        : "went offline"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                    {formatRelativeTime(notif.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

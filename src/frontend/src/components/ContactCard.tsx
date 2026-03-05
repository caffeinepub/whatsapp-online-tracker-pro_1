import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Camera,
  ChevronRight,
  Download,
  History,
  MoreVertical,
  Phone,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  downloadContactPhoto,
  exportActivityToCSV,
  formatDurationMs,
  formatTimeHHMMSS,
  getInitials,
} from "../lib/app-utils";
import { cn } from "../lib/utils";
import type { ActivityEntry } from "../types/activity";
import type { Contact } from "../types/contact";
import { StatusIndicator } from "./StatusIndicator";

interface ContactCardProps {
  contact: Contact;
  activityEntries?: ActivityEntry[];
  onDelete: (id: string) => void;
  onViewLog: (contact: Contact) => void;
  onEditPhoto?: (contact: Contact) => void;
  onManualToggle?: (id: string) => void;
  compact?: boolean;
  index?: number;
}

/** Build real-time status text for a contact */
function buildStatusText(contact: Contact): string {
  if (contact.status === "online") {
    const onlineSince = formatTimeHHMMSS(contact.lastSeen);
    return `🟢 Online since ${onlineSince}`;
  }
  const lastSeenTime = formatTimeHHMMSS(contact.lastSeen);
  return `Last seen ${lastSeenTime}`;
}

export function ContactCard({
  contact,
  activityEntries = [],
  onDelete,
  onViewLog,
  onEditPhoto,
  onManualToggle,
  compact = false,
  index = 1,
}: ContactCardProps) {
  const initials = getInitials(contact.name);
  const [imgError, setImgError] = useState(false);
  const photoUrl = contact.photoUrl;

  // Reset imgError when photoUrl changes so updated photos display immediately
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on photoUrl change
  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  // Guard: only mark error if we actually had a valid photoUrl at time of error
  const handleImgError = () => {
    if (photoUrl?.startsWith("data:")) {
      setImgError(true);
    }
  };

  // Real-time status text — updates every second
  const [statusText, setStatusText] = useState<string>(() =>
    buildStatusText(contact),
  );

  const updateStatus = useCallback(() => {
    setStatusText(buildStatusText(contact));
  }, [contact]);

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  // Live session timer (updates every second when contact is online)
  const [sessionElapsedMs, setSessionElapsedMs] = useState<number>(0);

  useEffect(() => {
    if (contact.status === "online" && contact.onlineSince) {
      const tick = () =>
        setSessionElapsedMs(Date.now() - (contact.onlineSince ?? Date.now()));
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }
    setSessionElapsedMs(0);
  }, [contact.status, contact.onlineSince]);

  const handleManualToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onManualToggle?.(contact.id);
  };

  const handleDownloadHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportActivityToCSV(contact.name, activityEntries);
  };

  const handleDownloadDP = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact.photoUrl) {
      downloadContactPhoto(contact.name, contact.photoUrl);
    }
  };

  const handleEditPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditPhoto?.(contact);
  };

  // Strictly validate: must be a real base64 data URL and no error occurred
  const showPhoto = !!photoUrl && photoUrl.startsWith("data:") && !imgError;

  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card transition-all shadow-sm hover:shadow-md w-full",
        contact.status === "online"
          ? "border-wa-green/30 bg-gradient-to-r from-card to-wa-green/5"
          : "",
      )}
    >
      {/* Main row — clickable to view log */}
      <button
        type="button"
        className={cn(
          "flex items-center gap-3 cursor-pointer w-full text-left",
          compact ? "px-3 py-2.5" : "px-4 py-3",
        )}
        onClick={() => onViewLog(contact)}
      >
        {/* Avatar — shows photo when available, falls back to initials */}
        <div className="relative flex-shrink-0">
          {showPhoto ? (
            <img
              key={photoUrl}
              src={photoUrl}
              alt={contact.name}
              loading="eager"
              className={cn(
                "rounded-full object-cover border-2",
                contact.status === "online"
                  ? "border-wa-green"
                  : "border-border",
                compact ? "w-9 h-9" : "w-12 h-12",
              )}
              onError={handleImgError}
            />
          ) : (
            <div
              className={cn(
                "rounded-full bg-gradient-to-br from-wa-green/20 to-wa-green-dark/20 flex items-center justify-center font-display font-bold text-wa-green-dark border-2",
                contact.status === "online"
                  ? "border-wa-green"
                  : "border-transparent",
                compact ? "w-9 h-9 text-xs" : "w-12 h-12 text-sm",
              )}
            >
              {initials}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5">
            <StatusIndicator
              status={contact.status}
              size={compact ? "sm" : "md"}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-semibold text-foreground truncate",
                compact ? "text-sm" : "text-sm",
              )}
            >
              {contact.name}
            </p>
            {contact.status === "online" && (
              <span className="text-[10px] font-medium text-wa-green bg-wa-green/10 px-1.5 py-0.5 rounded-full animate-pulse">
                Online
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">
              {contact.phoneNumber}
            </p>
          </div>
          {!compact && (
            <p
              className={cn(
                "text-xs mt-0.5 font-mono tracking-tight",
                contact.status === "online"
                  ? "text-wa-green"
                  : "text-muted-foreground",
              )}
            >
              {statusText}
            </p>
          )}
        </div>

        {/* Right side actions */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: presentational container, children handle keys */}
        <div
          className="flex items-center gap-1 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
                aria-label="More options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onViewLog(contact)}>
                <History className="w-3.5 h-3.5 mr-2" />
                View Activity Log
              </DropdownMenuItem>
              {onEditPhoto && (
                <DropdownMenuItem onClick={handleEditPhoto}>
                  <Camera className="w-3.5 h-3.5 mr-2" />
                  {contact.photoUrl ? "Change Photo" : "Add Photo"}
                </DropdownMenuItem>
              )}
              {contact.photoUrl && (
                <DropdownMenuItem onClick={handleDownloadDP}>
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Download DP
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDownloadHistory}>
                <Download className="w-3.5 h-3.5 mr-2" />
                Download History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(contact.id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </button>

      {/* Manual toggle row — always visible, not compact */}
      {!compact && onManualToggle && (
        <div className="px-4 pb-3 pt-0 flex items-center gap-3">
          {/* Indent to align with name column */}
          <div className={cn("flex-shrink-0", "w-12")} />
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              data-ocid={`contact.toggle.${index}`}
              onClick={handleManualToggleClick}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                contact.status === "online"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  : "bg-wa-green text-white hover:bg-wa-green-dark shadow-sm",
              )}
              aria-label={
                contact.status === "online"
                  ? "Mark as offline"
                  : "Mark as online"
              }
            >
              {contact.status === "online" ? (
                <>
                  <WifiOff className="w-3 h-3" />
                  Mark Offline
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3" />
                  Mark Online
                </>
              )}
            </button>

            {/* Live session timer */}
            {contact.status === "online" &&
              contact.onlineSince &&
              sessionElapsedMs > 0 && (
                <span className="text-xs text-wa-green font-mono font-medium">
                  Online {formatDurationMs(sessionElapsedMs)}
                </span>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

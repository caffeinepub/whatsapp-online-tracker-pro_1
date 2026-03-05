import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { formatRelativeTime, getInitials } from "../lib/app-utils";
import { cn } from "../lib/utils";
import type { Contact } from "../types/contact";
import { StatusIndicator } from "./StatusIndicator";

interface RecentlyActiveListProps {
  contacts: Contact[];
  onViewLog?: (contact: Contact) => void;
}

function ContactAvatar({ contact }: { contact: Contact }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = contact.photoUrl;

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

  // Strictly validate: must be a real base64 data URL and no error occurred
  const showPhoto = !!photoUrl && photoUrl.startsWith("data:") && !imgError;

  return (
    <div className="relative flex-shrink-0">
      {showPhoto ? (
        <img
          key={photoUrl}
          src={photoUrl}
          alt={contact.name}
          loading="eager"
          className="w-9 h-9 rounded-full object-cover"
          onError={handleImgError}
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-wa-green/20 to-wa-green-dark/20 flex items-center justify-center font-display font-bold text-wa-green-dark text-xs">
          {getInitials(contact.name)}
        </div>
      )}
      <div className="absolute -bottom-0.5 -right-0.5">
        <StatusIndicator status={contact.status} size="sm" />
      </div>
    </div>
  );
}

export function RecentlyActiveList({
  contacts,
  onViewLog,
}: RecentlyActiveListProps) {
  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          No recent activity
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Add contacts to start tracking
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {contacts.map((contact, idx) => (
        <button
          key={contact.id}
          type="button"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/40 transition-all cursor-pointer animate-fade-in-up w-full text-left",
            contact.status === "online" &&
              "bg-wa-green/5 border border-wa-green/10",
          )}
          style={{ animationDelay: `${idx * 40}ms` }}
          onClick={() => onViewLog?.(contact)}
        >
          <ContactAvatar contact={contact} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {contact.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {contact.status === "online"
                ? "🟢 Online now"
                : `Last seen ${formatRelativeTime(contact.lastSeen)}`}
            </p>
          </div>
          {contact.status === "online" && (
            <div className="w-2 h-2 rounded-full bg-wa-green animate-pulse-online flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}

import { Clock, Phone, Video } from "lucide-react";
import { formatCallDuration, formatDateTime } from "../lib/app-utils";
import type { CallRecord } from "../types/callHistory";

interface CallHistorySectionProps {
  records: CallRecord[];
}

export function CallHistorySection({ records }: CallHistorySectionProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
          <Phone className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No call history</p>
        <p className="text-xs text-muted-foreground mt-1">
          Call records will appear here
        </p>
      </div>
    );
  }

  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="divide-y divide-border">
      {sorted.map((record, idx) => (
        <div
          key={record.id}
          className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors animate-fade-in"
          style={{ animationDelay: `${Math.min(idx * 20, 200)}ms` }}
        >
          {/* Icon */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              record.type === "audio"
                ? "bg-wa-green/10 text-wa-green"
                : "bg-blue-500/10 text-blue-500"
            }`}
          >
            {record.type === "audio" ? (
              <Phone className="w-4 h-4" />
            ) : (
              <Video className="w-4 h-4" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground capitalize">
              {record.type === "audio" ? "📞 Audio Call" : "🎥 Video Call"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(record.timestamp)}
            </p>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span>{formatCallDuration(record.duration)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

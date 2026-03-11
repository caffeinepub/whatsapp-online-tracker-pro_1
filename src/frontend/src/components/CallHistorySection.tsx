import { Clock, Phone, Trash2, Video } from "lucide-react";
import { formatCallDuration, formatDateTime } from "../lib/app-utils";
import type { CallRecord } from "../types/callHistory";

interface CallHistorySectionProps {
  records: CallRecord[];
  onDelete?: (recordId: string) => void;
}

export function CallHistorySection({
  records,
  onDelete,
}: CallHistorySectionProps) {
  if (records.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-8 text-center"
        data-ocid="calls.empty_state"
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
          <Phone className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          No calls logged yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Use '+ Log Call' to manually record a call
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
          className="group flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors animate-fade-in"
          style={{ animationDelay: `${Math.min(idx * 20, 200)}ms` }}
          data-ocid={`calls.item.${idx + 1}`}
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
            {record.note && (
              <p className="text-xs text-muted-foreground italic mt-0.5 truncate">
                {record.note}
              </p>
            )}
          </div>

          {/* Duration + delete */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>{formatCallDuration(record.duration)}</span>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(record.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                title="Delete record"
                data-ocid={`calls.delete_button.${idx + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

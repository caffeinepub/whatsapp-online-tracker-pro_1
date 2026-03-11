import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Clock, Download, Phone, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useCallHistory } from "../hooks/useCallHistory";
import {
  exportActivityToCSV,
  formatDateTime,
  formatRelativeTime,
  formatSessionDuration,
  formatTimeHHMMSS,
  getInitials,
} from "../lib/app-utils";
import type { ActivityEntry } from "../types/activity";
import type { CallRecord, CallType } from "../types/callHistory";
import type { Contact } from "../types/contact";
import { AddCallRecordModal } from "./AddCallRecordModal";
import { CallHistorySection } from "./CallHistorySection";
import { StatusIndicator } from "./StatusIndicator";

interface ActivityLogModalProps {
  contact: Contact | null;
  entries: ActivityEntry[];
  open: boolean;
  onClose: () => void;
}

/** Live timer for currently-online sessions */
function LiveTimer({ since }: { since: number }) {
  const [elapsed, setElapsed] = useState(
    Math.floor((Date.now() - since) / 1000),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - since) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [since]);

  return (
    <span className="text-xs text-wa-green font-medium">
      Online for {formatSessionDuration(elapsed)}
    </span>
  );
}

/** Contact avatar — shows photo when available, falls back to initials */
function ContactAvatar({ contact }: { contact: Contact }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = contact.photoUrl;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on photoUrl change
  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  const handleImgError = () => {
    if (photoUrl?.startsWith("data:")) {
      setImgError(true);
    }
  };

  const showPhoto = !!photoUrl && photoUrl.startsWith("data:") && !imgError;

  if (showPhoto) {
    return (
      <img
        key={photoUrl}
        src={photoUrl}
        alt={contact.name}
        loading="eager"
        className="w-11 h-11 rounded-full object-cover border-2 border-white/30"
        onError={handleImgError}
      />
    );
  }

  return (
    <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-display font-bold text-sm">
      {getInitials(contact.name)}
    </div>
  );
}

export function ActivityLogModal({
  contact,
  entries,
  open,
  onClose,
}: ActivityLogModalProps) {
  const { getCallHistory, addCallRecord, removeCallRecord } = useCallHistory();
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [addCallOpen, setAddCallOpen] = useState(false);

  useEffect(() => {
    if (contact && open) {
      setCallRecords(getCallHistory(contact.id));
    }
  }, [contact, open, getCallHistory]);

  if (!contact) return null;

  const handleDownloadHistory = () => {
    exportActivityToCSV(contact.name, entries);
  };

  const handleAddCall = (
    type: CallType,
    durationSeconds: number,
    note?: string,
  ) => {
    const record = addCallRecord(contact.id, type, durationSeconds, note);
    setCallRecords((prev) => [record, ...prev]);
  };

  const handleDeleteCallRecord = (recordId: string) => {
    removeCallRecord(contact.id, recordId);
    setCallRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="wa-gradient px-5 py-4">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <ContactAvatar contact={contact} />
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-white font-display font-semibold text-base">
                    {contact.name}
                  </DialogTitle>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusIndicator status={contact.status} size="sm" />
                    <span className="text-white/80 text-xs capitalize">
                      {contact.status}
                    </span>
                    <span className="text-white/50 text-xs">
                      · {contact.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <div className="px-5 pt-3 border-b border-border">
              <TabsList className="w-full grid grid-cols-2 h-9 bg-muted/50 rounded-lg">
                <TabsTrigger value="activity" className="text-xs rounded-md">
                  <Activity className="w-3.5 h-3.5 mr-1.5" />
                  Activity Log
                </TabsTrigger>
                <TabsTrigger value="calls" className="text-xs rounded-md">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Call History
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-0">
              {/* Stats row */}
              <div className="px-5 py-2.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span>{entries.length} events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {entries.filter((e) => e.status === "online").length} online
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2 gap-1"
                    onClick={handleDownloadHistory}
                    disabled={entries.length === 0}
                    data-ocid="activity.download_button"
                  >
                    <Download className="w-3 h-3" />
                    CSV
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-72 scrollbar-thin">
                {entries.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-full py-12 text-center px-6"
                    data-ocid="activity.empty_state"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      No activity yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Press "Mark Online" or "Mark Offline" on the contact card
                      to log activity
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {entries.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors animate-fade-in"
                        style={{
                          animationDelay: `${Math.min(idx * 20, 200)}ms`,
                        }}
                        data-ocid={`activity.item.${idx + 1}`}
                      >
                        <div className="mt-0.5">
                          <StatusIndicator status={entry.status} size="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-medium text-foreground capitalize">
                              {entry.status === "online"
                                ? "🟢 Came online"
                                : "⚫ Went offline"}
                            </p>
                            {entry.source === "manual" ? (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-wa-green/15 text-wa-green border border-wa-green/30">
                                Manual
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                Auto
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(entry.timestamp)}
                            <span className="ml-1.5 font-mono text-[11px] bg-muted px-1 py-0.5 rounded">
                              {formatTimeHHMMSS(entry.timestamp)}
                            </span>
                          </p>
                          {/* Session duration for offline events */}
                          {entry.status === "offline" &&
                            entry.duration != null && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Session:{" "}
                                <span className="font-medium text-foreground">
                                  {formatSessionDuration(entry.duration)}
                                </span>
                              </p>
                            )}
                          {entry.status === "offline" &&
                            entry.duration == null &&
                            entry.sessionDurationMs != null && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Session:{" "}
                                <span className="font-medium text-foreground">
                                  {formatSessionDuration(
                                    Math.floor(entry.sessionDurationMs / 1000),
                                  )}
                                </span>
                              </p>
                            )}
                          {/* Live timer for ongoing online session */}
                          {entry.status === "online" &&
                            idx === 0 &&
                            contact.status === "online" && (
                              <LiveTimer since={entry.timestamp} />
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Call History Tab */}
            <TabsContent value="calls" className="mt-0">
              <div className="px-5 py-2.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{callRecords.length} call records</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {callRecords.filter((r) => r.type === "audio").length}{" "}
                      audio
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {callRecords.filter((r) => r.type === "video").length}{" "}
                      video
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2 gap-1 border-wa-green/40 text-wa-green hover:bg-wa-green/10"
                    onClick={() => setAddCallOpen(true)}
                    data-ocid="calls.open_modal_button"
                  >
                    <Plus className="w-3 h-3" />
                    Log Call
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-72 scrollbar-thin">
                <CallHistorySection
                  records={callRecords}
                  onDelete={handleDeleteCallRecord}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Add Call Record Modal */}
      <AddCallRecordModal
        open={addCallOpen}
        onClose={() => setAddCallOpen(false)}
        onAdd={handleAddCall}
        contactName={contact.name}
      />
    </>
  );
}

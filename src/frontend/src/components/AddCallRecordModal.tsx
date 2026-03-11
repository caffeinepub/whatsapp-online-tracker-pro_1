import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Video } from "lucide-react";
import { useState } from "react";
import type { CallType } from "../types/callHistory";

interface AddCallRecordModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: CallType, durationSeconds: number, note?: string) => void;
  contactName: string;
}

export function AddCallRecordModal({
  open,
  onClose,
  onAdd,
  contactName,
}: AddCallRecordModalProps) {
  const [callType, setCallType] = useState<CallType>("audio");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const now = new Date();
  const formattedNow = now.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleSubmit = () => {
    const mins = Number.parseInt(minutes || "0", 10);
    const secs = Number.parseInt(seconds || "0", 10);
    const totalSeconds = mins * 60 + secs;

    if (Number.isNaN(mins) || Number.isNaN(secs) || totalSeconds <= 0) {
      setError("Duration must be at least 1 second.");
      return;
    }
    setError("");
    onAdd(callType, totalSeconds, note.trim() || undefined);
    // reset
    setMinutes("");
    setSeconds("");
    setNote("");
    setCallType("audio");
    onClose();
  };

  const handleClose = () => {
    setError("");
    setMinutes("");
    setSeconds("");
    setNote("");
    setCallType("audio");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-sm w-full rounded-2xl"
        data-ocid="add_call.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-semibold text-base">
            Log Call with {contactName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Call type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Call Type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCallType("audio")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium border transition-all ${
                  callType === "audio"
                    ? "bg-wa-green text-white border-wa-green shadow-wa"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Phone className="w-4 h-4" />
                Audio
              </button>
              <button
                type="button"
                onClick={() => setCallType("video")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium border transition-all ${
                  callType === "video"
                    ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Video className="w-4 h-4" />
                Video
              </button>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Duration
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={999}
                  placeholder="0"
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value);
                    setError("");
                  }}
                  className="rounded-xl pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  min
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  placeholder="0"
                  value={seconds}
                  onChange={(e) => {
                    setSeconds(e.target.value);
                    setError("");
                  }}
                  className="rounded-xl pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  sec
                </span>
              </div>
            </div>
            {error && (
              <p
                className="text-xs text-destructive"
                data-ocid="add_call.error_state"
              >
                {error}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Note{" "}
              <span className="text-muted-foreground/60 font-normal">
                (optional)
              </span>
            </Label>
            <Input
              placeholder="e.g. Discussed plans for weekend…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-xl"
              maxLength={120}
            />
          </div>

          {/* Timestamp info */}
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            📅 Logging as:{" "}
            <span className="font-medium text-foreground">{formattedNow}</span>
          </p>
        </div>

        <DialogFooter className="gap-2 flex-row justify-end mt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="rounded-xl"
            data-ocid="add_call.cancel_button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="rounded-xl bg-wa-green hover:bg-wa-green-dark text-white"
            data-ocid="add_call.submit_button"
          >
            Log Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

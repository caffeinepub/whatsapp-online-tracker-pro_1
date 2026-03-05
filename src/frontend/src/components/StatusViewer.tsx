import { Download, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Contact } from "../types/contact";
import type { StatusItem } from "../types/status";

interface StatusViewerProps {
  statuses: StatusItem[];
  contact: Contact;
  open: boolean;
  onClose: () => void;
  onViewed: (statusId: string) => void;
}

function formatTimeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

export function StatusViewer({
  statuses,
  contact,
  open,
  onClose,
  onViewed,
}: StatusViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const AUTO_ADVANCE_MS = 5000;
  const TICK_MS = 50;

  const currentStatus = statuses[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, statuses.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // Mark viewed on render
  useEffect(() => {
    if (!open || !currentStatus) return;
    if (!currentStatus.viewed) {
      onViewed(currentStatus.id);
    }
  }, [open, currentStatus, onViewed]);

  // Auto-advance timer — re-runs when open state or active status changes
  const activeStatusId = statuses[currentIndex]?.id;
  useEffect(() => {
    if (!open || !activeStatusId) return;
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + (TICK_MS / AUTO_ADVANCE_MS) * 100;
        if (next >= 100) {
          clearInterval(timerRef.current!);
          return 100;
        }
        return next;
      });
    }, TICK_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, activeStatusId]);

  // Navigate when progress hits 100
  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;
  useEffect(() => {
    if (progress >= 100) {
      goNextRef.current();
    }
  }, [progress]);

  // Reset index when opened
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, goNext, goPrev]);

  const handleDownload = useCallback(() => {
    if (!currentStatus) return;
    if (currentStatus.type === "photo") {
      const a = document.createElement("a");
      a.href = currentStatus.content;
      a.download = `status_${contact.name}_${currentStatus.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([currentStatus.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `status_${contact.name}_${currentStatus.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [currentStatus, contact.name]);

  if (!open || !currentStatus) return null;

  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isPhoto = currentStatus.type === "photo";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
      data-ocid="status_viewer.dialog"
    >
      {/* Max width container */}
      <div className="relative w-full max-w-sm h-full max-h-[700px] flex flex-col overflow-hidden">
        {/* Progress bars */}
        <div className="flex gap-1 px-3 pt-4 pb-2 z-10">
          {statuses.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 px-3 pb-2 z-10">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-wa-green flex-shrink-0">
            {contact.photoUrl ? (
              <img
                src={contact.photoUrl}
                alt={contact.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {contact.name}
            </p>
            <p className="text-white/60 text-xs">
              {formatTimeAgo(currentStatus.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Download status"
            data-ocid="status_viewer.download_button"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close viewer"
            data-ocid="status_viewer.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Tap left / right navigation zones */}
          <button
            type="button"
            className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer"
            onClick={goPrev}
            aria-label="Previous status"
          />
          <button
            type="button"
            className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer"
            onClick={goNext}
            aria-label="Next status"
          />

          {isPhoto ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <img
                key={currentStatus.id}
                src={currentStatus.content}
                alt="Status"
                className="max-w-full max-h-full object-contain animate-fade-in"
              />
              {currentStatus.caption && (
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm text-center">
                    {currentStatus.caption}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-wa-green/90 to-wa-green-dark">
              <p className="text-white text-xl font-semibold text-center leading-relaxed animate-fade-in">
                {currentStatus.content}
              </p>
            </div>
          )}
        </div>

        {/* Bottom counter */}
        <div className="flex justify-center py-3">
          <span className="text-white/50 text-xs">
            {currentIndex + 1} / {statuses.length}
          </span>
        </div>
      </div>
    </div>
  );
}

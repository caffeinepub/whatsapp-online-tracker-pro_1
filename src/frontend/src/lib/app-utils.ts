/**
 * App-specific utility functions for WhatsApp Online Tracker Pro.
 * These are separate from lib/utils.ts (which is a read-only platform file).
 */

import type { ActivityEntry } from "../types/activity";

// ── Initials ─────────────────────────────────────────────────────────────────

/** Extract up to 2 initials from a name */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ── Date / Time Formatting ────────────────────────────────────────────────────

/**
 * Format a timestamp as a human-readable date+time string.
 * e.g. "Jan 5, 2026, 14:32:07"
 */
export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Format a timestamp as HH:MM:SS (24-hour clock).
 * e.g. "14:32:07"
 */
export function formatTimeHHMMSS(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/**
 * Format a timestamp as a relative time string.
 * e.g. "just now", "2m ago", "3h ago", "yesterday", "Jan 5"
 */
export function formatRelativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a session duration in seconds as a human-readable string.
 * e.g. "2m 34s", "1h 5m 12s", "45s"
 */
export function formatSessionDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0s";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

/**
 * Format an estimated online duration in minutes as a human-readable string.
 * e.g. "45m", "2h 10m", "< 1m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Format a duration in milliseconds as a human-readable string.
 * e.g. "2m 34s", "1h 5m 12s", "45s"
 * Used for live session timers on contact cards.
 */
export function formatDurationMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds <= 0) return "0s";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

/**
 * Format a call duration in seconds as MM:SS.
 * e.g. "1:23", "10:05"
 */
export function formatCallDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Export / Download ─────────────────────────────────────────────────────────

/**
 * Export an activity log to a CSV file and trigger a browser download.
 */
export function exportActivityToCSV(
  contactName: string,
  entries: ActivityEntry[],
): void {
  const header = "Event,Date & Time,Time (HH:MM:SS),Duration (seconds)\n";
  const rows = entries.map((e) => {
    const event = e.status === "online" ? "Came Online" : "Went Offline";
    const dateTime = formatDateTime(e.timestamp);
    const time = formatTimeHHMMSS(e.timestamp);
    const dur =
      e.status === "offline" && e.duration != null ? String(e.duration) : "";
    return `"${event}","${dateTime}","${time}","${dur}"`;
  });

  const csv = header + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${contactName.replace(/\s+/g, "_")}_activity.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download a contact's profile photo (base64 data URL) as a JPEG file.
 */
export function downloadContactPhoto(
  contactName: string,
  photoUrl: string,
): void {
  const a = document.createElement("a");
  a.href = photoUrl;
  a.download = `${contactName.replace(/\s+/g, "_")}_dp.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

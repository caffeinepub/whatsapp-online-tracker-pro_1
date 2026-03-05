import type { ContactStatus } from "./contact";

export interface ActivityEntry {
  id: string;
  contactId: string;
  contactName: string;
  status: ContactStatus;
  timestamp: number; // ms
  duration?: number; // seconds — only set on 'offline' entries to record session length
  sessionDurationMs?: number; // ms — session duration for manual toggle entries
  source?: "manual" | "auto"; // how the status change was triggered
}

export type ActivityLog = Record<string, ActivityEntry[]>;

import { useCallback, useEffect, useState } from "react";
import type { ActivityEntry, ActivityLog } from "../types/activity";
import type { ContactStatus } from "../types/contact";

const STORAGE_KEY = "wa-tracker-activity";
const MAX_ENTRIES_PER_CONTACT = 200;

function loadLog(): ActivityLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ActivityLog;
  } catch {
    return {};
  }
}

function saveLog(log: ActivityLog) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function useActivityLog() {
  const [log, setLog] = useState<ActivityLog>(loadLog);

  useEffect(() => {
    saveLog(log);
  }, [log]);

  const addEntry = useCallback(
    (
      contactId: string,
      contactName: string,
      status: ContactStatus,
      options?: { sessionDurationMs?: number; source?: "manual" | "auto" },
    ) => {
      const now = Date.now();
      const entry: ActivityEntry = {
        id: `entry-${now}-${Math.random().toString(36).slice(2, 7)}`,
        contactId,
        contactName,
        status,
        timestamp: now,
        source: options?.source ?? "auto",
        sessionDurationMs: options?.sessionDurationMs,
      };

      setLog((prev) => {
        const existing = prev[contactId] ?? [];

        // If going offline, calculate session duration from last 'online' entry
        if (status === "offline") {
          // Use provided sessionDurationMs first (from manual toggle), fall back to computed
          if (!entry.sessionDurationMs) {
            const lastOnline = existing.find((e) => e.status === "online");
            if (lastOnline) {
              entry.duration = Math.floor((now - lastOnline.timestamp) / 1000);
            }
          } else {
            entry.duration = Math.floor(entry.sessionDurationMs / 1000);
          }
        }

        const updated = [entry, ...existing].slice(0, MAX_ENTRIES_PER_CONTACT);
        return { ...prev, [contactId]: updated };
      });

      return entry;
    },
    [],
  );

  const getContactLog = useCallback(
    (contactId: string): ActivityEntry[] => log[contactId] ?? [],
    [log],
  );

  const removeContactLog = useCallback((contactId: string) => {
    setLog((prev) => {
      const next = { ...prev };
      delete next[contactId];
      return next;
    });
  }, []);

  return { log, addEntry, getContactLog, removeContactLog };
}

import { useCallback } from "react";
import type { CallHistory, CallRecord } from "../types/callHistory";

const STORAGE_KEY = "wa-tracker-calls";

function loadHistory(): CallHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CallHistory;
  } catch {
    return {};
  }
}

function saveHistory(history: CallHistory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useCallHistory() {
  /** Returns persisted call records for a contact (empty array if none). */
  const getCallHistory = useCallback((contactId: string): CallRecord[] => {
    const history = loadHistory();
    return history[contactId] ?? [];
  }, []);

  /**
   * Manually log a new call record.
   * Returns the created record.
   */
  const addCallRecord = useCallback(
    (
      contactId: string,
      type: "audio" | "video",
      durationSeconds: number,
      note?: string,
    ): CallRecord => {
      const record: CallRecord = {
        id: `call-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        contactId,
        type,
        timestamp: Date.now(),
        duration: durationSeconds,
        note,
      };
      const history = loadHistory();
      const existing = history[contactId] ?? [];
      history[contactId] = [record, ...existing];
      saveHistory(history);
      return record;
    },
    [],
  );

  /** Remove a single call record by id. */
  const removeCallRecord = useCallback(
    (contactId: string, recordId: string) => {
      const history = loadHistory();
      const existing = history[contactId] ?? [];
      history[contactId] = existing.filter((r) => r.id !== recordId);
      if (history[contactId].length === 0) {
        delete history[contactId];
      }
      saveHistory(history);
    },
    [],
  );

  /** Remove all call records for a contact (call on contact delete). */
  const removeContactCallHistory = useCallback((contactId: string) => {
    const history = loadHistory();
    delete history[contactId];
    saveHistory(history);
  }, []);

  return {
    getCallHistory,
    addCallRecord,
    removeCallRecord,
    removeContactCallHistory,
  };
}

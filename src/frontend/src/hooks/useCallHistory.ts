import { useCallback } from "react";
import type { CallHistory, CallRecord } from "../types/callHistory";

const STORAGE_KEY = "wa-tracker-call-history";

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

function generateRandomRecords(contactId: string): CallRecord[] {
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const records: CallRecord[] = [];

  // Generate 3-5 audio calls
  const audioCount = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < audioCount; i++) {
    records.push({
      id: `call-audio-${now}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      contactId,
      type: "audio",
      timestamp: now - Math.floor(Math.random() * thirtyDays),
      duration: 30 + Math.floor(Math.random() * 570), // 30s to 600s
    });
  }

  // Generate 3-5 video calls
  const videoCount = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < videoCount; i++) {
    records.push({
      id: `call-video-${now}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      contactId,
      type: "video",
      timestamp: now - Math.floor(Math.random() * thirtyDays),
      duration: 30 + Math.floor(Math.random() * 570),
    });
  }

  // Sort by timestamp descending
  return records.sort((a, b) => b.timestamp - a.timestamp);
}

export function useCallHistory() {
  const getCallHistory = useCallback((contactId: string): CallRecord[] => {
    const history = loadHistory();
    if (!history[contactId]) {
      // Generate and persist on first access
      const records = generateRandomRecords(contactId);
      history[contactId] = records;
      saveHistory(history);
      return records;
    }
    return history[contactId];
  }, []);

  const addCallRecord = useCallback((record: CallRecord) => {
    const history = loadHistory();
    const existing = history[record.contactId] ?? [];
    history[record.contactId] = [record, ...existing];
    saveHistory(history);
  }, []);

  const removeContactCallHistory = useCallback((contactId: string) => {
    const history = loadHistory();
    delete history[contactId];
    saveHistory(history);
  }, []);

  return { getCallHistory, addCallRecord, removeContactCallHistory };
}

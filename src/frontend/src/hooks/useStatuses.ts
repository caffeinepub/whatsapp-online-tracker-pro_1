import { useCallback, useEffect, useRef, useState } from "react";
import type { ContactStatuses, StatusItem } from "../types/status";

const STORAGE_KEY = "wa_tracker_statuses";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function filterExpired(statuses: ContactStatuses): ContactStatuses {
  const now = Date.now();
  const result: ContactStatuses = {};
  for (const [contactId, items] of Object.entries(statuses)) {
    const valid = items.filter((item) => now - item.createdAt < EXPIRY_MS);
    if (valid.length > 0) {
      result[contactId] = valid;
    }
  }
  return result;
}

function loadStatuses(): ContactStatuses {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ContactStatuses;
    return filterExpired(parsed);
  } catch {
    return {};
  }
}

function saveStatuses(statuses: ContactStatuses): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  } catch (e) {
    console.warn("Failed to save statuses to localStorage:", e);
  }
}

export function useStatuses() {
  const [statuses, setStatuses] = useState<ContactStatuses>(loadStatuses);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist on change
  useEffect(() => {
    saveStatuses(statuses);
  }, [statuses]);

  // Periodically filter expired statuses (every 5 minutes)
  useEffect(() => {
    intervalRef.current = setInterval(
      () => {
        setStatuses((prev) => {
          const cleaned = filterExpired(prev);
          saveStatuses(cleaned);
          return cleaned;
        });
      },
      5 * 60 * 1000,
    );
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const addStatus = useCallback(
    (
      contactId: string,
      type: "photo" | "text",
      content: string,
      caption?: string,
    ) => {
      const newItem: StatusItem = {
        id: `status_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        contactId,
        type,
        content,
        caption,
        createdAt: Date.now(),
        viewed: false,
      };
      setStatuses((prev) => {
        const existing = prev[contactId] ?? [];
        const updated = { ...prev, [contactId]: [...existing, newItem] };
        saveStatuses(updated);
        return updated;
      });
    },
    [],
  );

  const markViewed = useCallback((statusId: string) => {
    setStatuses((prev) => {
      const updated: ContactStatuses = {};
      for (const [contactId, items] of Object.entries(prev)) {
        updated[contactId] = items.map((item) =>
          item.id === statusId ? { ...item, viewed: true } : item,
        );
      }
      saveStatuses(updated);
      return updated;
    });
  }, []);

  const deleteStatus = useCallback((statusId: string) => {
    setStatuses((prev) => {
      const updated: ContactStatuses = {};
      for (const [contactId, items] of Object.entries(prev)) {
        const filtered = items.filter((item) => item.id !== statusId);
        if (filtered.length > 0) {
          updated[contactId] = filtered;
        }
      }
      saveStatuses(updated);
      return updated;
    });
  }, []);

  const getContactStatuses = useCallback(
    (contactId: string): StatusItem[] => {
      const now = Date.now();
      return (statuses[contactId] ?? []).filter(
        (item) => now - item.createdAt < EXPIRY_MS,
      );
    },
    [statuses],
  );

  return {
    statuses,
    addStatus,
    markViewed,
    deleteStatus,
    getContactStatuses,
  };
}

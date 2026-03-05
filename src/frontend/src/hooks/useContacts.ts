import { useCallback, useEffect, useState } from "react";
import type { Contact, ContactStatus } from "../types/contact";

const STORAGE_KEY = "wa_tracker_contacts";

function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Contact[];
  } catch {
    return [];
  }
}

function saveContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.warn("Failed to save contacts to localStorage:", e);
  }
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(loadContacts);

  // Persist to localStorage whenever contacts change
  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  const addContact = useCallback(
    (name: string, phoneNumber: string, photoUrl?: string): Contact => {
      const newContact: Contact = {
        id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        status: "offline",
        lastSeen: Date.now(),
        addedAt: Date.now(),
        photoUrl: photoUrl || undefined,
      };
      setContacts((prev) => {
        const updated = [newContact, ...prev];
        saveContacts(updated);
        return updated;
      });
      return newContact;
    },
    [],
  );

  const removeContact = useCallback((id: string) => {
    setContacts((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveContacts(updated);
      return updated;
    });
  }, []);

  const updateContactStatus = useCallback(
    (id: string, status: ContactStatus) => {
      setContacts((prev) => {
        const updated = prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status,
                lastSeen: status === "offline" ? Date.now() : c.lastSeen,
                onlineSince: status === "online" ? Date.now() : undefined,
              }
            : c,
        );
        saveContacts(updated);
        return updated;
      });
    },
    [],
  );

  /**
   * Manually toggle a contact's status (online <-> offline).
   * Returns the new status and session duration (if going offline).
   */
  const manualToggleStatus = useCallback(
    (id: string): { newStatus: ContactStatus; sessionDurationMs?: number } => {
      let result: { newStatus: ContactStatus; sessionDurationMs?: number } = {
        newStatus: "online",
      };
      setContacts((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== id) return c;
          const newStatus: ContactStatus =
            c.status === "online" ? "offline" : "online";
          let sessionDurationMs: number | undefined;
          if (newStatus === "offline" && c.onlineSince) {
            sessionDurationMs = Date.now() - c.onlineSince;
          }
          result = { newStatus, sessionDurationMs };
          return {
            ...c,
            status: newStatus,
            lastSeen: newStatus === "offline" ? Date.now() : c.lastSeen,
            onlineSince: newStatus === "online" ? Date.now() : undefined,
          };
        });
        saveContacts(updated);
        return updated;
      });
      return result;
    },
    [],
  );

  // Used by useStatusSimulator to batch-update statuses
  const updateContacts = useCallback(
    (updater: (prev: Contact[]) => Contact[]) => {
      setContacts((prev) => {
        const updated = updater(prev);
        saveContacts(updated);
        return updated;
      });
    },
    [],
  );

  const updateContactPhoto = useCallback((id: string, photoUrl: string) => {
    setContacts((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, photoUrl } : c));
      // Write to localStorage immediately (atomic update)
      saveContacts(updated);
      return updated;
    });
  }, []);

  return {
    contacts,
    addContact,
    removeContact,
    updateContactStatus,
    updateContacts,
    updateContactPhoto,
    manualToggleStatus,
  };
}

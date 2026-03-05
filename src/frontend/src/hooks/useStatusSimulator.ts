import { useEffect, useRef } from "react";
import type { Contact } from "../types/contact";

interface SimulatorCallbacks {
  onStatusChange: (
    contactId: string,
    contactName: string,
    newStatus: "online" | "offline",
    contactPhotoUrl?: string,
  ) => void;
  updateContacts: (updater: (prev: Contact[]) => Contact[]) => void;
}

const MIN_INTERVAL = 12000; // 12s
const MAX_INTERVAL = 90000; // 90s

export function useStatusSimulator(
  contacts: Contact[],
  { onStatusChange, updateContacts }: SimulatorCallbacks,
) {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const contactsRef = useRef(contacts);
  // Store callbacks in refs so the timer closure always has the latest version
  // without needing them in the dep array below
  const onStatusChangeRef = useRef(onStatusChange);
  const updateContactsRef = useRef(updateContacts);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    updateContactsRef.current = updateContacts;
  }, [updateContacts]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only re-run when contact IDs change, callbacks kept fresh via refs
  useEffect(() => {
    if (contacts.length === 0) return;

    const scheduleToggle = (contactId: string) => {
      const delay =
        MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
      const timer = setTimeout(() => {
        const current = contactsRef.current.find((c) => c.id === contactId);
        if (!current) return;

        const newStatus = current.status === "online" ? "offline" : "online";
        const now = Date.now();

        updateContactsRef.current((prev) =>
          prev.map((c) =>
            c.id === contactId
              ? {
                  ...c,
                  status: newStatus,
                  lastSeen: newStatus === "offline" ? now : c.lastSeen,
                }
              : c,
          ),
        );

        // Pass photoUrl so browser notifications can use the contact's photo as icon
        onStatusChangeRef.current(
          contactId,
          current.name,
          newStatus,
          current.photoUrl,
        );
        scheduleToggle(contactId);
      }, delay);

      timersRef.current.set(contactId, timer);
    };

    // Start timers for new contacts
    for (const contact of contacts) {
      if (!timersRef.current.has(contact.id)) {
        // Stagger initial toggles
        const initialDelay = Math.random() * 20000;
        const timer = setTimeout(() => {
          timersRef.current.delete(contact.id);
          scheduleToggle(contact.id);
        }, initialDelay);
        timersRef.current.set(contact.id, timer);
      }
    }

    // Clean up timers for removed contacts
    const currentIds = new Set(contacts.map((c) => c.id));
    for (const [id, timer] of timersRef.current) {
      if (!currentIds.has(id)) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
    }
  }, [contacts.map((c) => c.id).join(",")]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) clearTimeout(timer);
      timersRef.current.clear();
    };
  }, []);
}

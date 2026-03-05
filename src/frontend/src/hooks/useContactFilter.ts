import { useMemo, useState } from "react";
import type { Contact } from "../types/contact";

export type StatusFilter = "all" | "online" | "offline";

export function useContactFilter(contacts: Contact[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    let result = contacts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phoneNumber.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    return result;
  }, [contacts, searchQuery, statusFilter]);

  return {
    filtered,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  };
}

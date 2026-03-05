import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Circle, ImageIcon, Plus } from "lucide-react";
import { useState } from "react";
import { AddStatusModal } from "../components/AddStatusModal";
import { StatusViewer } from "../components/StatusViewer";
import type { Contact } from "../types/contact";
import type { ContactStatuses, StatusItem } from "../types/status";

interface StatusPageProps {
  contacts: Contact[];
  statuses: ContactStatuses;
  addStatus: (
    contactId: string,
    type: "photo" | "text",
    content: string,
    caption?: string,
  ) => void;
  markViewed: (statusId: string) => void;
  deleteStatus: (statusId: string) => void;
}

function getContactStatuses(
  contactId: string,
  statuses: ContactStatuses,
): StatusItem[] {
  const now = Date.now();
  const EXPIRY_MS = 24 * 60 * 60 * 1000;
  return (statuses[contactId] ?? []).filter(
    (item) => now - item.createdAt < EXPIRY_MS,
  );
}

function hasUnviewed(items: StatusItem[]): boolean {
  return items.some((item) => !item.viewed);
}

function formatTimeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

export function StatusPage({
  contacts,
  statuses,
  addStatus,
  markViewed,
  deleteStatus: _deleteStatus,
}: StatusPageProps) {
  const [addModalContact, setAddModalContact] = useState<Contact | null>(null);
  const [viewerContact, setViewerContact] = useState<Contact | null>(null);

  // Contacts that have at least one active status
  const contactsWithStatuses = contacts.filter(
    (c) => getContactStatuses(c.id, statuses).length > 0,
  );

  const totalActiveStatuses = contactsWithStatuses.reduce(
    (sum, c) => sum + getContactStatuses(c.id, statuses).length,
    0,
  );

  const viewerStatuses = viewerContact
    ? getContactStatuses(viewerContact.id, statuses)
    : [];

  // Keep viewer contact reference fresh
  const latestViewerContact = viewerContact
    ? (contacts.find((c) => c.id === viewerContact.id) ?? viewerContact)
    : null;

  return (
    <div className="space-y-5 animate-fade-in" data-ocid="status.page">
      {/* Page header */}
      <div className="wa-gradient rounded-2xl px-5 py-4 text-white shadow-wa">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Status
            </h1>
            <p className="text-white/80 text-sm mt-0.5">
              {totalActiveStatuses} active update
              {totalActiveStatuses !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Circle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Updates — story bubbles */}
      {contactsWithStatuses.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-card p-4">
          <h2 className="font-display font-semibold text-foreground text-sm mb-3">
            Recent Updates
          </h2>
          <ScrollArea>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {contactsWithStatuses.map((contact, idx) => {
                const items = getContactStatuses(contact.id, statuses);
                const unviewed = hasUnviewed(items);
                const initials = contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setViewerContact(contact)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
                    data-ocid={`status.item.${idx + 1}`}
                  >
                    <div
                      className={`w-14 h-14 rounded-full p-0.5 ${
                        unviewed
                          ? "bg-gradient-to-tr from-wa-green to-wa-teal"
                          : "bg-muted"
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-background p-0.5">
                        {contact.photoUrl ? (
                          <img
                            src={contact.photoUrl}
                            alt={contact.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-wa-green flex items-center justify-center text-white text-sm font-bold">
                            {initials}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-foreground font-medium max-w-[3.5rem] truncate text-center">
                      {contact.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* My Contacts — list with add status button */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <h2 className="font-display font-semibold text-foreground text-sm">
            My Contacts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add status updates for any contact
          </p>
        </div>

        {contacts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center px-4"
            data-ocid="status.empty_state"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No status updates yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Add contacts first, then post status updates for them here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {contacts.map((contact, idx) => {
              const items = getContactStatuses(contact.id, statuses);
              const hasStatuses = items.length > 0;
              const unviewed = hasUnviewed(items);
              const latest = items[items.length - 1];
              const initials = contact.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                  data-ocid={`status.item.${idx + 1}`}
                >
                  {/* Avatar with optional ring */}
                  <button
                    type="button"
                    onClick={() => hasStatuses && setViewerContact(contact)}
                    disabled={!hasStatuses}
                    className={`flex-shrink-0 relative ${hasStatuses ? "cursor-pointer" : "cursor-default"}`}
                    aria-label={
                      hasStatuses ? `View ${contact.name}'s status` : undefined
                    }
                  >
                    <div
                      className={`w-11 h-11 rounded-full p-0.5 ${
                        hasStatuses && unviewed
                          ? "bg-gradient-to-tr from-wa-green to-wa-teal"
                          : hasStatuses
                            ? "bg-muted-foreground/30"
                            : ""
                      }`}
                    >
                      <div
                        className={`w-full h-full rounded-full overflow-hidden ${hasStatuses ? "bg-background p-0.5" : ""}`}
                      >
                        {contact.photoUrl ? (
                          <img
                            src={contact.photoUrl}
                            alt={contact.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-wa-green flex items-center justify-center text-white text-xs font-bold">
                            {initials}
                          </div>
                        )}
                      </div>
                    </div>
                    {hasStatuses && unviewed && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-wa-green border-2 border-background" />
                    )}
                  </button>

                  {/* Info */}
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left cursor-pointer"
                    onClick={() => hasStatuses && setViewerContact(contact)}
                    disabled={!hasStatuses}
                  >
                    <p className="text-sm font-semibold text-foreground truncate">
                      {contact.name}
                    </p>
                    {hasStatuses && latest ? (
                      <p className="text-xs text-muted-foreground truncate">
                        {latest.type === "text"
                          ? latest.content.slice(0, 40) +
                            (latest.content.length > 40 ? "…" : "")
                          : `📷 Photo · ${formatTimeAgo(latest.createdAt)}`}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {contact.phoneNumber}
                      </p>
                    )}
                  </button>

                  {/* Status count badge */}
                  {hasStatuses && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-wa-green text-white text-[10px] font-bold flex items-center justify-center">
                      {items.length}
                    </span>
                  )}

                  {/* Add status button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAddModalContact(contact)}
                    className="flex-shrink-0 h-8 px-2.5 rounded-lg text-xs text-wa-green hover:bg-wa-green/10 hover:text-wa-green font-semibold gap-1"
                    data-ocid={`status.add_button.${idx + 1}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Status Modal */}
      <AddStatusModal
        contact={addModalContact}
        open={!!addModalContact}
        onClose={() => setAddModalContact(null)}
        onAdd={(contactId, type, content, caption) => {
          addStatus(contactId, type, content, caption);
          setAddModalContact(null);
        }}
      />

      {/* Status Viewer */}
      {latestViewerContact && viewerStatuses.length > 0 && (
        <StatusViewer
          statuses={viewerStatuses}
          contact={latestViewerContact}
          open={!!viewerContact}
          onClose={() => setViewerContact(null)}
          onViewed={markViewed}
        />
      )}
    </div>
  );
}

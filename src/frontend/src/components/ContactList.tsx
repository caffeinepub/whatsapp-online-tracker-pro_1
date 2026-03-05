import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { useState } from "react";
import { type StatusFilter, useContactFilter } from "../hooks/useContactFilter";
import { cn } from "../lib/utils";
import type { ActivityLog } from "../types/activity";
import type { Contact } from "../types/contact";
import { ActivityLogModal } from "./ActivityLogModal";
import { ContactCard } from "./ContactCard";
import { EditContactPhotoModal } from "./EditContactPhotoModal";

interface ContactListProps {
  contacts: Contact[];
  activityLog: ActivityLog;
  onDelete: (id: string) => void;
  onUpdatePhoto?: (contactId: string, photoUrl: string) => void;
  onManualToggle?: (contactId: string) => void;
}

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
];

export function ContactList({
  contacts,
  activityLog,
  onDelete,
  onUpdatePhoto,
  onManualToggle,
}: ContactListProps) {
  const {
    filtered,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useContactFilter(contacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [editPhotoContact, setEditPhotoContact] = useState<Contact | null>(
    null,
  );
  const [editPhotoOpen, setEditPhotoOpen] = useState(false);

  const handleViewLog = (contact: Contact) => {
    setSelectedContact(contact);
    setLogOpen(true);
  };

  const handleEditPhoto = (contact: Contact) => {
    setEditPhotoContact(contact);
    setEditPhotoOpen(true);
  };

  const handleSavePhoto = (contactId: string, photoUrl: string) => {
    onUpdatePhoto?.(contactId, photoUrl);
    setEditPhotoOpen(false);
    setEditPhotoContact(null);
  };

  // Always use the latest contact data from the contacts array so photoUrl stays in sync
  const latestSelectedContact = selectedContact
    ? (contacts.find((c) => c.id === selectedContact.id) ?? selectedContact)
    : null;

  return (
    <div className="space-y-3">
      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-muted/50 border-transparent focus:border-primary/30"
          />
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                statusFilter === opt.value
                  ? "bg-wa-green text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {contacts.length > 0 && (
        <p className="text-xs text-muted-foreground px-1">
          Showing {filtered.length} of {contacts.length} contacts
        </p>
      )}

      {/* Contact cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          {contacts.length === 0 ? (
            <>
              <p className="text-sm font-semibold text-foreground">
                No contacts yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add your first contact to start tracking
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">
                No matches found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search or filter
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((contact, idx) => (
            <div
              key={contact.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
            >
              <ContactCard
                contact={contact}
                activityEntries={activityLog[contact.id] ?? []}
                onDelete={onDelete}
                onViewLog={handleViewLog}
                onEditPhoto={handleEditPhoto}
                onManualToggle={onManualToggle}
                index={idx + 1}
              />
            </div>
          ))}
        </div>
      )}

      {/* Activity Log Modal — use latest contact data to keep photoUrl in sync */}
      <ActivityLogModal
        contact={latestSelectedContact}
        entries={
          latestSelectedContact
            ? (activityLog[latestSelectedContact.id] ?? [])
            : []
        }
        open={logOpen}
        onClose={() => setLogOpen(false)}
      />

      {/* Edit Photo Modal */}
      <EditContactPhotoModal
        contact={editPhotoContact}
        open={editPhotoOpen}
        onClose={() => {
          setEditPhotoOpen(false);
          setEditPhotoContact(null);
        }}
        onSave={handleSavePhoto}
      />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { AddContactForm } from "../components/AddContactForm";
import { ContactList } from "../components/ContactList";
import { cn } from "../lib/utils";
import type { ActivityLog } from "../types/activity";
import type { Contact } from "../types/contact";

interface ContactsPageProps {
  contacts: Contact[];
  activityLog: ActivityLog;
  onAdd: (name: string, phone: string, photoUrl?: string) => void;
  onDelete: (id: string) => void;
  onUpdatePhoto?: (contactId: string, photoUrl: string) => void;
  onManualToggle?: (contactId: string) => void;
}

export function ContactsPage({
  contacts,
  activityLog,
  onAdd,
  onDelete,
  onUpdatePhoto,
  onManualToggle,
}: ContactsPageProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Contacts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className={cn(
            "rounded-xl h-9 text-sm font-semibold transition-all shadow-wa",
            showForm
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "bg-wa-green hover:bg-wa-green-dark text-white",
          )}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-1.5" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Contact
            </>
          )}
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-card rounded-2xl border border-border shadow-card p-4 animate-fade-in-up">
          <AddContactForm
            onAdd={(name, phone, photoUrl) => {
              onAdd(name, phone, photoUrl);
              setShowForm(false);
            }}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Contact list */}
      <ContactList
        contacts={contacts}
        activityLog={activityLog}
        onDelete={onDelete}
        onUpdatePhoto={onUpdatePhoto}
        onManualToggle={onManualToggle}
      />
    </div>
  );
}

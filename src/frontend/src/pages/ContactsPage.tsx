import { Button } from "@/components/ui/button";
import { Info, Plus, X } from "lucide-react";
import { useState } from "react";
import { AddContactForm } from "../components/AddContactForm";
import { ContactList } from "../components/ContactList";
import { cn } from "../lib/utils";
import type { ActivityLog } from "../types/activity";
import type { Contact } from "../types/contact";

const BANNER_KEY = "wa-tracker-banner-dismissed";

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
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_KEY) === "true";
    } catch {
      return false;
    }
  });

  const dismissBanner = () => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_KEY, "true");
    } catch {
      // ignore
    }
  };

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
          data-ocid="contacts.primary_button"
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

      {/* Info banner — dismissible, persisted in localStorage */}
      {!bannerDismissed && (
        <div className="flex items-start gap-3 bg-wa-green/10 border border-wa-green/20 rounded-xl px-4 py-3 animate-fade-in-up">
          <Info className="w-4 h-4 text-wa-green flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80 flex-1 leading-relaxed">
            This app tracks status{" "}
            <span className="font-semibold text-foreground">manually</span>.
            Press{" "}
            <span className="font-semibold text-wa-green">"Mark Online"</span>{" "}
            or{" "}
            <span className="font-semibold text-foreground/70">
              "Mark Offline"
            </span>{" "}
            on each contact card to log their activity and session time.
          </p>
          <button
            type="button"
            onClick={dismissBanner}
            data-ocid="info_banner.close_button"
            className="flex-shrink-0 p-0.5 rounded-md hover:bg-wa-green/15 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss info banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

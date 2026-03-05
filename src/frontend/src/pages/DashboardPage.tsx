import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Activity, Plus, Users, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { ActivityLogModal } from "../components/ActivityLogModal";
import { RecentlyActiveList } from "../components/RecentlyActiveList";
import { StatCard } from "../components/StatCard";
import { useDashboardStats } from "../hooks/useContactStats";
import type { ActivityLog } from "../types/activity";
import type { Contact } from "../types/contact";

interface DashboardPageProps {
  contacts: Contact[];
  activityLog: ActivityLog;
  onNavigateToContacts?: () => void;
}

export function DashboardPage({
  contacts,
  activityLog,
  onNavigateToContacts,
}: DashboardPageProps) {
  const { total, online, offline, recentlyActive } = useDashboardStats(
    contacts,
    activityLog,
  );
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [logOpen, setLogOpen] = useState(false);

  const handleViewLog = (contact: Contact) => {
    setSelectedContact(contact);
    setLogOpen(true);
  };

  // Always resolve the latest contact data so photoUrl stays in sync
  const latestSelectedContact = selectedContact
    ? (contacts.find((c) => c.id === selectedContact.id) ?? selectedContact)
    : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Welcome Banner */}
      <div className="wa-gradient rounded-2xl px-5 py-4 text-white shadow-wa">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl">Dashboard</h1>
            <p className="text-white/80 text-sm mt-0.5">
              Monitoring {total} contact{total !== 1 ? "s" : ""} in real-time
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={total} icon={Users} variant="total" />
        <StatCard label="Online" value={online} icon={Wifi} variant="online" />
        <StatCard
          label="Offline"
          value={offline}
          icon={WifiOff}
          variant="offline"
        />
      </div>

      {/* Recently Active */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-foreground text-sm">
            Recently Active
          </h2>
          <Link to="/contacts">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-wa-green hover:text-wa-green-dark"
            >
              View All
            </Button>
          </Link>
        </div>

        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No contacts yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Add contacts to start tracking their online status
            </p>
            {onNavigateToContacts ? (
              <Button
                onClick={onNavigateToContacts}
                size="sm"
                className="bg-wa-green hover:bg-wa-green-dark text-white rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Contact
              </Button>
            ) : (
              <Link to="/contacts">
                <Button
                  size="sm"
                  className="bg-wa-green hover:bg-wa-green-dark text-white rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Contact
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <RecentlyActiveList
            contacts={recentlyActive}
            onViewLog={handleViewLog}
          />
        )}
      </div>

      {/* Activity Log Modal */}
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
    </div>
  );
}

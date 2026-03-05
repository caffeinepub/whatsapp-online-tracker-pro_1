import { BarChart2, TrendingUp } from "lucide-react";
import { ContactStatsCard } from "../components/ContactStatsCard";
import type { ActivityLog } from "../types/activity";
import type { Contact } from "../types/contact";

interface StatisticsPageProps {
  contacts: Contact[];
  activityLog: ActivityLog;
}

export function StatisticsPage({ contacts, activityLog }: StatisticsPageProps) {
  const onlineCount = contacts.filter((c) => c.status === "online").length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Statistics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily activity patterns for all contacts
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-wa-green/10 text-wa-green rounded-xl px-3 py-1.5">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-semibold">{onlineCount} online</span>
        </div>
      </div>

      {/* Summary banner */}
      <div className="wa-gradient rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm">
              Today's Overview
            </p>
            <p className="text-white/80 text-xs">
              Tracking {contacts.length} contact
              {contacts.length !== 1 ? "s" : ""} · Updates every few seconds
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <BarChart2 className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No data yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add contacts to see their activity statistics
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.map((contact, idx) => (
            <div
              key={contact.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <ContactStatsCard contact={contact} log={activityLog} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

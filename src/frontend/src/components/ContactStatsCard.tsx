import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useContactStats } from "../hooks/useContactStats";
import { formatDuration, getInitials } from "../lib/app-utils";
import type { ActivityLog } from "../types/activity";
import type { Contact } from "../types/contact";
import { ActivityChart } from "./ActivityChart";
import { StatusIndicator } from "./StatusIndicator";

interface ContactStatsCardProps {
  contact: Contact;
  log: ActivityLog;
}

export function ContactStatsCard({ contact, log }: ContactStatsCardProps) {
  const stats = useContactStats(contact.id, log);
  const [imgError, setImgError] = useState(false);
  const photoUrl = contact.photoUrl;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on photoUrl change
  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  const handleImgError = () => {
    if (photoUrl?.startsWith("data:")) {
      setImgError(true);
    }
  };

  const showPhoto = !!photoUrl && photoUrl.startsWith("data:") && !imgError;

  return (
    <Card className="rounded-2xl border shadow-card hover:shadow-card-hover transition-all overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {showPhoto ? (
              <img
                key={photoUrl}
                src={photoUrl}
                alt={contact.name}
                loading="eager"
                className="w-10 h-10 rounded-full object-cover"
                onError={handleImgError}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wa-green/20 to-wa-green-dark/20 flex items-center justify-center font-display font-bold text-wa-green-dark text-sm">
                {getInitials(contact.name)}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5">
              <StatusIndicator status={contact.status} size="sm" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">
              {contact.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {contact.phoneNumber}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-wa-green">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">
                {stats.totalOnlineEvents} events
              </span>
            </div>
            <p className="text-xs text-muted-foreground">today</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-wa-green/5 rounded-xl p-2.5 border border-wa-green/10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <TrendingUp className="w-3 h-3 text-wa-green" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Est. Online
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {formatDuration(stats.estimatedOnlineMinutes)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-2.5 border border-border">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Events
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {stats.todayEvents}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
            Hourly Activity (Today)
          </p>
          <ActivityChart data={stats.hourlyActivity} height={60} />
        </div>
      </CardContent>
    </Card>
  );
}

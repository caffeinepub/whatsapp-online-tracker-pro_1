import { useMemo } from "react";
import type { ActivityLog } from "../types/activity";

export interface HourlyData {
  hour: number;
  count: number;
}

export interface ContactStats {
  contactId: string;
  totalOnlineEvents: number;
  estimatedOnlineMinutes: number;
  hourlyActivity: HourlyData[];
  todayEvents: number;
}

export function useContactStats(
  contactId: string,
  log: ActivityLog,
): ContactStats {
  return useMemo(() => {
    const entries = log[contactId] ?? [];
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayMs = startOfDay.getTime();

    const todayEntries = entries.filter((e) => e.timestamp >= startOfDayMs);
    const onlineEntries = todayEntries.filter((e) => e.status === "online");

    // Hourly activity (0-23)
    const hourlyMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) hourlyMap.set(h, 0);
    for (const e of todayEntries) {
      const hour = new Date(e.timestamp).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + 1);
    }

    const hourlyActivity: HourlyData[] = Array.from(hourlyMap.entries()).map(
      ([hour, count]) => ({
        hour,
        count,
      }),
    );

    // Estimate online time: each "online" event = ~5 min average session
    const estimatedOnlineMinutes = onlineEntries.length * 5;

    return {
      contactId,
      totalOnlineEvents: onlineEntries.length,
      estimatedOnlineMinutes,
      hourlyActivity,
      todayEvents: todayEntries.length,
    };
  }, [contactId, log]);
}

export function useDashboardStats(
  contacts: import("../types/contact").Contact[],
  _log: ActivityLog,
) {
  return useMemo(() => {
    const total = contacts.length;
    const online = contacts.filter((c) => c.status === "online").length;
    const offline = total - online;

    const recentlyActive = [...contacts]
      .sort((a, b) => b.lastSeen - a.lastSeen)
      .slice(0, 8);

    return { total, online, offline, recentlyActive };
  }, [contacts]);
}

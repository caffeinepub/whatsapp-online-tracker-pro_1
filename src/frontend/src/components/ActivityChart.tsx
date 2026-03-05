import type { HourlyData } from "../hooks/useContactStats";

interface ActivityChartProps {
  data: HourlyData[];
  height?: number;
}

export function ActivityChart({ data, height = 80 }: ActivityChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const currentHour = new Date().getHours();

  // Show only last 12 hours for cleaner display
  const displayData = data.filter((d) => d.hour <= currentHour).slice(-12);
  if (displayData.length === 0) {
    displayData.push(...data.slice(0, 12));
  }

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end gap-0.5 h-full w-full">
        {displayData.map(({ hour, count }) => {
          const barHeight = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const isCurrentHour = hour === currentHour;
          return (
            <div
              key={hour}
              className="flex-1 flex flex-col items-center justify-end gap-0.5 group"
              title={`${hour}:00 - ${count} events`}
            >
              <div
                className="w-full rounded-t-sm transition-all duration-500 relative"
                style={{
                  height: `${Math.max(barHeight, count > 0 ? 8 : 2)}%`,
                  backgroundColor: isCurrentHour
                    ? "#25D366"
                    : count > 0
                      ? "rgba(37,211,102,0.6)"
                      : "rgba(37,211,102,0.15)",
                  minHeight: count > 0 ? "4px" : "2px",
                }}
              />
              {displayData.length <= 12 && (
                <span className="text-[8px] text-muted-foreground opacity-60">
                  {hour}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

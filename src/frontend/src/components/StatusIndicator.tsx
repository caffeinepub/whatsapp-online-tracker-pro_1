import { cn } from "../lib/utils";
import type { ContactStatus } from "../types/contact";

interface StatusIndicatorProps {
  status: ContactStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusIndicator({
  status,
  size = "md",
  className,
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
  };

  return (
    <span className={cn("relative inline-flex", sizeClasses[size], className)}>
      {status === "online" && (
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-wa-green opacity-60 animate-pulse-online",
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full w-full h-full",
          status === "online" ? "bg-wa-green" : "bg-gray-400 dark:bg-gray-500",
        )}
      />
    </span>
  );
}

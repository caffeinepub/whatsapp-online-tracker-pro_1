import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "default" | "online" | "offline" | "total";
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  className,
}: StatCardProps) {
  const variantStyles = {
    default: "from-primary/10 to-primary/5 border-primary/20",
    online: "from-wa-green/10 to-wa-green/5 border-wa-green/20",
    offline: "from-gray-500/10 to-gray-500/5 border-gray-500/20",
    total: "from-wa-green-dark/10 to-wa-green-dark/5 border-wa-green-dark/20",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    online: "bg-wa-green/10 text-wa-green",
    offline: "bg-gray-500/10 text-gray-500",
    total: "bg-wa-green-dark/10 text-wa-green-dark",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-4 shadow-card transition-all hover:shadow-card-hover",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            iconStyles[variant],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart2,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import type { AppNotification } from "../types/notification";
import { NotificationsPanel } from "./NotificationsPanel";
import { ThemeToggle } from "./ThemeToggle";

interface AppHeaderProps {
  notifications: AppNotification[];
  unreadCount: number;
  onNotificationsOpen: () => void;
  onNotificationsClear: () => void;
}

const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/statistics", label: "Statistics", icon: BarChart2 },
];

export function AppHeader({
  notifications,
  unreadCount,
  onNotificationsOpen,
  onNotificationsClear,
}: AppHeaderProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 wa-gradient shadow-wa">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center h-14 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-sm hidden sm:block">
              WA Tracker Pro
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4 flex-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <NotificationsPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onOpen={onNotificationsOpen}
              onClear={onNotificationsClear}
            />
            <ThemeToggle />
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 flex flex-col gap-1 animate-fade-in">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

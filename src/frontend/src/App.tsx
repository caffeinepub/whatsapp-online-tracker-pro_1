import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { createContext, useCallback, useContext, useEffect } from "react";
import { AppHeader } from "./components/AppHeader";
import { ToastContainer } from "./components/ToastContainer";
import { useActivityLog } from "./hooks/useActivityLog";
import { useBrowserNotifications } from "./hooks/useBrowserNotifications";
import { useContacts } from "./hooks/useContacts";
import { useNotifications } from "./hooks/useNotifications";
import { useSoundAlert } from "./hooks/useSoundAlert";
import { useStatusSimulator } from "./hooks/useStatusSimulator";
import { useStatuses } from "./hooks/useStatuses";
import { useTheme } from "./hooks/useTheme";
import { useToastNotifications } from "./hooks/useToastNotifications";
import { ContactsPage } from "./pages/ContactsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { StatusPage } from "./pages/StatusPage";
import type { ActivityLog } from "./types/activity";
import type { Contact } from "./types/contact";
import type { ContactStatuses } from "./types/status";

// ── App-wide context ──────────────────────────────────────────────────────────

interface AppContextValue {
  contacts: Contact[];
  activityLog: ActivityLog;
  addContact: (name: string, phone: string, photoUrl?: string) => Contact;
  handleDeleteContact: (id: string) => void;
  updateContactPhoto: (contactId: string, photoUrl: string) => void;
  handleManualToggle: (contactId: string) => void;
  statuses: ContactStatuses;
  addStatus: (
    contactId: string,
    type: "photo" | "text",
    content: string,
    caption?: string,
  ) => void;
  markViewed: (statusId: string) => void;
  deleteStatus: (statusId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppContext not found");
  return ctx;
}

// ── Page wrappers (consume context) ──────────────────────────────────────────

function DashboardPageWrapper() {
  const { contacts, activityLog } = useAppContext();
  const navigate = useNavigate();
  return (
    <DashboardPage
      contacts={contacts}
      activityLog={activityLog}
      onNavigateToContacts={() => navigate({ to: "/contacts" })}
    />
  );
}

function ContactsPageWrapper() {
  const {
    contacts,
    activityLog,
    addContact,
    handleDeleteContact,
    updateContactPhoto,
    handleManualToggle,
  } = useAppContext();
  return (
    <ContactsPage
      contacts={contacts}
      activityLog={activityLog}
      onAdd={addContact}
      onDelete={handleDeleteContact}
      onUpdatePhoto={updateContactPhoto}
      onManualToggle={handleManualToggle}
    />
  );
}

function StatisticsPageWrapper() {
  const { contacts, activityLog } = useAppContext();
  return <StatisticsPage contacts={contacts} activityLog={activityLog} />;
}

function StatusPageWrapper() {
  const { contacts, statuses, addStatus, markViewed, deleteStatus } =
    useAppContext();
  return (
    <StatusPage
      contacts={contacts}
      statuses={statuses}
      addStatus={addStatus}
      markViewed={markViewed}
      deleteStatus={deleteStatus}
    />
  );
}

// ── Root layout (provides context + shared chrome) ────────────────────────────

function RootLayout() {
  useTheme();

  const {
    contacts,
    addContact,
    removeContact,
    updateContacts,
    updateContactPhoto,
    manualToggleStatus,
  } = useContacts();
  const { log: activityLog, addEntry, removeContactLog } = useActivityLog();
  const { statuses, addStatus, markViewed, deleteStatus } = useStatuses();
  const { notifications, addNotification, markAllRead, clearAll, unreadCount } =
    useNotifications();
  const { toasts, addToast, removeToast } = useToastNotifications();
  const { playNotificationSound } = useSoundAlert();
  const { showNotification, requestPermission } = useBrowserNotifications();

  // Proactively request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      requestPermission();
    }
  }, [requestPermission]);

  const handleStatusChange = useCallback(
    (
      contactId: string,
      contactName: string,
      newStatus: "online" | "offline",
      contactPhotoUrl?: string,
      options?: { source?: "manual" | "auto"; sessionDurationMs?: number },
    ) => {
      addEntry(contactId, contactName, newStatus, {
        source: options?.source ?? "auto",
        sessionDurationMs: options?.sessionDurationMs,
      });
      addNotification(contactId, contactName, newStatus);

      // Toast + sound + browser notification only when contact comes ONLINE
      if (newStatus === "online") {
        const label =
          options?.source === "manual"
            ? "manually marked online"
            : "is now online";
        addToast(contactName, label);
        playNotificationSound();
        showNotification(
          contactName,
          `${contactName} ${label}`,
          contactPhotoUrl,
        );
      }
    },
    [
      addEntry,
      addNotification,
      addToast,
      playNotificationSound,
      showNotification,
    ],
  );

  const handleManualToggle = useCallback(
    (contactId: string) => {
      const { newStatus, sessionDurationMs } = manualToggleStatus(contactId);
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;
      handleStatusChange(contactId, contact.name, newStatus, contact.photoUrl, {
        source: "manual",
        sessionDurationMs,
      });
    },
    [manualToggleStatus, contacts, handleStatusChange],
  );

  useStatusSimulator(contacts, {
    onStatusChange: handleStatusChange,
    updateContacts,
  });

  const handleDeleteContact = useCallback(
    (id: string) => {
      removeContact(id);
      removeContactLog(id);
    },
    [removeContact, removeContactLog],
  );

  const appId = encodeURIComponent(
    window.location.hostname || "wa-tracker-pro",
  );

  const ctxValue: AppContextValue = {
    contacts,
    activityLog,
    addContact,
    handleDeleteContact,
    updateContactPhoto,
    handleManualToggle,
    statuses,
    addStatus,
    markViewed,
    deleteStatus,
  };

  return (
    <AppContext.Provider value={ctxValue}>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationsOpen={markAllRead}
          onNotificationsClear={clearAll}
        />

        {/* Global toast container - renders above all content */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5">
          <Outlet />
        </main>

        <footer className="border-t border-border py-4 px-4 mt-auto">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              © {new Date().getFullYear()} WhatsApp Online Tracker Pro
            </span>
            <span className="flex items-center gap-1">
              Built with{" "}
              <Heart className="w-3 h-3 text-wa-green fill-wa-green mx-0.5" />{" "}
              using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-wa-green hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </footer>
      </div>
    </AppContext.Provider>
  );
}

// ── Router setup ──────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPageWrapper,
});

const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contacts",
  component: ContactsPageWrapper,
});

const statisticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/statistics",
  component: StatisticsPageWrapper,
});

const statusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/status",
  component: StatusPageWrapper,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  contactsRoute,
  statusRoute,
  statisticsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

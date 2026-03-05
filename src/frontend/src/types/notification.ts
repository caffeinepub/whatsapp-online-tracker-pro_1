import type { ContactStatus } from "./contact";

export interface AppNotification {
  id: string;
  contactId: string;
  contactName: string;
  status: ContactStatus;
  timestamp: number;
  isRead: boolean;
}

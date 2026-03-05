export type ContactStatus = "online" | "offline";

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  status: ContactStatus;
  lastSeen: number; // timestamp ms
  addedAt: number;
  photoUrl?: string; // base64 data URL for profile photo
  onlineSince?: number; // timestamp ms when contact came online (for live session timer)
}

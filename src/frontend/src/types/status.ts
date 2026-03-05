export interface StatusItem {
  id: string;
  contactId: string;
  type: "photo" | "text";
  content: string; // base64 data URL for photo, or text string
  caption?: string; // optional caption for photo statuses
  createdAt: number; // timestamp ms
  viewed: boolean;
}

export type ContactStatuses = Record<string, StatusItem[]>;

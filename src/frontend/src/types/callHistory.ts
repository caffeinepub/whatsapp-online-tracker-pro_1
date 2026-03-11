export type CallType = "audio" | "video";

export interface CallRecord {
  id: string;
  contactId: string;
  type: CallType;
  timestamp: number; // ms
  duration: number; // seconds
  note?: string;
}

export type CallHistory = Record<string, CallRecord[]>;

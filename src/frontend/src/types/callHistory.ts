export type CallType = "audio" | "video";

export interface CallRecord {
  id: string;
  contactId: string;
  type: CallType;
  timestamp: number; // ms
  duration: number; // seconds
}

export type CallHistory = Record<string, CallRecord[]>;

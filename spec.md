# WhatsApp Online Tracker Pro

## Current State
A manual contact status tracking web app with:
- Contact management (add/delete with optional photo upload)
- Simulated auto status toggling via `useStatusSimulator` (random intervals 12-90s)
- Activity log per contact (online/offline events with timestamps)
- Dashboard with stat cards and recently active list
- In-app toast notifications + browser notifications + sound on status change
- Dark/light mode toggle
- Contact stats, call history (simulated), CSV download
- DP photo upload and download

**Key issues:**
- Status changes are fully automated (random simulator) — user has no manual control
- No "how long has this contact been online" live timer visible on the card
- Session duration not tracked in activity log
- UI can be further improved with WhatsApp-like aesthetics
- Manual status change does not guarantee immediate in-app notification (only simulator triggers notifications)

## Requested Changes (Diff)

### Add
- Manual "Mark Online" / "Mark Offline" button on each ContactCard — prominent, one-tap toggle
- Live session timer on ContactCard: when contact is online, show elapsed time (e.g. "Online for 2m 34s") updating every second
- Session duration recorded in ActivityLog when a contact goes offline (duration of the online session)
- In-app toast notification + sound triggered immediately when user manually toggles status to "online"
- "Manual" badge/label in activity log entries to distinguish manual vs simulator changes
- WhatsApp-style UI polish: teal gradient header, green status bubbles, cleaner card layout, WhatsApp green accents throughout

### Modify
- `ContactCard`: Add prominent manual toggle button (green "Online" / grey "Offline") visible always (not just on hover)
- `useStatusSimulator`: Pass a flag so manual vs simulated changes can be distinguished in log
- `useActivityLog`: Store optional `sessionDurationMs` and `source` ("manual" | "auto") on each entry
- `ActivityLogModal`: Display session duration and source badge on entries
- `AppHeader`: Slightly improved logo and branding
- `useContacts`: Add `onlineSince` timestamp to Contact — set when status becomes online, cleared on offline

### Remove
- No features removed

## Implementation Plan
1. Update `Contact` type to include `onlineSince?: number`
2. Update `ActivityEntry` type to include `sessionDurationMs?: number` and `source?: "manual" | "auto"`
3. Update `useContacts` — set `onlineSince` when status goes online, compute session duration when going offline
4. Update `useActivityLog` — accept and store `sessionDurationMs` and `source` on `addEntry`
5. Update `handleStatusChange` in `App.tsx` to accept source param and pass it through
6. Update `useStatusSimulator` — pass source="auto" on callbacks
7. Add manual toggle handler in `ContactsPage` (and expose via `App.tsx` context) — calls handleStatusChange with source="manual"
8. Update `ContactCard` — add always-visible manual toggle button + live online session timer showing "Online for Xm Ys"
9. Update `ActivityLogModal` — show session duration + manual/auto badge
10. UI polish pass: WhatsApp green color system, better card shadows, status badges

# WhatsApp Online Tracker Pro

## Current State
The app is a manual WhatsApp-style contact tracker with:
- Contact management (add/delete with optional photo upload)
- Manual online/offline status toggling with live session timer
- Activity log with history per contact
- Call history section (audio/video simulated)
- Notifications panel with badge count
- Toast notifications + sound alert when contact goes online
- Browser notifications (Web Notifications API)
- Statistics page
- Dark/Light mode
- DP download and activity history CSV download

## Requested Changes (Diff)

### Add
- **WhatsApp Status feature**: A new "Status" section/page where users can manage statuses per contact
  - Each contact can have one or more status items (photo uploaded via file picker OR text message)
  - Status items show a timestamp (when added), a caption/text, and optionally a photo
  - WhatsApp-style story viewer UI: circular avatar rings on contacts with unviewed statuses, click to open full-screen story viewer with auto-advance timer
  - Download button on each status item (downloads photo as image file, or text as .txt)
  - Status items expire after 24 hours (mirroring WhatsApp behavior) — shown with a countdown
  - "Add Status" button to add a new status for a contact (text or photo)
- **Status tab in navigation**: Add a "Status" nav link in the header alongside Dashboard, Contacts, Statistics

### Modify
- `App.tsx`: Add StatusPage route + context wiring for status CRUD
- `AppHeader.tsx`: Add "Status" nav link
- `types/contact.ts` or new `types/status.ts`: Add `StatusItem` and `ContactStatuses` types
- A new hook `useStatuses.ts` to manage status data in localStorage

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/types/status.ts` with `StatusItem` interface (id, contactId, type: 'photo'|'text', content: string, caption?: string, createdAt: number)
2. Create `src/hooks/useStatuses.ts` managing status CRUD in localStorage with expiry logic
3. Create `src/components/StatusViewer.tsx` — full-screen WhatsApp-style story viewer with auto-advance and download
4. Create `src/components/StatusCard.tsx` — per-contact status ring/avatar card showing unviewed count
5. Create `src/components/AddStatusModal.tsx` — modal to add text or photo status for a contact
6. Create `src/pages/StatusPage.tsx` — main status page with contact status rings at top, list of statuses below with download buttons
7. Update `AppHeader.tsx` to add Status nav link
8. Update `App.tsx` to add /status route and provide status context
9. Apply deterministic `data-ocid` markers to all interactive elements

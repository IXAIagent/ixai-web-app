# V5.20 Notification Center

## Goal

Create a local-only Notification Center that converts Alert Engine cards into notification readback.

## Scope

- Add notification types, engine, service, summary UI, and `/my-ixai/notifications`.
- Add local read/unread state in browser storage.
- Add Workspace navigation entry.

## Behavior

- Notifications are generated from existing alert cards.
- Read/unread status is local-only.
- Empty state is shown when no alerts exist.

## Boundary

No push, email, LINE, Telegram, backend persistence, auth changes, schema migrations, broker integrations, trading logic, investment recommendations, or AI model calls.

# V5.40 Timeline Engine

## Goal

Create a unified future event timeline for Workspace.

## Scope

- Aggregate FCN schedule events.
- Include alert events when a usable date exists.
- Group events into overdue, next 7 days, next 30 days, and future.
- Add `/my-ixai/timeline`.

## Behavior

- Sorts events by date ascending.
- Does not invent dates.
- Shows safe empty states.

## Boundary

No alert delivery, broker sync, trading logic, investment recommendations, AI model calls, auth changes, schema migrations, or FCN pricing.

# V6.10 Workspace API Routes

## Goal

Expose the Workspace API service layer through read-only route handlers.

## Routes

- `/api/workspace/graph`
- `/api/workspace/health`
- `/api/workspace/timeline`
- `/api/workspace/notifications`
- `/api/workspace/intelligence`
- `/api/workspace/daily-brief`

## Response Contract

Each route returns stable JSON with:

- `ok`
- `data`
- `sourceStatus`
- `generatedAt`
- `warnings`

## Server-Safe Limitation

The current personalized Workspace services still depend on browser-local fallback data in several modules. V6.10 route handlers therefore return limited server-safe readback where full client-local data cannot safely run server-side.

## Boundaries

Read-only only. No write operations, auth changes, schema changes, migrations, broker integration, trading, recommendations, or AI calls.

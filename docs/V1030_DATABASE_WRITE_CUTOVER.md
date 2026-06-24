# V10.30 Database Write Cutover

V10.30 adds guarded write cutover scaffolding for Portfolio, FCN, Watchlist, and Alert History.

The write result metadata includes:

- `success`
- `target`
- `fallbackUsed`
- `errorMessage`
- `writtenAt`
- `operationId`

The database write path is feature-guarded and disabled by default. Existing local, draft, FCN Draft Store, deterministic alert, and fallback behavior remain active.

No automatic render-time writes, duplicate alert inserts, destructive deletes, broker integration, trading logic, AI recommendation logic, auth changes, schema changes, or remote migrations are introduced.

# V7.0 Data Persistence Program

## Goal

Move IXAI toward authenticated multi-user persistent Workspace architecture while preserving existing local, fallback, draft, and API readback behavior.

## Scope

V7.0 establishes foundation modules for:

- V7.10 Portfolio Persistence Foundation
- V7.20 Workspace Ownership Foundation
- V7.30 Workspace Sync Foundation
- V7.40 FCN Persistence Foundation
- V7.50 Watchlist Persistence Foundation
- V7.60 Alert Persistence Foundation

## Runtime Boundary

No migrations are applied. Runtime does not require new tables. Existing Workspace Graph, FCN Center, Watchlist, Alerts, and local fallback behavior remain available.

## Out Of Scope

No broker integration, trading execution, order routing, buy/sell/hold recommendations, AI model calls, payment system, public landing page redesign, auth behavior changes, or local fallback removal.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

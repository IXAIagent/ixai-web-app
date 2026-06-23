# V8 Database Activation Program

## Goal

Move IXAI from schema drafts and repository foundations toward database activation readiness while keeping runtime safe when new tables do not exist.

## Modules

- V8.10 Portfolio Persistence Activation
- V8.20 FCN Persistence Activation
- V8.30 Watchlist Persistence Activation
- V8.40 Alert History Activation
- V8.50 Workspace Ownership Activation
- V8.60 Workspace Sync Activation
- V8.70 Database Activation Diagnostics

## Runtime Boundary

No migrations are applied automatically. New tables are optional at runtime. All activation services catch missing-table or readback errors and preserve existing local/draft/fallback behavior.

## Out Of Scope

No broker integration, trading execution, order routing, buy/sell/hold recommendations, AI model calls, payment system, public landing page redesign, auth behavior changes, or local fallback removal.

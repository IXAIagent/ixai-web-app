# V9 Real Persistence Program

## Goal

Move IXAI from database activation readiness toward guarded live database readback while preserving every existing local, draft, API, and fallback path.

## Modules

- V9.10 Portfolio Live Persistence
- V9.20 FCN Live Persistence
- V9.30 Watchlist Live Persistence
- V9.40 Alert History Live Persistence
- V9.50 Workspace Ownership Enforcement
- V9.60 Workspace Sync Engine
- V9.70 Migration + Health Check Foundation

## Architecture

```text
Input / Draft / Existing API
↓
Guarded Live Persistence Readback
↓
Local / Draft / Fallback Preservation
↓
Portfolio Truth / Workspace Graph
↓
Valuation / Risk / FCN / Schedule / Intelligence
```

## Runtime Safety

- New tables are optional at runtime.
- Missing tables return unavailable or partial status.
- Live writes remain guarded and fallback-safe.
- Sync generates a plan only; it never reconciles, overwrites, deletes, or writes automatically.
- Ownership helpers are conservative and require explicit owner context before scoped queries are constructed.

## Out Of Scope

No migrations are applied automatically. No auth behavior changes, broker integration, trading execution, order routing, buy/sell/hold recommendations, AI model calls, payment system, public landing redesign, destructive sync, or fallback removal are included.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

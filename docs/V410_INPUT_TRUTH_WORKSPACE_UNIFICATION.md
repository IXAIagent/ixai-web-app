# v4.10 Input → Truth → Workspace Unification

## Objective

v4.10 closes the user-visible gap identified in `docs/V410_WORKSPACE_FULL_SCAN_REPORT.md`: asset input flows could create local drafts while Portfolio Truth, Risk Center, Intelligence Center, and FCN Center read only persisted API data.

This release creates a safe bridge between browser-local input drafts and Workspace readback without changing Supabase schema, migrations, API contracts, auth, membership, broker sync, market data providers, AI providers, or trading logic.

## Problems Addressed

- The active `/my-ixai/portfolio` page did not render the v4.09 Workspace Market Status component.
- Stock / Crypto / FCN input forms created local or draft data that did not appear in Portfolio Truth readback.
- FCN Wizard still used stale v3.08 copy and wrote only to legacy local draft stores.
- FCN Center read persisted `/api/fcn` positions but did not surface local pending FCN input state.
- Workspace Home and Settings still had stale route-foundation wording.
- Mobile bottom navigation treated Settings as part of Intelligence active state.

## What Changed

- Added a v4.10 Input Truth Bridge at `src/lib/portfolio/input/input-truth-bridge.ts`.
- Extended Portfolio Truth readback with local pending input records, pending counts, pending known notional, and an `Input Truth Bridge` source status.
- Updated Stock and Crypto input forms to write to both Recent Inputs and the Input Truth Bridge.
- Updated FCN Wizard to write to the Input Truth Bridge while preserving the legacy FCN Draft Store.
- Updated FCN Center to display pending FCN inputs alongside persisted `/api/fcn` readback.
- Updated the active Portfolio route to render Workspace Market Status directly.
- Updated Workspace Home and Settings copy to reflect the current Workspace architecture.
- Updated mobile bottom nav so Settings is no longer treated as an Intelligence active route.

## Data Flow

Before:

```text
Stock / Crypto / FCN Input
→ local recent input or FCN draft

/api/fcn / /api/stocks / /api/crypto / /api/portfolio/dashboard
→ Portfolio Truth Layer
→ Portfolio / Risk / Intelligence
```

After:

```text
Stock / Crypto / FCN Input
→ Recent Inputs compatibility store
→ Input Truth Bridge local pending readback
→ Portfolio Truth Layer
→ Portfolio / Risk / Intelligence

FCN Wizard
→ Legacy FCN Draft Store compatibility
→ Input Truth Bridge local pending readback
→ FCN Center pending section

/api/fcn / /api/stocks / /api/crypto / /api/portfolio/dashboard
→ persisted readback
→ Portfolio Truth Layer
→ Portfolio / Risk / Intelligence / FCN Center
```

## Source Boundaries

Persisted data remains sourced from:

- `/api/fcn`
- `/api/stocks`
- `/api/crypto`
- `/api/portfolio/dashboard`

Local pending data is sourced from:

- `ixai.portfolio.input-truth-bridge.v410`
- `ixai.portfolio.recent-inputs.v306` as compatibility fallback
- `ixai.fcn.drafts.v308` as compatibility fallback

Manual FCN prices remain sourced from:

- `ixai.fcn.manual-prices.v320`

## Legacy Fallbacks Preserved

v4.10 intentionally preserves:

- Recent Inputs localStorage fallback.
- v3.08 FCN Draft Store fallback.
- FCN manual price overlay.
- Persisted `/api/fcn` Supabase readback.
- Existing `/api/stocks`, `/api/crypto`, and `/api/portfolio/dashboard` readback contracts.

No legacy fallback was deleted.

## User-Facing Semantics

The bridge labels local entries as pending. It does not claim that browser-local input is server-persisted.

Portfolio Truth now distinguishes:

- Persisted API records.
- Browser-local pending inputs.
- Missing server persistence.
- Missing market values.

FCN Center now distinguishes:

- Persisted FCN positions from `/api/fcn`.
- Pending FCN input from the v4.10 bridge.
- Manual price overlay from localStorage.

## Out of Scope

v4.10 does not add:

- Supabase schema changes.
- Migrations.
- New API routes or API contract changes.
- Auth changes.
- Membership or entitlement changes.
- Broker integration.
- Live market data provider.
- FCN pricing engine.
- Server-persisted input draft lifecycle.
- Trading, order execution, buy/sell instructions, target prices, position sizing, or return promises.

## Remaining Gaps

- Stock / Crypto / FCN input still needs server persistence into the existing position APIs.
- FCN draft-to-position lifecycle remains pending.
- FCN archive / restore persistence remains disabled.
- Live market data provider is not enabled.
- FCN current-price freshness, KO distance, and strike-distance semantics still require a market-data plan.
- Settings remains an IA preview, not a full account / notification / broker settings system.

## Next Recommended Step

Recommended next versions:

- `v4.11 Market Data Provider / FCN Risk Engine`: settle current-price source precedence, provider freshness, FCN KI / KO / strike distance semantics, and pending-to-persisted FCN lifecycle.
- `v4.12 Unified Dashboard`: connect Workspace Home to Portfolio Truth, FCN summary, Risk summary, Intelligence status, and Market readiness without duplicating center logic.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Optional if time allows: `QA_PORT=3001 npm run qa:mobile`

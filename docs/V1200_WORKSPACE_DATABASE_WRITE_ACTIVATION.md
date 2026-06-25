# V12.00 Workspace Database Write Activation

## Goal

V12.00 starts the first real, guarded database-backed Workspace write flow.

The activation scope is intentionally narrow:

- Watchlist write path.
- Alert History write path.
- Workspace bootstrap / membership bootstrap only when an authenticated session exists and explicit write guards allow it.

Portfolio and FCN writes remain disabled and readiness-only in this version.

## Architecture

```text
User action
  -> V12 write guard
  -> Workspace bootstrap check
  -> Supabase table write when enabled
  -> Local / deterministic fallback when blocked
```

Diagnostics never write during render.

## Write Guards

V12 write guards return:

- `module`
- `enabled`
- `source`
- `reason`
- `checkedAt`

Watchlist and Alert History can be enabled only when explicit environment guards are set. Portfolio and FCN are scope-disabled in V12.00.

## Workspace Bootstrap

The bootstrap helper can:

- Read the authenticated Supabase user when available.
- Find an existing `workspaces` row for the owner.
- Create a workspace and owner membership only when called by an explicit write action and the guard is enabled.

The diagnostics path uses read-only bootstrap status and does not create rows.

## Watchlist Write Path

V12 adds a guarded write service for:

- `watchlists`
- `watchlist_items`

It avoids duplicate symbols by checking the workspace/watchlist/symbol tuple before insert. If the database is unavailable, unauthenticated, or guard-disabled, local fallback remains active.

## Alert History Write Path

V12 retargets alert history readback to the production table:

- `alert_history`

It preserves deterministic dedupe keys using:

```text
sourceEngine:id
```

Alert history writes are explicit action-only. Generated alert cards are not automatically inserted during render.

## Diagnostics

V12 metadata is surfaced in:

- Workspace Home.
- Settings diagnostics.
- Database Activation Status.
- Platform Cutover Status.
- Workspace Graph.
- Integration Audit.

The UI shows:

- V12 phase.
- Watchlist write status.
- Alert History write status.
- Workspace bootstrap status.
- Fallback status.
- Disabled Portfolio / FCN write modules.

## V12.01 Guard Review Note

V12.01 reviewed the write activation path and tightened diagnostics safety:

- Page render and QA diagnostics must not invoke write services.
- Platform cutover preview status is read-only metadata only.
- Workspace bootstrap creation remains limited to explicit write actions with `allowCreate: true` and an enabled guard.
- Watchlist and Alert History guarded write services remain available for explicit action flows only.

## Boundaries

V12.00 does not:

- Execute migrations.
- Run `supabase db push`.
- Change auth redirects or onboarding.
- Change RLS.
- Change schema.
- Remove Truth Layer.
- Remove localStorage / FCN Draft Store fallback.
- Enable Portfolio or FCN database writes.
- Connect Binance or Yahoo Finance.
- Add broker sync.
- Add trading logic.
- Add AI recommendations.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Step

V12.10 should perform controlled staging validation of the Watchlist write path, including explicit user action testing, fallback proof, and duplicate-prevention verification before any wider write activation.

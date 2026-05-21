# IXAI Future Refactor Plan

Date: 2026-05-21

This plan prioritizes stabilization work before PWA and commercial expansion. It is intentionally incremental and avoids a rewrite.

## Priority 0: Production Safety

### 1. Replace Public Admin MVP Gate

Problem:

- Admin password hash is client-visible and reused as API authorization.
- Client-side gate is not a production auth boundary.

Fix:

- Add server-side admin session.
- Use HTTP-only cookie or Supabase Auth role.
- Make `/api/admin/*` validate server session only.
- Remove password hash from client props.

### 2. Persist Editorial CMS State

Problem:

- Published intelligence uses localStorage/in-memory fallback.

Fix:

- Move Daily Brief drafts/published briefs to Supabase.
- Keep static fallback for disaster recovery.
- Add migration for `daily_brief_drafts` and `daily_brief_publications`.

### 3. Verify Pro Dashboard Production Env

Problem:

- Pro runtime requires `NEXT_PUBLIC_API_BASE_URL`.

Fix:

- Add deployment checklist.
- Add graceful backend unavailable UI.
- Add a small `/settings` environment readiness section if needed.

## Priority 1: UX and Ecosystem Clarity

### 1. Clarify Public `/pro` vs Pro Dashboard

Keep:

- `/pro` = education / preview / what IXAI Pro does.
- external dashboard = actual Pro OS.

Fix:

- Use "了解 IXAI Pro" for `/pro`.
- Use "進入 IXAI Pro Dashboard" for external dashboard.

### 2. Polish Pro Dashboard Metadata

Fix:

- Replace `Create Next App` title.
- Add IXAI Pro description.
- Add app icon/manifest if Pro will be shared directly.

### 3. Reduce Pro Internal Jargon

Target pages:

- `/dashboard`
- `/settings`
- `/accounts`
- `/intelligence`

Approach:

- Keep terminal density.
- Add user-facing labels and "what to monitor first" guidance.
- Move system diagnostics lower on settings pages.

## Priority 2: Data and Fetching Boundaries

### 1. Consolidate Public Market Quote Fetching

Problem:

- Multiple widgets call `/api/market/quotes`.

Fix:

- Add shared client quote cache/hook.
- Keep server quote provider cache.
- Ensure widget fetches are deduped.

### 2. Split Pro API Client

Current:

- `app/lib/api.ts` contains types, token helpers, cache, fetcher, and endpoint functions.

Future split:

- `app/lib/api/client.ts`
- `app/lib/api/types.ts`
- `app/lib/api/auth.ts`
- `app/lib/api/endpoints/*.ts`

Do this only when adding new Pro features or shared auth.

### 3. Standardize Ecosystem Config

Current:

- Public and Pro each have their own ecosystem/identity config.

Future:

- Keep duplicated config while repos are separate.
- Once stable, consider a small shared package or generated config file.

## Priority 3: Shared Identity

### 1. Choose Final Auth Direction

Candidates:

- Supabase Auth shared between apps.
- Managed auth provider with custom domain.

Need:

- shared `user_id`
- RLS for watchlist/preferences
- separate Pro entitlement
- no cross-domain token copying

### 2. Shared Watchlist

Schema should support:

- `user_id`
- `symbol`
- `name`
- `asset_type`
- `market`
- `note`
- `source_app`
- `created_at`
- `updated_at`

### 3. Shared Intelligence Memory

Start relational:

- preferred categories
- watched symbols
- recent sections
- last visit
- Pro workspace references

Avoid vector memory until account foundation is stable.

## Priority 4: PWA

Public App first:

- installability
- app shell
- no sensitive/offline data cache initially

Later:

- offline Daily/Weekly reading
- watchlist offline queue

Pro Dashboard later:

- only after auth/session hardening
- avoid caching private API responses

## Priority 5: Commercialization

### Free → Personal → Pro Funnel

Current:

- Free content layer is coherent.
- Watchlist is a good personal layer.
- Pro bridge is active.

Next:

- Add lead capture status tracking.
- Clarify Pro request/consultation flow.
- Add entitlement architecture later, not now.

## Recommended Sprint Order

1. Admin auth hardening.
2. Editorial persistence.
3. Pro metadata/env readiness.
4. Pro lint warning cleanup.
5. Public quote fetch dedupe.
6. PWA installability for Public App.
7. Shared auth implementation planning.

## What Can Wait

- Monorepo migration.
- Payment.
- Broker integration.
- Native mobile wrapper.
- Full offline Pro dashboard.
- Vector/AI memory.

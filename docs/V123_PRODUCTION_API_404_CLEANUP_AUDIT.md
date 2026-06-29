# V12.3 Production API 404 Cleanup Audit

## Background

PR #82 production manual verification showed the V12.2 Settings / Copilot runtime hang appears resolved:

- `/my-ixai/home` loads normally.
- `/my-ixai/settings` loads normally.
- `/my-ixai/copilot` loads normally.
- No Chrome `RESULT_CODE_HUNG` was observed.
- No gray screen or white screen was observed.
- No authenticated `401` storm was observed.

The remaining production Console issue is a small set of Supabase REST `404` requests. This V12.3 work is an audit only. It does not implement a fix and does not declare the full V12 runtime program complete.

## Evidence Summary

Manual production screenshots showed request URL fragments containing:

- `completed&limit=1`
- `categories&limit=1`

Static source audit maps those fragments to optional account personalization reads:

- `onboarding_completed&limit=1` from `ixai_profile_memory`.
- `preferred_categories&limit=1` from `ixai_user_preferences`.

No source match was found for literal `/completed`, `/categories`, `completed` table, or `categories` table requests in the app runtime. The fragments are column-name suffixes inside PostgREST `select=...&limit=1` queries.

## 404 Inventory

| Request / API / Table | Source file | Function / component | Trigger route | Purpose | Optional or required | Expected production behavior | Risk level | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /rest/v1/ixai_profile_memory?user_id=eq.<user>&select=watched_symbols,recently_viewed_sections,last_visit_at,onboarding_completed&limit=1` | `src/lib/personalization/persistence.ts` | `loadProfileMemory(...)`, called by `AuthProvider` | Any authenticated app route during root auth hydration; observed on `/my-ixai/home`, `/my-ixai/settings`, `/my-ixai/copilot` | Load lightweight personal market memory and onboarding completion into root auth memory | Optional runtime sync table | If table exists and RLS allows the user, return one row. If missing, app should fall back to local personal memory. | Low for route stability; medium for console cleanliness | Keep fallback behavior. Decide separately whether to apply/review identity persistence migrations in production or silence/skip optional probes when known absent. |
| `GET /rest/v1/ixai_user_preferences?user_id=eq.<user>&select=preferred_categories&limit=1` | `src/lib/personalization/persistence.ts` | `loadUserPreferences(...)`, called by `AuthProvider` | Any authenticated app route during root auth hydration; observed on `/my-ixai/home`, `/my-ixai/settings`, `/my-ixai/copilot` | Load user's preferred intelligence categories into root auth memory | Optional runtime sync table | If table exists and RLS allows the user, return one row. If missing, app should fall back to local preferences. | Low for route stability; medium for console cleanliness | Keep fallback behavior. Decide separately whether to apply/review account foundation migrations in production or silence/skip optional probes when known absent. |

## Source Mapping

Observed fragment: `completed&limit=1`

- Precise source: `src/lib/personalization/persistence.ts`
- Query column: `onboarding_completed`
- Table: `ixai_profile_memory`
- Caller: `components/auth/auth-provider.tsx`
- Call chain: `AuthProvider` hydration / auth state change -> `activateAuthenticatedSession(...)` -> `loadProfileMemory(...)`
- Route class: root provider, so it can appear on public or Workspace routes after an authenticated session is restored.
- Production expectation: optional cross-device profile memory sync. The app remains usable through local fallback when absent.

Observed fragment: `categories&limit=1`

- Precise source: `src/lib/personalization/persistence.ts`
- Query column: `preferred_categories`
- Table: `ixai_user_preferences`
- Caller: `components/auth/auth-provider.tsx`
- Call chain: `AuthProvider` hydration / auth state change -> `activateAuthenticatedSession(...)` -> `loadUserPreferences(...)`
- Route class: root provider, so it can appear on public or Workspace routes after an authenticated session is restored.
- Production expectation: optional cross-device preference sync. The app remains usable through local fallback when absent.

Related non-matching sources reviewed:

- Weekly editorial public reads use `ixai_weekly_intelligence_drafts` and `status=eq.published&...&limit=1` for slug lookups. They do not match `completed&limit=1` or `categories&limit=1`.
- Daily editorial public reads use `ixai_daily_intelligence_drafts` with `status=eq.published` and fallback to local content. They do not match the observed fragments.
- Account profile reads use `ixai_user_profiles` and include `onboarding_completed`, but the audited query shape is not the observed `...completed&limit=1` personalization URL.
- Admin onboarding uses a local `completed` metric, not a production `/completed` endpoint.
- News and intelligence category arrays are in-memory content fields, not `/categories` or `categories` table requests.

## Classification

### A. Optional Resource

Both observed `404` requests are optional account personalization resources:

- `ixai_profile_memory`
- `ixai_user_preferences`

The app already uses local fallback memory and local fallback preferences when these tables are unavailable.

### B. Incorrect Endpoint / Query

No evidence found. The queries target documented historical tables and documented columns.

### C. Missing Migration / Table

Likely production condition. The tables are documented in `docs/supabase-schema.md` and migration files:

- `supabase/migrations/001_identity_persistence.sql`
- `supabase/migrations/003_ixai_account_foundation.sql`

Current project context only confirms production migrations `009`, `010`, and `011` as applied. This audit does not apply migrations and does not recommend applying them without a separate migration review.

### D. Dead Or Legacy Code

Not confirmed. The root-provider personalization sync is still part of the AuthProvider identity memory model. The issue is that optional sync probes still create visible production 404s when the optional tables are absent.

### E. Misconfigured Public Content Endpoint

No evidence found. Daily / Weekly / Market public content sources were inspected and do not match the observed `completed&limit=1` or `categories&limit=1` fragments.

## Runtime Impact Assessment

- Continuous repeat: unlikely. The optional Supabase helper disables a missing optional table for 15 minutes using module memory plus `sessionStorage`.
- Indefinite retry: not found. No retry loop was found around these two reads.
- Render loop risk: low. Calls are in async auth hydration / auth state activation paths and resolve to fallback state.
- Route instability risk: low after PR #82. These 404s are not the same failure class as the previous Settings / Copilot renderer hang.
- Console cleanliness risk: medium. A first authenticated route hydration can still produce visible 404 network entries before the optional-table cooldown is established.
- User impact: low. Preferences and profile memory fall back locally; cross-device sync for these optional tables is unavailable when the tables are absent.

One nuance: because `loadProfileMemory(...)` and `loadUserPreferences(...)` are separate optional probes, both tables can each produce one visible 404 before cooldown. Multiple tabs, hard reloads after sessionStorage clear, or a fresh browser session can show the same first-miss behavior again.

## Recommended Fixes

No implementation in this audit branch.

Recommended fix order:

1. Confirm production schema state for `ixai_profile_memory` and `ixai_user_preferences`.
2. If the tables should exist, perform a separate migration review for the identity/account persistence migrations and production RLS policies.
3. If the tables should remain optional or deferred, add an explicit production feature/config gate so root auth hydration can skip these optional reads without emitting network 404s.
4. Keep local fallback as the primary safe behavior until production schema/RLS is explicitly validated.
5. Keep warnings low-frequency and avoid route-mount diagnostics that call optional tables automatically outside root auth hydration.

Do not change:

- Auth business logic.
- Supabase schema or RLS without a separate approved migration task.
- Billing, broker, trading, recommendation, scheduler, notification delivery, or AI behavior.

## Production Verification Checklist

After a future cleanup fix, verify on `https://app.ixuan.ai`:

- Log in with a normal authenticated account.
- Open `/my-ixai/home`.
- Open `/my-ixai/settings`.
- Open `/my-ixai/copilot`.
- Filter DevTools Network / Console for:
  - `ixai_profile_memory`
  - `ixai_user_preferences`
  - `onboarding_completed&limit=1`
  - `preferred_categories&limit=1`
  - `completed&limit=1`
  - `categories&limit=1`
- Confirm no repeated 404 entries appear on initial route load or route switching.
- Confirm no `401` storm, no `RESULT_CODE_HUNG`, no gray screen, and no white screen.
- Confirm local preferences and personal memory still render/fallback when optional sync is unavailable.

## Out Of Scope

- No product feature work.
- No runtime code change.
- No routing behavior change.
- No auth behavior change.
- No Supabase schema change.
- No SQL or migration.
- No RLS / auth policy / membership change.
- No billing.
- No broker, trading, or AI recommendation.
- No scheduler or notification delivery activation.
- No declaration that V12 is complete. Runtime hang appears resolved after PR #82 manual production verification, but V12 remains under continued production observation and this branch only records the remaining API 404 cleanup audit.

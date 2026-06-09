# Portfolio / FCN Foundation Audit — 2026-06-09

This audit reviews the mixed local v1.80 / v1.81 Portfolio-FCN working tree before any release, commit, or push.

Scope:

- v1.80.2 Portfolio CRUD
- v1.80.3 FCN Input
- v1.80.4 Stock / Crypto Input
- v1.80.5 Dashboard Readback
- v1.81.1 Portfolio Form
- v1.81.2 FCN Wizard

No product code was modified for this audit.

## 1. Git State

Current branch:

- `main`

HEAD / origin:

- `HEAD = 1cf286e`
- `origin/main = 1cf286e`
- `main` is synchronized with `origin/main`.

Tracked modified files:

- `app/fcn/page.tsx`
- `app/portfolio/page.tsx`
- `app/pro/page.tsx`
- `app/risk/page.tsx`

Untracked v1.80 / v1.81 files:

- `app/api/crypto/**`
- `app/api/fcn/**`
- `app/api/portfolio/**`
- `app/api/stocks/**`
- `components/fcn/**`
- `components/portfolio/**`
- `src/lib/crypto/**`
- `src/lib/fcn/server.ts`
- `src/lib/portfolio/**`
- `src/lib/positions/**`
- `src/lib/stock/**`
- `src/types/crypto-position.ts`
- `src/types/fcn-position.ts`
- `src/types/portfolio.ts`
- `src/types/stock-position.ts`
- `supabase/migrations/009_portfolio_foundation.sql`
- `supabase/migrations/010_fcn_position_foundation.sql`
- `supabase/migrations/011_stock_crypto_position_foundation.sql`
- v1.80 / v1.81 docs listed in git status.

Files not belonging to this audit:

- Social Pack incident docs and v1.82 / v1.83 Social Pack changes.
- Existing unrelated docs from earlier stabilization work.
- Any future v1.90 or App / Pro SSO work.

Release implication:

- v1.80 / v1.81 is local-only. It is not committed and not pushed.
- Direct push is not safe because the working tree mixes schema migrations, APIs, UI, and docs in one unreleased local state.

## 2. Migration Readiness

Audited migrations:

- `supabase/migrations/009_portfolio_foundation.sql`
- `supabase/migrations/010_fcn_position_foundation.sql`
- `supabase/migrations/011_stock_crypto_position_foundation.sql`

### 009 Portfolio Foundation

Creates:

- `public.portfolios`

Key fields:

- `id`
- `user_id`
- `name`
- `base_currency`
- `description`
- `status`
- `created_at`
- `updated_at`

Readiness:

- Includes `gen_random_uuid()` / `pgcrypto`.
- Includes `auth.users(id)` FK with cascade delete.
- Includes status and currency checks.
- Includes owner-scoped RLS for select / insert / update / delete.
- Revokes anon table access.
- Grants authenticated select / insert / update / delete.
- Has useful indexes for user, status, and created_at.

Risk:

- Low schema risk if applied to staging first.
- Production will fail for Portfolio APIs if this migration is not applied.

### 010 FCN Position Foundation

Creates:

- `public.fcn_positions`
- `public.fcn_underlyings`

Readiness:

- Includes user ownership on both tables.
- `fcn_positions.portfolio_id` references `public.portfolios(id)`.
- `fcn_underlyings.fcn_position_id` references `public.fcn_positions(id)`.
- Includes FCN status, currency, JSON shape, and non-negative numeric checks.
- RLS select / insert / update / delete is owner-scoped.
- Insert / update policies verify that `portfolio_id` or `fcn_position_id` belongs to `auth.uid()`.
- Revokes anon access.
- Grants authenticated access.
- Includes indexes for user, portfolio, position, status, maturity date, and symbol.

Risk:

- Depends on 009.
- Must be applied after 009.
- Underlyings are only create-with-FCN in the current helper; replace/update underlyings is not implemented.

### 011 Stock / Crypto Position Foundation

Creates:

- `public.stock_positions`
- `public.crypto_positions`

Readiness:

- Includes user ownership and `portfolio_id` FK.
- Includes market / currency / status / type / strategy check constraints.
- Supports crypto grid / dual storage fields.
- RLS select / insert / update / delete is owner-scoped.
- Insert / update policies verify portfolio ownership.
- Revokes anon access.
- Grants authenticated access.
- Includes indexes for user, portfolio, symbol, status, market / exchange, and created_at.

Risk:

- Depends on 009.
- Must be applied after 009; can be applied after 010.
- Stock / Crypto APIs will fail if 011 is not applied.

Migration order:

1. `009_portfolio_foundation.sql`
2. `010_fcn_position_foundation.sql`
3. `011_stock_crypto_position_foundation.sql`

Migration Go / No-Go:

- Go for staging dry-run.
- No-Go for direct production without staging validation, backup, and manual SQL review.

## 3. API Readiness

Audited API routes:

- `GET /api/portfolio`
- `POST /api/portfolio`
- `GET /api/portfolio/[id]`
- `PATCH /api/portfolio/[id]`
- `DELETE /api/portfolio/[id]`
- `GET /api/portfolio/dashboard`
- `GET /api/fcn`
- `POST /api/fcn`
- `GET /api/fcn/[id]`
- `PATCH /api/fcn/[id]`
- `DELETE /api/fcn/[id]`
- `GET /api/stocks`
- `POST /api/stocks`
- `GET /api/stocks/[id]`
- `PATCH /api/stocks/[id]`
- `DELETE /api/stocks/[id]`
- `GET /api/crypto`
- `POST /api/crypto`
- `GET /api/crypto/[id]`
- `PATCH /api/crypto/[id]`
- `DELETE /api/crypto/[id]`

### Portfolio CRUD

Status: mostly complete.

- Requires Supabase Bearer token through `Authorization` header.
- Validates the current Supabase user through `/auth/v1/user`.
- Uses Supabase REST with anon key + user access token, not service role.
- Filters reads and mutations by `user_id`.
- Returns 401 for unauthenticated.
- Returns 404 for invalid / missing owner-owned id.
- DELETE is soft archive through `status = archived`.
- Error responses are sanitized and do not expose raw Supabase errors.

Risk:

- Depends on migration 009.
- No automated CRUD test is present.

### FCN CRUD

Status: mostly complete for create/read/update/archive of FCN main record.

- Requires Supabase Bearer token.
- Validates current Supabase user.
- Verifies portfolio ownership before create and when filtering by portfolio.
- Can create FCN with underlyings.
- Reads underlyings for list/detail responses.
- DELETE is soft archive through `status = archived`.
- Error responses are sanitized.

Known limitation:

- Underlying update is not implemented. Update only patches the FCN main table.
- FCN create rolls back the main FCN row best-effort if underlying insert fails.

Risk:

- Depends on migrations 009 and 010.
- Needs API-level fixture/manual test for create-with-underlyings before release.

### Stock CRUD

Status: data/API foundation complete, no UI.

- Requires Supabase Bearer token.
- Validates current Supabase user.
- Verifies portfolio ownership before create and portfolio-filtered list.
- Filters by `user_id`.
- DELETE is soft archive through `status = archived`.
- Error responses are sanitized.

Risk:

- Depends on migrations 009 and 011.
- No App UI exists for stock input.
- Needs API contract tests before release.

### Crypto CRUD

Status: data/API foundation complete, no UI.

- Requires Supabase Bearer token.
- Validates current Supabase user.
- Verifies portfolio ownership before create and portfolio-filtered list.
- Supports spot / futures / grid / dual / other storage fields.
- DELETE is soft archive through `status = archived`.
- Error responses are sanitized.

Risk:

- Depends on migrations 009 and 011.
- No App UI exists for crypto / grid / dual input.
- Needs API contract tests before release.

### Dashboard Summary API

Status: foundation complete but migration-sensitive.

- `GET /api/portfolio/dashboard` calls `getPortfolioDashboardSummary()`.
- Reads portfolios, FCNs, stocks, and crypto positions.
- Computes counts, approximate values, incomplete valuation count, grid / dual counts, and high-level risk status.
- Uses only stored fields; no AI, news, live price, or advice.
- Returns 401 if unauthenticated and 503 if readback unavailable.

Risk:

- Any missing table among portfolios / FCN / stocks / crypto can make the dashboard unavailable.
- Production must apply all 009/010/011 migrations before readback surfaces can be safely released.

## 4. UI Readiness

Audited UI:

- `components/portfolio/portfolio-form.tsx`
- `components/portfolio/portfolio-readback-summary.tsx`
- `components/fcn/fcn-wizard.tsx`
- `app/portfolio/page.tsx`
- `app/fcn/page.tsx`
- `app/risk/page.tsx`
- `app/pro/page.tsx`

### Portfolio Form

Status: usable alpha form.

- Client component.
- Fields: name, baseCurrency, description.
- Uses `getSupabaseAuthorizationHeaders()`.
- Submits to `POST /api/portfolio`.
- Does not call Supabase directly.
- Does not use localStorage.
- Has loading, success, and error states.
- Validates required name and allowed currency.
- Calls `router.refresh()` and dispatches `ixai:portfolio:changed`.

Risk:

- Requires logged-in Supabase session and migration 009.
- Needs real browser/manual test with a staging Supabase user.

### FCN Wizard

Status: functional alpha wizard.

- Client component.
- Loads active portfolios from `GET /api/portfolio`.
- Submits FCN + underlyings to `POST /api/fcn`.
- Does not call Supabase directly.
- Does not use localStorage.
- Has multi-step flow: basic info, underlyings, terms, schedule, review.
- Requires at least one underlying.
- Supports up to 6 underlyings.
- Converts optional numeric strings to numbers or null.
- Shows no-portfolio / unauthenticated / error states.
- Calls `router.refresh()` and dispatches `ixai:portfolio:changed`.

Risk:

- The form is large and should receive 390px visual QA before production.
- It depends on migrations 009 and 010.
- Schedule mapping uses simple input dates and stores observationStart / observationEnd from the same observation date; acceptable for MVP but not a complete FCN schedule model.

### Readback Summary

Status: usable alpha readback component.

- Calls `GET /api/portfolio/dashboard`.
- Handles loading / unauthenticated / error / ready states.
- Renders counts for Portfolio / FCN / Stock / Crypto.
- Renders approximate stored value, FCN underlyings, grid / dual count, incomplete valuation warning, and risk awareness.
- Uses non-advisory copy.

Risk:

- Any missing migration table can make the component show readback unavailable.
- It is inserted into `/portfolio`, `/fcn`, `/risk`, and `/pro`, so production exposure is broad once pages are pushed.

### Page Integration

Status:

- `/portfolio`: product page + readback summary + Portfolio form.
- `/fcn`: education page + readback summary + FCN Wizard.
- `/risk`: product page + readback summary.
- `/pro`: product page + compact Pro data readiness readback.

Risk:

- The release is no longer API-only. It visibly changes public Pro/Portfolio/FCN/Risk surfaces.
- Without migrations, users may see readback unavailable states on multiple pages.
- No Stock / Crypto form exists yet, so Stock/Crypto readiness is API/data only.

## 5. Product Readiness

| Area | Completion | Production readiness | Biggest blocker |
| --- | ---: | ---: | --- |
| Portfolio Input | 80% | 55% | Requires migration 009 + authenticated staging CRUD test + mobile visual QA |
| FCN Input | 70% | 45% | Requires migrations 009/010 + FCN create-with-underlyings validation + mobile wizard QA |
| Stock / Crypto Input | 45% | 25% | API/data only; no user-facing forms; requires migration 011 + API tests |
| Dashboard Readback | 65% | 40% | Requires all 009/010/011; broad page exposure; no staging data validation yet |
| Overall v1.80/v1.81 release | 65% | 35% | Schema not applied, no staging validation, no build/test evidence in this mixed working tree |

Interpretation:

- The foundation is directionally coherent.
- It is not ready for direct production push.
- The minimum safe next step is staging validation, not more feature work.

## 6. Go / No-Go

Direct push:

- No-Go.

Reasons:

- v1.80 / v1.81 is uncommitted and mixed across migrations, API, helpers, UI, and docs.
- Production Supabase may not have migrations 009 / 010 / 011.
- The readback component is inserted into multiple public/product pages and will call tables that may not exist.
- No staging CRUD/API/browser validation is recorded after the current dirty working tree.

Must apply Supabase migrations before production?

- Yes, before enabling the API/readback/UI in production.
- At minimum, staging must apply 009 / 010 / 011 first.

Should this become a staging branch?

- Yes.
- Use a dedicated release branch for v1.80/v1.81 stabilization.

Should we push docs only first?

- Yes, if the goal is to preserve audit/governance without exposing unfinished schema-dependent features.

Can we proceed to next implementation?

- No, not yet.
- First stabilize and validate the existing foundation.

## 7. Recommended Next Steps

Minimum safe route:

1. Create a release/staging branch for the current v1.80/v1.81 work.
2. Separate Social Pack docs/governance from Portfolio-FCN feature work if they are still mixed in the same working tree.
3. Run `git diff --check`.
4. Run a build only after deciding whether the mixed working tree is intended to be built as one release.
5. Apply migrations 009 / 010 / 011 to staging Supabase only.
6. Run read-only migration verification queries for tables, RLS, indexes, and policies.
7. Run authenticated staging API tests:
   - Portfolio create/list/get/update/archive.
   - FCN create with underlyings/list/get/archive.
   - Stock create/list/get/archive.
   - Crypto create grid / dual/list/get/archive.
   - Dashboard readback counts.
   - Ownership isolation: User B cannot read/update/delete User A data.
8. Run UI smoke on staging/local with a real Supabase session:
   - `/portfolio`: empty state, create Portfolio, readback update.
   - `/fcn`: no portfolio state, create FCN with underlyings, readback update.
   - `/risk`: readback risk awareness.
   - `/pro`: Pro data readiness block.
   - 390px mobile check for Portfolio form and FCN wizard.
9. Only after staging passes, decide whether to release:
   - v1.80.2-v1.80.5 data/API/readback first.
   - v1.81.1-v1.81.2 UI forms second.

Recommended release split:

- Release A: migrations + API + server helpers + types + dashboard API, behind staging validation.
- Release B: Portfolio form + FCN wizard + page readback surfaces, after Release A is proven.

## 8. Audit Conclusion

Go / No-Go:

- `Conditionally Ready for Staging`
- `No-Go for Production`

The work is coherent and mostly scoped correctly, but it is schema-dependent and not yet verified against staging Supabase. The highest-risk production failure is not logic corruption; it is runtime table absence or incomplete migration rollout causing readback/API failures across `/portfolio`, `/fcn`, `/risk`, and `/pro`.

Next recommended action:

- Freeze new v1.81 implementation.
- Prepare a staging validation branch.
- Apply migrations 009 / 010 / 011 only to staging.
- Run API ownership and UI smoke tests before any production push.

# Portfolio / FCN Staging Validation Plan — 2026-06-09

This document defines the staging validation plan for v1.80 / v1.81 Portfolio-FCN Foundation work.

Scope:

- v1.80.2 Portfolio CRUD
- v1.80.3 FCN Input
- v1.80.4 Stock / Crypto Input
- v1.80.5 Dashboard Readback
- v1.81.1 Portfolio Form
- v1.81.2 FCN Wizard

This plan does not authorize production deployment. It is a staging-only release readiness gate.

## 1. Release Strategy

Do not push directly to `main`.

Recommended branch:

```text
staging/v1.80-v1.81-portfolio-fcn
```

Branch contents should include only v1.80 / v1.81 Portfolio-FCN files:

- `supabase/migrations/009_portfolio_foundation.sql`
- `supabase/migrations/010_fcn_position_foundation.sql`
- `supabase/migrations/011_stock_crypto_position_foundation.sql`
- `app/api/portfolio/**`
- `app/api/fcn/**`
- `app/api/stocks/**`
- `app/api/crypto/**`
- `src/lib/portfolio/**`
- `src/lib/fcn/**`
- `src/lib/stock/**`
- `src/lib/crypto/**`
- `src/lib/positions/**`
- `src/types/portfolio.ts`
- `src/types/fcn-position.ts`
- `src/types/stock-position.ts`
- `src/types/crypto-position.ts`
- `components/portfolio/**`
- `components/fcn/**`
- `app/portfolio/page.tsx`
- `app/fcn/page.tsx`
- `app/risk/page.tsx`
- `app/pro/page.tsx`
- v1.80 / v1.81 docs.

Do not include:

- Social Pack code or hotfixes.
- v1.82 / v1.83 Social Pack stabilization changes.
- Auth / SSO changes.
- Stripe, broker, App Store, or unrelated UI work.

Before staging branch:

1. Confirm `main` and `origin/main` are synchronized.
2. Review `git status -sb`.
3. Separate unrelated docs or Social Pack changes from the v1.80/v1.81 branch.
4. Stage only the intended v1.80/v1.81 files.
5. Keep production deploy disabled until staging validation passes.

## 2. Migration Plan

Run migrations only in staging Supabase first.

Migration order:

1. `009_portfolio_foundation.sql`
2. `010_fcn_position_foundation.sql`
3. `011_stock_crypto_position_foundation.sql`

### 009 Portfolio Foundation

Expected table:

- `public.portfolios`

Validate:

- table exists
- `id`, `user_id`, `name`, `base_currency`, `description`, `status`, `created_at`, `updated_at`
- FK: `user_id → auth.users(id)`
- checks: active / archived status, USD / TWD / USDT base currency
- indexes: user_id, status, created_at, user/status/created_at
- RLS enabled
- owner-only select / insert / update / delete policies
- anon revoked

### 010 FCN Position Foundation

Expected tables:

- `public.fcn_positions`
- `public.fcn_underlyings`

Validate:

- tables exist
- `fcn_positions.portfolio_id → public.portfolios(id)`
- `fcn_underlyings.fcn_position_id → public.fcn_positions(id)`
- status / currency / JSON / numeric checks exist
- indexes exist for user_id, portfolio_id, status, maturity_date, fcn_position_id, symbol
- RLS enabled on both tables
- owner-only select / insert / update / delete policies
- insert/update policies prevent attaching FCN or underlyings across users
- anon revoked

### 011 Stock / Crypto Position Foundation

Expected tables:

- `public.stock_positions`
- `public.crypto_positions`

Validate:

- tables exist
- both tables reference `public.portfolios(id)`
- stock market / currency / position_type / status checks exist
- crypto currency / position_type / strategy_type / status checks exist
- grid / dual fields exist
- indexes exist for user_id, portfolio_id, symbol, status, market / exchange, created_at
- RLS enabled on both tables
- insert/update policies prevent cross-user portfolio attachment
- anon revoked

### Rollback / Reset Strategy

Preferred staging rollback:

- Use a disposable staging Supabase project or staging database snapshot.
- If validation fails, reset staging from the pre-migration snapshot.

Fallback rollback if snapshot reset is unavailable:

- Do not apply destructive SQL without approval.
- Prepare a reviewed rollback script only for staging.
- Rollback order should reverse dependencies:
  1. drop `crypto_positions`
  2. drop `stock_positions`
  3. drop `fcn_underlyings`
  4. drop `fcn_positions`
  5. drop `portfolios`

Production migration:

- Requires separate approval.
- Requires backup.
- Requires staging pass evidence.
- Must not be bundled with unrelated feature or Social Pack changes.

## 3. API Test Plan

All API tests must use staging Supabase and authenticated Supabase access tokens.

Required actors:

- User A
- User B
- unauthenticated request

### Portfolio CRUD

Required tests:

- `POST /api/portfolio`
- `GET /api/portfolio`
- `GET /api/portfolio/[id]`
- `PATCH /api/portfolio/[id]`
- `DELETE /api/portfolio/[id]`

Expected:

- create returns 201
- list returns only User A portfolios
- detail returns owner-owned portfolio
- update changes name / baseCurrency / description
- delete soft archives with `status = archived`
- archived portfolio excluded from default list

### FCN CRUD

Required tests:

- `POST /api/fcn` with underlyings
- `GET /api/fcn`
- `GET /api/fcn?portfolioId=...`
- `GET /api/fcn/[id]`
- `PATCH /api/fcn/[id]`
- `DELETE /api/fcn/[id]`

Expected:

- create returns FCN position and underlyings
- underlyings are readable on list/detail
- list by portfolioId works
- update patches FCN main table
- delete soft archives with `status = archived`
- archived FCN excluded from active readback

### Stock CRUD

Required tests:

- `POST /api/stocks`
- `GET /api/stocks`
- `GET /api/stocks?portfolioId=...`
- `GET /api/stocks/[id]`
- `PATCH /api/stocks/[id]`
- `DELETE /api/stocks/[id]`

Expected:

- create returns stock position
- list by portfolioId works
- update changes quantity / averageCost / currentPrice
- delete soft archives with `status = archived`
- archived stock excluded from dashboard active summary

### Crypto CRUD

Required tests:

- `POST /api/crypto` spot
- `POST /api/crypto` grid
- `POST /api/crypto` dual
- `GET /api/crypto`
- `GET /api/crypto?portfolioId=...`
- `GET /api/crypto/[id]`
- `PATCH /api/crypto/[id]`
- `DELETE /api/crypto/[id]`

Expected:

- spot / grid / dual records persist expected fields
- grid fields are readable
- dual fields are readable
- delete soft archives with `status = archived`
- archived crypto excluded from dashboard active summary

### Portfolio Dashboard Readback

Required test:

- `GET /api/portfolio/dashboard`

Expected:

- `portfolioCount`
- `fcnCount`
- `stockCount`
- `cryptoCount`
- `fcnUnderlyingCount`
- `cryptoGridCount`
- `cryptoDualCount`
- `totalNotionalApprox`
- `incompleteValuationCount`
- `highLevelRiskStatus`

Dashboard should use stored fields only. It must not call AI, news, live quote providers, broker APIs, or Legacy Pro backend.

### Isolation / Error Tests

Required tests:

- unauthenticated request to each route returns 401
- invalid payload returns 400
- invalid UUID or missing owner-owned id returns 404
- User B cannot get / patch / delete User A portfolio
- User B cannot create FCN / stock / crypto under User A portfolio
- User B cannot read User A FCN underlyings
- cross-user access returns 404 or 403, never another user's data

## 4. UI Test Plan

Run UI tests only after staging migrations and API CRUD pass.

### `/portfolio`

Required:

- unauthenticated state does not crash
- authenticated fresh user sees empty state
- create Portfolio through the form
- success message appears
- form resets
- `router.refresh()` / readback update occurs
- readback summary shows portfolio count
- no investment advice language

### `/fcn`

Required:

- unauthenticated state does not crash
- no portfolio state tells user to create Portfolio first
- portfolio selector lists active portfolios
- FCN Wizard creates FCN with at least one underlying
- underlyings persist
- success message appears
- readback summary updates FCN count and underlying count
- no KI / KO real-time calculation is implied
- no product recommendation language

### Asset Input

Required:

- no full Stock / Crypto input UI is expected in v1.81.2.
- Stock / Crypto should be tested through API only unless future UI is added.
- The phrase "新增 asset" in staging QA should mean either:
  - create Portfolio through UI, then FCN through Wizard; or
  - create Stock / Crypto through API and confirm dashboard readback.

### `/risk`

Required:

- page loads
- readback summary does not crash
- risk status is clear / watch / elevated
- copy remains risk awareness, not prediction or advice

### `/pro`

Required:

- page loads
- Pro SSO CTA remains unchanged
- readback block does not crash
- Pro data readiness copy does not imply paid Pro access or broker integration

### Mobile QA

Required:

- 390px viewport
- no horizontal overflow
- Portfolio Form fields stack correctly
- FCN Wizard steps wrap or stack safely
- Add / Remove Underlying buttons remain tappable
- schedule rows remain readable
- Review step remains readable
- success / error messages do not overflow

## 5. Go / No-Go Gate

Production can be considered only if all conditions pass:

- staging migrations 009 / 010 / 011 pass
- tables / indexes / RLS / ownership policies verified
- authenticated API CRUD pass
- User A / User B isolation pass
- unauthenticated 401 behavior pass
- invalid payload 400 behavior pass
- cross-user access 404 / 403 behavior pass
- `/api/portfolio/dashboard` readback pass
- `/portfolio` UI smoke pass
- `/fcn` FCN Wizard smoke pass
- `/risk` readback smoke pass
- `/pro` readback smoke pass
- 390px mobile QA pass
- `npm run lint` pass
- `npm run build` pass
- `git diff --check` pass
- release commit contains no unrelated dirty files
- release branch contains no Social Pack / auth / SSO / Stripe / broker changes

No-Go if any of the following occur:

- migration fails
- RLS allows cross-user reads or writes
- API returns another user's data
- dashboard fails when valid staging tables exist
- UI crashes for unauthenticated or empty state
- mobile overflow appears on Portfolio Form or FCN Wizard
- release branch contains unrelated Social Pack or auth changes

## 6. Do Not Do

Do not:

- touch Weekly / Social Pack
- touch auth / SSO
- touch Stripe
- touch App Store preparation
- touch broker integration
- touch production Supabase
- run production migrations
- connect live prices
- add AI monitoring
- add trading language
- add individualized advice language
- mix v1.80/v1.81 with v1.82/v1.83 Social Pack changes
- push to `main` before staging validation passes

## 7. Recommended Validation Order

1. Cleanly isolate v1.80/v1.81 files onto `staging/v1.80-v1.81-portfolio-fcn`.
2. Confirm release branch contains no Social Pack/auth/SSO changes.
3. Run `git diff --check`.
4. Run `npm run lint`.
5. Run `npm run build`.
6. Apply 009 / 010 / 011 to staging Supabase.
7. Verify tables, indexes, RLS, policies, and grants.
8. Run authenticated API CRUD tests.
9. Run User A / User B ownership isolation tests.
10. Run dashboard readback test.
11. Run UI smoke tests.
12. Run 390px mobile QA.
13. Review release diff and decide Go / No-Go.

## 8. Implementation / Staging Branch Decision

This plan supports entering a staging branch, not production implementation expansion.

Recommended next action:

- Create a dedicated staging branch only after deciding how to separate existing dirty docs and product files.
- Validate the current foundation before adding Stock / Crypto forms, AI Monitoring, Risk Engine, or Pro dashboard expansion.

Current readiness:

- Ready to enter staging validation.
- Not ready for production push.

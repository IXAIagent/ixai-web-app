# Portfolio / FCN Release Review v1.81

Date: 2026-06-09

## Summary

v1.80 / v1.81 moves IXAI App from a public intelligence and account surface into the first real personal-data workflow. Users can now create Portfolio containers, create FCN positions with underlyings, and read the resulting data back through Portfolio, FCN, Risk, and Pro surfaces.

This release is not a trading product, not a broker integration, not Stripe billing, and not personalized investment advice. It establishes the production persistence contracts for future FCN Risk Engine, Portfolio Intelligence, and SaaS membership gating.

## Branch / PR / Commit

- Branch: `staging/v1.80-v1.81-portfolio-fcn`
- PR: `feat: portfolio foundation and fcn foundation v1.80 v1.81`
- PR status: merged into `main`
- Production deployment: Vercel Ready
- Production domain: `https://app.ixuan.ai`
- Release commit reference available from GitHub / Vercel deployment history for the merged PR.

## Supabase Staging Validation

Staging validation passed before production release:

- Migration validation: PASS
- Lint: PASS
- Build: PASS
- Static API audit: PASS
- Authenticated CRUD: PASS
- User A / User B ownership isolation: PASS
- Unauthenticated request behavior: PASS, private APIs return 401
- Soft archive behavior: PASS
- UI smoke QA: PASS

## Supabase Production Migration

Production Supabase project:

- Project name: `IXAIagent's Project`
- Project ID: `uoyeeojnyswytutmhptk`

Production migrations applied:

- `009_portfolio_foundation.sql`
- `010_fcn_position_foundation.sql`
- `011_stock_crypto_position_foundation.sql`

Production tables confirmed:

- `portfolios`
- `fcn_positions`
- `fcn_underlyings`
- `stock_positions`
- `crypto_positions`

## API Validation

Validated API surfaces:

- `POST /api/portfolio`
- `GET /api/portfolio`
- `GET /api/portfolio/[id]`
- `PATCH /api/portfolio/[id]`
- `DELETE /api/portfolio/[id]`
- `POST /api/fcn`
- `GET /api/fcn`
- `GET /api/fcn/[id]`
- `PATCH /api/fcn/[id]`
- `DELETE /api/fcn/[id]`
- `POST /api/stocks`
- `GET /api/stocks`
- `POST /api/crypto`
- `GET /api/crypto`
- `GET /api/portfolio/dashboard`

The validated contract is authenticated Supabase bearer token → Next API route → Supabase REST/RLS read/write. No service role key is exposed to client code.

## Auth Validation

- App login on staging was validated with clean Supabase publishable key.
- User A and User B could authenticate through Supabase Auth.
- Login failure caused by hidden / non-ASCII key copy was isolated and resolved by using a clean publishable key.
- Access tokens were used only in transient local validation processes and were not written to files.

## Ownership Isolation

Ownership isolation passed:

- User B cannot read User A portfolio by id.
- User B cannot create FCN, Stock, or Crypto records under User A portfolio.
- Cross-user attempts return safe 404 / portfolio not found behavior.
- User B can create and list only User B's own portfolio records.

## UI Smoke QA

Production app.ixuan.ai validation passed:

- Portfolio creation succeeds.
- FCN Wizard can read Portfolio options.
- FCN can attach to Portfolio.
- Risk / Pro readback can display data-layer status.
- Mobile smoke QA passed during staging validation.

## Known Issues

- Clean Supabase publishable key is required. Hidden characters or non-ASCII characters in the key can cause browser header errors such as `String contains non ISO-8859-1 code point`.
- Staging and production Supabase project IDs are different and must never be confused.
- Production DB migration must be applied after Vercel deploy approval and separately confirmed in Table Editor / SQL checks.
- Account/profile personalization tables may be separate from Portfolio / FCN tables; missing profile-memory tables should not be conflated with Portfolio Foundation failures.
- FCN Risk Engine is not implemented yet. FCN creation stores product terms and underlyings; it does not calculate worst-of, KI/KO distance, coupon schedule status, or risk score yet.

## Release Decision

PASS.

v1.80 / v1.81 are accepted as production-complete for Portfolio Foundation and FCN Foundation.

## Next

Recommended next version:

- v1.82 — FCN Risk Engine

Initial scope:

- Worst-of
- Distance to KI
- Distance to KO
- Strike distance
- Observation calendar
- Coupon calendar
- FCN risk score
- Monitoring / risk-awareness output only, not personalized product advice

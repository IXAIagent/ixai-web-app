# IXAI Pro Dashboard Audit v1.17.5

Date: 2026-05-21

Scope: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/frontend/ixai-website-clean`

This audit reviews the IXAI Pro Dashboard as the Pro AI Wealth OS side of the ecosystem before PWA work begins.

## Executive Assessment

The Pro Dashboard has the right functional direction: portfolio workspace, FCN monitoring, intelligence panels, alerts, accounts, settings, imports, and market views. It feels closer to an internal risk console than a public product, which is appropriate for Pro, but several launch-quality gaps remain.

The most important issue is production environment readiness. The dashboard depends on a backend API base and localStorage bearer token session model. That is acceptable for a controlled MVP, but it must be formalized before broader public onboarding.

## Critical Issues

### 1. Production Runtime Depends on `NEXT_PUBLIC_API_BASE_URL`

`app/lib/api.ts` throws in production if `NEXT_PUBLIC_API_BASE_URL` is missing when API calls are made.

Risk:

- Build can pass, but production runtime can fail immediately after login or page load.
- Deployments may appear healthy while user workflows break.

Recommendation:

- Add deployment checklist and Vercel env verification.
- Consider a visible "backend unavailable" app state rather than runtime throw for non-critical pages.

### 2. Auth Uses Client-Side localStorage Bearer Token

The Pro Dashboard stores `ixai_token` in localStorage and attaches it to API requests.

Risk:

- Any XSS would expose the token.
- No shared identity strategy yet.
- PWA/offline storage increases the importance of token handling.

Recommendation:

- Treat current auth as MVP.
- Future shared auth should use secure cookies or a managed auth flow with server-side session checks.
- Avoid caching sensitive Pro responses in service workers until auth is hardened.

### 3. Production Metadata Still Looks Like Starter App

Browser title for dashboard routes is still `Create Next App`.

Risk:

- Reduces trust.
- Hurts sharing/bookmarking.
- Makes Pro feel less production-ready than the Public App.

Recommendation:

- Add layout metadata for IXAI Pro.
- Add favicon/app icon/social preview alignment with the Public App brand.

## Medium Issues

### 1. Pro UX Still Feels Technical / Internal

The dashboard uses terminal density and many backend-shaped labels: account context, safe placeholders, engine summary, workspace context, health, database readiness.

Risk:

- Power users may appreciate it, but non-technical premium users may find it too internal.

Recommendation:

- Keep terminal style, but translate more labels into user-facing risk/workflow language.
- Add short "what should I look at first" guidance on dashboard and intelligence pages.

### 2. Sidebar Navigation Is Dense

Pro sidebar includes dashboard, portfolio, FCN, intelligence, market, alerts, input, import, accounts, settings.

Risk:

- The information architecture is powerful but cognitively heavy.

Recommendation:

- Group navigation into "Monitor", "Manage", "System" sections later.
- Keep current layout for now to avoid redesign churn.

### 3. Existing Lint Warnings

Lint passes with warnings in:

- `app/alerts/page.tsx`
- `app/input/page.tsx`
- `app/market/page.tsx`

Risk:

- Hook dependency warnings can hide stale data bugs.

Recommendation:

- Fix before PWA because stale hooks plus offline caching are hard to debug.

### 4. Public Bridge Is Present But New

The v1.15/v1.17 bridge now exists in AppShell, settings, and accounts.

Risk:

- It is visible enough, but not yet tied to real shared account state.

Recommendation:

- Keep copy as future-facing.
- Avoid implying Watchlist sync is already live.

## Low-Priority Issues

- Pro Dashboard lacks manifest/PWA assets.
- Some pages still mix English and Traditional Chinese inconsistently.
- The `/login` and `/register` UX was not deeply redesigned in this audit.
- Pro metadata/social preview should be brought up to Public App standard.

## UX Audit

### Strengths

- Dashboard feels like a real monitoring workspace.
- FCN and portfolio surfaces support the "AI Wealth OS" positioning.
- High-density layout fits desktop Pro workflows.
- Public Intelligence bridge reinforces ecosystem continuity.

### Concerns

- Some panels still read like backend diagnostics rather than user workflow.
- Mobile/tablet navigation is functional but dense.
- Settings page mixes product settings, system health, data sources, and compliance. This is useful internally but may overwhelm early users.

## Architecture Audit

### Strengths

- API access is centralized in `app/lib/api.ts`.
- Preferences and workspace context are isolated helpers.
- Client-side app shell is consistent across routes.

### Concerns

- `app/lib/api.ts` is very large and mixes types, fetch behavior, cache, auth token, and endpoint wrappers.
- The Pro Dashboard and Public App now duplicate ecosystem/identity config in separate files.
- Account/portfolio context is client-local and not yet a shared identity boundary.

## Security / Production Notes

- Do not cache authenticated Pro API responses in a future service worker until session strategy is changed.
- Backend env must be verified before deployment.
- Current localStorage token should be treated as MVP only.
- Pro Dashboard should get route-level metadata and possibly robots rules depending on launch plan.

## Performance Notes

- The dependency surface is small.
- Client pages fetch multiple backend endpoints concurrently.
- In-memory client cache TTL is short and simple.
- PWA work needs route-specific cache rules to avoid stale risk/portfolio data.

## Recommended Fix Order

1. Add Pro metadata/app icon/social preview.
2. Verify and document `NEXT_PUBLIC_API_BASE_URL` for production.
3. Fix existing hook dependency warnings.
4. Group sidebar navigation or add top-priority guidance.
5. Split `app/lib/api.ts` into API client, types, auth/session, and endpoint modules when the codebase grows further.

## Production Readiness

Status: Strong internal MVP / early Pro workspace, not yet polished production SaaS.

The Pro Dashboard can support controlled demos and internal Pro workflows. Before broad commercial use, it needs stronger auth/session handling, metadata polish, env verification, and a pass to reduce backend/internal terminology.

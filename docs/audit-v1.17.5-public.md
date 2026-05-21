# IXAI Public App Audit v1.17.5

Date: 2026-05-21

Scope: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app`

This audit reviews the IXAI Public Intelligence Layer before PWA work. It does not implement PWA, payment, shared auth, broker integration, or a redesign.

## Executive Assessment

The Public App has a strong product foundation: Daily Brief, Weekly Brief, Market, Watchlist, FCN education, Pro bridge, metadata, social preview, and shared identity language all point toward a coherent Public → Pro ecosystem.

The largest risks before public launch and PWA work are not visual. They are operational and security-related:

- Admin protection is still an MVP and should not be treated as production-grade authentication.
- Daily intelligence publish state is not durable across real serverless/runtime environments.
- Public dynamic data layers use safe fallbacks, but mock/fallback visibility must remain explicit.
- Several client-side personalization flows use localStorage and are PWA-friendly, but need a clearer synchronization model before offline work.

## Critical Issues

### 1. Admin Draft API Uses a Client-Visible Hash

The admin gate passes a password hash to the client and the draft API accepts `x-ixai-admin-hash`. This is safer than hardcoding the password, but the hash effectively becomes a bearer token once delivered to the browser.

Risk:

- Anyone who can load the admin route response may be able to reuse the hash as API authorization.
- This is not suitable for a production editorial console.

Recommendation:

- Before serious public sharing, replace the MVP admin gate with server-side auth.
- Minimum next step: signed, short-lived, HTTP-only admin session cookie.
- Preferred future: Supabase Auth with admin role/RLS or a separate protected admin app.

### 2. Published Daily Intelligence Is Not Durable Enough

`src/lib/editorial/repository.ts` uses localStorage on the client and an in-memory `serverDrafts` array on the server. This works for local MVP demos, but serverless functions and redeploys can lose memory.

Risk:

- Scheduled generation and publish flow may not persist reliably in Vercel production.
- Different serverless regions/invocations can see different draft state.
- PWA offline caching would cache a state that may not reflect durable backend truth.

Recommendation:

- Move Daily Brief drafts and published briefs to Supabase before relying on scheduled production operations.
- Keep static fallback as editorial backup only.

### 3. Admin Content May Be Partially Server-Rendered Before Client Gate

The admin layout wraps children in a client-side gate. While the UI blocks access, server-rendered output and RSC payload behavior should be reviewed carefully.

Risk:

- Sensitive admin data could appear in route payloads before client-side unlock.
- Browser logs previously showed an admin hydration mismatch from an older session, suggesting gate/content rendering states can diverge.

Recommendation:

- Move authorization checks to server-side route boundaries.
- Ensure admin pages do not render draft content unless the server has validated access.

## Medium Issues

### 1. Shared Identity Is Copy-Ready, Not Data-Ready

The shared identity layer is intentionally a placeholder. It standardizes language but does not provide real continuity.

Risk:

- Users may expect cross-app sync sooner than it exists.

Recommendation:

- Keep wording forward-looking.
- Add real shared identity only after choosing the final auth provider/domain strategy.

### 2. Client-Side Market Fetches Are Repeated Across Widgets

Market Pulse, Market Overview, Dashboard Watchlist, and Watchlist Manager all fetch quotes client-side.

Risk:

- Multiple widgets can create duplicate `/api/market/quotes` requests.
- Mobile/PWA usage may hit providers more often than needed.

Recommendation:

- Introduce a lightweight quote client hook/cache or SWR-like pattern before PWA.
- Keep server quote provider cache.

### 3. Homepage Is Dynamic Because FCN Snapshot Is Server-Fetched

`app/page.tsx` uses `force-dynamic` and fetches FCN snapshot for Pro surface data.

Risk:

- Public homepage becomes tied to runtime quote/provider behavior.
- PWA pre-cache strategy becomes less straightforward.

Recommendation:

- Consider splitting FCN Pro preview into client-side progressive enhancement.
- Keep the first paint static where possible.

### 4. Public App Has Two Pro Destinations

`/pro` is an in-app education/preview page, while primary IXAI Pro CTA now goes to the external Pro Dashboard.

Risk:

- Some users may wonder whether `/pro` or the external dashboard is "the real Pro."

Recommendation:

- Keep `/pro` as "What is IXAI Pro".
- Use "進入 IXAI Pro Dashboard" consistently for the external destination.

## Low-Priority Issues

- Some English/Chinese mixed labels are intentional, but should be periodically reviewed for tone consistency.
- `/ixai` remains a product education page and overlaps mildly with `/pro`.
- OG/social preview exists for the Public App; Pro Dashboard still needs production metadata/social image.

## UX Audit

### Strengths

- New users can understand the core: free market intelligence → personal watchlist → IXAI Pro monitoring.
- Daily Brief and Weekly Brief support editorial trust.
- FCN page now educates before showing risk preview, which reduces "fake tool" feeling.
- Contact and Pro bridge CTAs are live and coherent.

### Concerns

- `/account` still explains future behavior more than current behavior. It is acceptable for now, but real sync should follow soon.
- Watchlist has real quotes but still lacks alerting or saved intelligence output.
- Admin terminology must stay hidden from public routes.

## Security / Production Notes

- `OPENAI_API_KEY` is only used server-side. No direct client exposure found.
- Supabase anon env values are optional-safe.
- `IXAI_ADMIN_PASSWORD` missing in production locks admin UI, but the password-gate model remains MVP.
- Cron route uses a secret token and handles missing env safely.
- Public API routes are intentionally public; `/api/news/latest` and `/api/market/quotes` should keep rate/fallback controls.

## Performance Notes

- OG image is lightweight and local.
- No chart library or heavy dependency footprint.
- Client-heavy widgets are manageable now, but quote/news data should be consolidated before installable PWA usage.
- Public App dependency surface is small: Next, React, Tailwind.

## Recommended Fix Order

1. Replace admin MVP gate with server-side admin auth/session.
2. Persist editorial drafts/published briefs in Supabase.
3. Add quote/news request consolidation for public widgets.
4. Clarify `/pro` vs external Pro Dashboard wording.
5. Add PWA only after durable content and auth boundaries are clear.

## Production Readiness

Status: Good public preview readiness, not full production CMS readiness.

The app is suitable for controlled public sharing as a Public Intelligence Layer if admin routes are protected via environment configuration. It should not yet be treated as a durable production editorial CMS until admin auth and published content persistence are upgraded.

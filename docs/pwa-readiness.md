# IXAI PWA Readiness Audit

Date: 2026-05-21

Scope:

- Public App: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app`
- Pro Dashboard: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/frontend/ixai-website-clean`

PWA implementation has not started. This document identifies blockers and recommended approach.

## Current PWA Readiness

### Public App

Ready:

- Has `app/manifest.ts`.
- Has favicon, app icon, apple touch icon.
- Has local Open Graph image.
- Has mobile bottom navigation and app-shell style structure.
- Has local-first Watchlist and preferences.

Not ready:

- No service worker.
- No offline route strategy.
- Daily Intelligence publish state is not durable backend state.
- Admin/editorial routes should not be cached.
- Market/news API responses need clear cache rules.

### Pro Dashboard

Ready:

- Has a consistent AppShell.
- Has mobile sticky top nav and horizontal nav.
- Has centralized API client.

Not ready:

- No manifest.
- No app icons/social preview alignment.
- Auth token is in localStorage.
- Many routes depend on live authenticated backend data.
- No offline-safe state model for portfolio/FCN/risk data.

## PWA Blockers

### Blocker 1. Admin and Auth Boundaries

Do not add a broad service worker cache while admin and Pro auth remain MVP.

Risk:

- Sensitive admin or Pro API responses could be cached incorrectly.
- Offline state could reveal stale private data.

Requirement:

- Explicitly exclude `/admin`, `/api/admin/*`, Pro authenticated API calls, and login/register routes from any pre-cache/runtime cache.
- Keep the v1.18 httpOnly admin session cookie out of service-worker cache logic.

### Blocker 2. Published Content Durability

Public Daily Intelligence has a Supabase-backed persistence path as of v1.18.1.

Remaining risk:

- Production must apply `supabase/migrations/002_daily_intelligence_persistence.sql`.
- Production must configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` for admin writes.
- Until verified in production, the fallback path can still serve local/server-memory state.

Requirement:

- Confirm Supabase is the source of truth before enabling offline Daily Brief caching.

### Blocker 3. Pro Token Strategy

Pro uses localStorage bearer token.

Risk:

- Service worker caching and localStorage token patterns can create privacy/security concerns.

Requirement:

- Keep Pro Dashboard out of PWA install/offline scope until session strategy is upgraded.

## Recommended PWA Strategy

### Phase 1: Public App Installability Only

Implement only:

- manifest verification
- icon coverage
- installable app shell
- no offline data cache yet
- no service worker or a minimal no-cache service worker if required

Cache:

- static assets
- app shell CSS/JS via Next/Vercel default caching

Do not cache:

- `/admin`
- `/api/admin/*`
- `/api/news/latest`
- `/api/market/quotes`
- `/daily-brief` dynamic published state until persistence is durable

### Phase 2: Public Offline Reading

Only after durable published briefs:

- cache latest Daily Brief
- cache Weekly Brief archive/detail
- cache About/Pro/FCN education pages

Use stale-while-revalidate for public editorial content.

### Phase 3: Personal Data Sync

Only after shared identity:

- cache user watchlist locally
- queue watchlist updates while offline
- sync after reconnect

### Phase 4: Pro Dashboard PWA

Only after auth/session hardening:

- do not cache private Pro API responses by default
- allow explicit user-controlled offline snapshots if needed
- never cache tokens or sensitive headers

## Route Cache Feasibility

Safe candidates later:

- `/about`
- `/pro`
- `/fcn` education shell
- `/weekly-brief`
- static weekly detail pages
- published daily detail pages after durable backend state

Unsafe candidates:

- `/admin`
- `/admin/daily-briefs`
- `/api/admin/*`
- Pro `/portfolio`
- Pro `/fcn`
- Pro `/intelligence`
- Pro `/alerts`
- Pro authenticated API responses

## Mobile Readiness Notes

Public App:

- Mobile bottom nav is suitable for app-like usage.
- Homepage density is acceptable.
- Watchlist and Daily Brief are good first PWA routes.

Pro Dashboard:

- Mobile nav exists, but the product is still desktop-first.
- Tables and dense intelligence panels should be audited route-by-route before mobile PWA positioning.

## Manifest / Icon Gaps

Public App:

- Good baseline.
- Consider adding maskable icon later.

Pro Dashboard:

- Add manifest.
- Add icon/apple-icon.
- Add metadata title/description.
- Align with IXAI ecosystem branding while preserving Pro terminal feel.

## Recommended Order Before PWA

1. Fix Public admin security boundary.
2. Verify Supabase Daily Intelligence persistence in production.
3. Add route-level PWA cache policy document.
4. Implement Public installability only.
5. Add offline editorial cache later.
6. Revisit Pro Dashboard after token/session strategy is hardened.

## PWA Readiness Assessment

Public App: close to installable; Daily Intelligence has a durable persistence path but needs production Supabase verification before offline intelligence cache.

Pro Dashboard: not PWA-ready yet because auth and private data caching need stronger boundaries.

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
- Has favicon, app icon, apple touch icon, 192/512 PWA icons, and a maskable icon generated from `public/logo/ixuan-logo.png`.
- Has local Open Graph image.
- Has mobile bottom navigation and app-shell style structure.
- Has local-first Watchlist and preferences.

Ready as of v1.19:

- Minimal service worker foundation exists for installability.
- Service worker caches only static app assets, icons, manifest, and Next build assets.
- Global offline status copy warns that market data and latest briefs may not update while offline.

Still not ready:

- No aggressive offline reading mode.
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

Implemented:

- manifest verification
- icon coverage
- installable app shell
- minimal service worker for static assets only
- no offline market-data cache
- no notification registration

Cache:

- static assets
- app shell CSS/JS build assets
- icons, manifest, logo, Open Graph image

Do not cache:

- `/admin`
- `/admin/*`
- `/api/admin/*`
- `/api/auth/*`
- `/api/news/*`
- `/api/market/*`
- `/api/daily-briefs`
- scheduler / cron / draft / generation / session routes
- unpublished editorial content

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

- Manifest uses `name` / `short_name`: `IXAI`.
- `start_url` and `scope` are `/`.
- `display` is `standalone`.
- Brand colors are aligned to IXAI cream (`#f5f0e6`) and forest (`#09291f`).
- Icons are generated from the official one玄 logo asset:
  - `/icons/ixai-icon-192.png`
  - `/icons/ixai-icon-512.png`
  - `/icons/ixai-maskable-512.png`
- App metadata points to `https://app.ixuan.ai` by default and still allows `NEXT_PUBLIC_SITE_URL` override.

Pro Dashboard:

- Add manifest.
- Add icon/apple-icon.
- Add metadata title/description.
- Align with IXAI ecosystem branding while preserving Pro terminal feel.

## Recommended Order Before PWA

1. Fix Public admin security boundary.
2. Verify Supabase Daily Intelligence persistence in production.
3. Keep service worker scope public-only and exclude admin/API sensitive routes.
4. Validate installability on `https://app.ixuan.ai` with Chrome Lighthouse / Application tab.
5. Add offline editorial cache later only after production Supabase is verified.
6. Revisit Pro Dashboard after token/session strategy is hardened.

## PWA Readiness Assessment

Public App: close to installable; Daily Intelligence has a durable persistence path but needs production Supabase verification before offline intelligence cache.

Pro Dashboard: not PWA-ready yet because auth and private data caching need stronger boundaries.

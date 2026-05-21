# IXAI Public App PWA v1.19

Date: 2026-05-21

Goal: make the IXAI Public App installable at `https://app.ixuan.ai` using an installability-first PWA strategy.

## Installability Status

- App name: `IXAI`
- Short name: `IXAI`
- Start URL: `/`
- Scope: `/`
- Display: `standalone`
- Background color: IXAI cream `#f5f0e6`
- Theme color: IXAI forest `#09291f`
- Manifest route: `/manifest.webmanifest`
- Service worker: `/sw.js`
- Icons:
  - `/icons/ixai-icon-192.png`
  - `/icons/ixai-icon-512.png`
  - `/icons/ixai-maskable-512.png`

## Service Worker Strategy

v1.19 uses a minimal service worker. It exists for installability and static asset resilience, not for a full offline finance app.

Cached:

- `/manifest.webmanifest`
- favicon / app icons / apple icon
- IXAI logo and OG image
- `/_next/static/*` build assets
- `/icons/*`
- `/logo/*`
- `/og/*`

Network-only / excluded:

- `/admin`
- `/admin/*`
- `/api/admin/*`
- `/api/auth/*`
- `/api/market/*`
- `/api/news/*`
- `/api/daily-briefs`
- cron / scheduler / draft / generation / session routes
- service-role-backed admin routes
- unpublished editorial content

## Market Quote Safety

Market quote APIs are network-only in v1.19.

Rules:

- Do not long-term cache live quote API responses.
- Do not present stale quote data as current market data.
- If the app is offline, the global offline banner warns that market data and latest briefs may not update.

## Daily / Weekly Content

v1.19 does not aggressively cache Daily Brief or Weekly Brief HTML for offline reading.

Future option:

- Add network-first caching for published editorial routes after production Supabase persistence is verified.
- Any cached brief should be visibly marked as cached or stale when offline.

## Install UX

Install UX is intentionally low-pressure:

- `/account` shows “安裝 IXAI 到主畫面”.
- Chrome / Edge can use `beforeinstallprompt` when available.
- iOS users receive Safari share-sheet instructions.
- Standalone mode shows a calm confirmation that market updates still require network access.

## Offline Behavior

When offline:

- A low-noise global banner appears.
- The banner says: “目前離線，市場資料與最新簡報可能無法更新。”
- Navigation fallback shows a simple IXAI offline page if a route cannot be loaded.
- Admin and sensitive APIs are not served from cache.

## Notification Readiness

Push notifications are not implemented in v1.19.

Future categories:

- Daily Brief published
- Market risk alert
- FCN risk threshold
- Watchlist movement
- IXAI Pro monitoring alert

Rules:

- Notifications must require explicit user opt-in.
- Do not request notification permission on first launch.
- Notification settings should belong to IXAI Account / Pro preferences.

## App Store / Google Play Path

Not included in v1.19:

- App Store submission
- Google Play submission
- Capacitor / native wrapper
- Push notification backend
- Offline sync queue

Recommended next path:

1. Validate PWA installability on `https://app.ixuan.ai`.
2. Run Lighthouse PWA audit.
3. Add route-specific offline editorial cache only after production data persistence is verified.
4. Consider app-store wrappers only after shared identity and Pro workflows are stable.

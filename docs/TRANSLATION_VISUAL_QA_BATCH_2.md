# Translation Visual QA Batch 2

QA date: 2026-07-01

Environment: production `https://app.ixuan.ai`

Authenticated visual audit completed: no

Reason: the available production browser session was not authenticated. Direct navigation to every `/my-ixai/*` route rendered the public account/login gate instead of the signed-in Workspace page. This batch does not claim authenticated Workspace visual QA completion.

## Locale Tested

- `zh-TW`: checked on production public routes and unauthenticated Workspace gates.
- `en-US`: checked on production public routes.
- `ja-JP`: checked on production public routes.

Important ja-JP status:

- `ja-JP` is currently metadata-supported but not content-covered.
- The selector can be changed to `ja-JP`, but visible content falls back mostly to `en-US` dictionary labels plus authored Traditional Chinese content.
- Full Japanese content coverage remains pending.

## Routes Scanned

Authenticated Workspace routes attempted, but all rendered the unauthenticated gate:

- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/input`
- `/my-ixai/input/stock`
- `/my-ixai/input/crypto`
- `/my-ixai/input/fcn`
- `/my-ixai/watchlist`
- `/my-ixai/notifications`
- `/my-ixai/timeline`
- `/my-ixai/copilot`
- `/my-ixai/health`
- `/my-ixai/beta`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/intelligence`
- `/my-ixai/settings`

Public routes scanned and scrolled:

- `/`
- `/pro`
- `/daily-brief`
- `/weekly-brief`
- `/fcn`
- `/market`
- `/about`

## Browser Evidence Summary

- Production browser session: not signed in.
- Workspace route result: every `/my-ixai/*` route showed `建立你的 IXAI intelligence workspace。`
- Workspace route console errors: 0 observed during attempted gate scans.
- Public route console errors: 0 observed across `zh-TW`, `en-US`, and `ja-JP` scans.
- Page errors: 0 observed.
- Hydration mismatch: not observed.
- Runtime fatal error: not observed.
- `/market` rendered the public account/login gate instead of a market content page in the unauthenticated production session.

## Translation Findings By Route

| Route | Locale | Issue | Priority | Status | Likely file/component |
| --- | --- | --- | --- | --- | --- |
| `/my-ixai/fcn` | `zh-TW` | Known FCN risk labels such as `Worst-of Performance`, `Nearest KI Distance`, `Nearest Strike Distance`, `KO Status`, `UNKNOWN`, `UNAVAILABLE`, `Not KO ready / unavailable`, `Current UNKNOWN`, `Initial`, `Performance`, `KI Distance`, `Strike Distance`, source status, and warning messages needed UI display mapping. | High | Fixed by source-level display mapping; authenticated production visual verification pending. | `components/fcn/fcn-risk-summary.tsx`, `components/fcn/fcn-center-workspace.tsx`, `src/lib/i18n/dictionaries.ts` |
| `/my-ixai/risk` | `zh-TW` | Authenticated content could not be visually inspected because the session was unauthenticated. Batch 1 source audit still lists Risk Center deep labels as high-impact remaining work. | High | Remaining | `components/risk/*` |
| `/my-ixai/intelligence` | `zh-TW` | Authenticated content could not be visually inspected because the session was unauthenticated. Batch 1 source audit still lists Intelligence Center status and metric labels as high-impact remaining work. | High | Remaining | `components/intelligence/*` |
| `/my-ixai/portfolio` | `zh-TW` | Authenticated content could not be visually inspected because the session was unauthenticated. Batch 1 had already repaired primary Portfolio readback labels, but production visual verification remains pending. | High | Pending visual verification | `components/portfolio/*` |
| `/` | `en-US` | Public shell switches to English, but long-form landing content remains mostly Traditional Chinese. | Medium | Remaining | Public landing content |
| `/pro` | `en-US` | Navigation shell switches to English, but long-form Pro content remains mostly Traditional Chinese. | Medium | Remaining | Public Pro page content |
| `/fcn` | `en-US` | Navigation shell switches to English, but FCN education content remains mostly Traditional Chinese. | Medium | Remaining | Public FCN page content |
| `/about` | `en-US` | Navigation shell switches to English, but About page content remains mostly Traditional Chinese. | Medium | Remaining | Public About page content |
| `/weekly-brief` | `en-US` | Shell switches to English, but weekly authored content remains Traditional Chinese / mixed English title. | Low | Remaining | Authored weekly content |
| `/daily-brief` | `en-US` | Route loaded without errors, but no deep content could be confirmed in the sampled viewport. | Low | Remaining | Daily Brief archive/content |
| `/market` | all | Route showed account/login gate in unauthenticated production session. | Medium | Remaining / needs product decision | Public route gate or market route policy |
| Public routes | `ja-JP` | Selector changes to `ja-JP`, but content remains English shell plus Traditional Chinese authored copy. | High | Remaining | i18n dictionaries and authored content migration |

## Icon Contrast Findings By Route

| Route | Visual issue | Priority | Status | Likely file/component |
| --- | --- | --- | --- | --- |
| `/my-ixai/fcn` | FCN Risk Summary section used a bare small gold `Gauge` icon on a light card. | Medium | Fixed by replacing with `FeatureIcon` dark forest container. Authenticated production visual verification pending. | `components/fcn/fcn-risk-summary.tsx` |
| `/my-ixai/fcn` | Authenticated FCN Center may still contain off-token state pills and lower-contrast inline status indicators from legacy Tailwind classes. | Medium | Remaining | `components/fcn/fcn-center-workspace.tsx`, `components/fcn/fcn-risk-summary.tsx` |
| `/my-ixai/risk` | Authenticated Risk Center icon contrast could not be visually inspected without login. | High | Remaining | `components/risk/*` |
| `/my-ixai/intelligence` | Authenticated Intelligence Center icon contrast could not be visually inspected without login. | High | Remaining | `components/intelligence/*` |
| Public pages | Public routes showed no console/runtime failures during scan; detailed icon contrast remains a lower-priority visual pass after Workspace authenticated QA. | Low | Remaining | Public route components |

## Fixed In This Batch

- Added FCN risk display labels for:
  - `Worst-of Performance`
  - `Nearest KI Distance`
  - `Nearest Strike Distance`
  - `KO Status`
  - `KO ready`
  - `Not KO ready / unavailable`
  - `UNKNOWN`
  - `UNAVAILABLE`
  - `Current`
  - `Initial`
  - `Performance`
  - `KI Distance`
  - `Strike Distance`
  - `Missing current market price`
  - `Missing or invalid KI price`
  - `Missing or invalid strike price`
  - `Missing or invalid KO price`
  - source status values such as `partial`
- Replaced a low-contrast FCN risk summary inline icon with the shared high-contrast `FeatureIcon` primitive.
- Preserved FCN engine output contracts. Translation happens at the UI display layer only.

## Remaining Issues

- Authenticated production Workspace visual QA must be rerun after signing into `https://app.ixuan.ai`.
- Risk Center deep labels remain high-impact.
- Intelligence Center deep labels remain high-impact.
- FCN Center still has additional long-tail labels, lifecycle copy, schedule copy, manual-price copy, and state-pill contrast polish beyond the first required label batch.
- Public long-form pages are not fully translated in `en-US` or `ja-JP`.
- `ja-JP` has no full content coverage.
- `/market` behavior needs product confirmation because it rendered the account/login gate during unauthenticated production QA.

## Next Batch Recommendation

Translation Maintenance Batch 3 should start only after an authenticated production session is available. Priority order:

1. Authenticated visual QA for `/my-ixai/fcn`, `/my-ixai/risk`, `/my-ixai/intelligence`, and `/my-ixai/portfolio`.
2. Risk Center display mapping and icon contrast.
3. Intelligence Center display mapping and icon contrast.
4. Remaining FCN Center lifecycle, schedule, manual price, and state-pill contrast cleanup.
5. Decide whether `ja-JP` should stay selectable before full Japanese content coverage exists.


# V16.9 Editorial Beta Validation

Review date: 2026-07-06

## Scope

V16.9 is a release-gate validation pass for the completed V16A AI Financial Media mainline. It does not add product features. It verifies whether Daily Brief, Weekly Brief, Admin Daily Briefs, provider health, fallback behavior, and the Production Editorial System are ready for Beta validation.

In scope:

- Public Daily Brief route.
- Public Weekly Brief route.
- Admin Daily Briefs route and production console.
- Provider diagnostics, cache state, fallback path, coverage score, quality score, and production metadata.
- Local automated QA helper for route rendering and source-contract checks.

Out of scope:

- New editorial provider integrations.
- AI model calls.
- Scheduler auto-publish.
- Telegram / LINE / Email / Push delivery.
- DB schema or migration work.
- Trading, recommendation, billing, or V16B Workspace monitoring.

## Routes Checked

Automated local validation checks:

| Route | Purpose | Expected result |
| --- | --- | --- |
| `/daily-brief` | Public Daily Brief + Daily Brief 2.0 preview | Renders, exposes provider readiness and production health, does not leak raw provider payloads |
| `/weekly-brief` | Public Weekly Brief + Weekly Brief 2.0 preview | Renders, exposes provider readiness and production health, does not leak raw provider payloads |
| `/admin/daily-briefs` | Admin Editorial Studio + Production Editorial Console | Renders locally through dev gate, shows production readiness, checklist, provider/publish status |

Production deployment and authenticated admin validation remain a separate manual step after PR deploy.

## Daily Brief Validation

Status: Pass for local route and source validation.

Validated behavior:

- `/daily-brief` renders without requiring a Workspace session.
- Daily Brief 2.0 snapshot uses the provider-backed async builder.
- Snapshot includes provider diagnostics, production metadata, fallback state, and no-investment-advice disclaimer.
- Public page shows simplified source/readiness details and does not expose provider-specific response shapes.
- Source assertions confirm `buildDailyBrief2SnapshotAsync()` uses `getEditorialProviderSourceResultAsync()` and includes production metadata.

## Weekly Brief Validation

Status: Pass for local route and source validation.

Validated behavior:

- `/weekly-brief` renders the public Weekly Brief route.
- Weekly Brief 2.0 snapshot uses the shared provider-backed editorial pipeline.
- Snapshot includes provider diagnostics, production metadata, weekly coverage state, fallback state, and no-investment-advice disclaimer.
- Public page shows simplified source/readiness details and does not expose provider-specific response shapes.
- Source assertions confirm `buildWeeklyBrief2SnapshotAsync()` uses `getEditorialProviderSourceResultAsync()` and includes production metadata.

## Admin Daily Validation

Status: Pass for local route validation; production authentication remains manual.

Validated behavior:

- `/admin/daily-briefs` renders in local QA.
- Local development unlock path can be used by the QA helper when present.
- Admin surface includes the Production Editorial Console.
- Admin console exposes production readiness, publish status, provider status, retry state, and checklist visibility.

Production admin access depends on the production admin gate/session and must be verified manually before Beta sign-off.

## Provider Health Validation

Status: Pass for source-contract validation.

Validated behavior:

- Provider source path is centralized through `getEditorialProviderSourceResultAsync()`.
- Provider diagnostics include fetch result, cache hit/miss, fallback level, publication readiness, coverage, and quality.
- Google News RSS, Yahoo Finance News, and Yahoo Finance Market Snapshot adapters output `EditorialRawStory`.
- Daily / Weekly consume normalized IXAI editorial objects, not provider-specific response payloads.

## Cache Validation

Status: Pass for source-contract validation.

Validated behavior:

- Provider source path reports `cacheHit`.
- Cache is memory-only.
- Cache is used as a degradation path, not as a durable publication store.
- No Redis, database cache, or migration was added.

## Fallback Validation

Status: Pass for local/source validation.

Validated behavior:

- Provider source path supports real/cached/fallback result states.
- Fallback state degrades to limited/deterministic output rather than crashing the page.
- Daily / Weekly snapshots can be generated without an AI provider.
- Social Pack remains non-blocking and outside the core Brief render path.

## Coverage / Quality Validation

Status: Pass for local/source validation.

Validated behavior:

- Public Daily / Weekly pages show simplified coverage / quality status.
- Provider source path reports coverage and quality.
- Production metadata includes health and publish guard state.
- Admin production console gives operators a route to inspect readiness rather than inferring from public stale content.

## Mobile QA

Status: Covered by `QA_PORT=3001 npm run qa:mobile`.

The existing mobile QA script checks public Daily Brief, Weekly Brief, and Admin Daily Briefs among broader public/protected routes. V16.9 adds `npm run qa:editorial-beta` for a narrower editorial release-gate pass.

## Known Issues

P0:

- None found in local route/source validation.

P1:

- Production admin access still requires manual verification because it depends on real admin gate/session state.
- Real external provider availability can vary. The release gate depends on fallback behavior working, not on every provider succeeding.
- Provider metrics are diagnostic snapshots, not durable historical metrics.

P2:

- Public source/readiness labels are intentionally simplified, but deeper editorial operator language still appears in Admin.
- Production screenshots and authenticated admin evidence should be captured on the deployed preview before final Beta announcement.

## Go / No-Go Checklist

| Gate | Status | Notes |
| --- | --- | --- |
| Daily Brief route renders | Go | Automated by `qa:editorial-beta` |
| Weekly Brief route renders | Go | Automated by `qa:editorial-beta` |
| Admin Daily route renders locally | Go | Automated with local dev unlock when available |
| Provider diagnostics can generate | Go | Source and route validation |
| Fallback pipeline can generate limited brief | Go | Source validation confirms fallback path |
| Direct provider payload does not leak to UI | Go | QA script checks common raw response markers |
| No AI dependency required | Go | Source/readiness checks confirm deterministic fallback |
| No scheduler auto-publish dependency | Go | Source check confirms `autoPublishEnabled: false` |
| Mobile public/admin smoke | Go | Covered by `qa:mobile` |
| Production admin manual verification | Pending | Must be checked after deploy |
| Production public readback | Pending | Must be checked after deploy |

## Beta Readiness Verdict

Verdict: Conditional Go for Beta preview.

V16A is ready for a controlled Beta preview if the validation suite passes and production manual verification confirms:

- public `/daily-brief` renders,
- public `/weekly-brief` renders,
- `/admin/daily-briefs` is accessible to authorized admin users,
- provider failure degrades to cached / limited / deterministic output,
- scheduler remains draft/review only,
- no raw provider payloads leak into public UI.

Do not announce broad Beta until production admin and public readback are verified on the deployed build.

# V20B — Alert & Notification Platform

## Summary

V20B adds the Workspace alert and notification orchestration layer on top of V20A Intelligence Platform.

The product question is:

```text
What deserves my attention, and why does it matter to my investments?
```

This is not a notification delivery release. V20B creates normalized alerts, lifecycle metadata, correlation, de-duplication, cooldown, suppression, notification preview routing, and diagnostics. In-app preview is enabled. Telegram, LINE, email, browser push, and mobile push remain disabled.

## Architecture

```text
V20A Intelligence Platform
↓
V20B Alert Rules
↓
Alert Correlation / De-duplication
↓
Alert Lifecycle
↓
Notification Preview Events
↓
V17 Notification Channel Router
↓
In-App Preview / External Channel Dry Run
```

V20B reuses:

- V20A Intelligence Platform snapshots.
- V17 Notification Platform contracts, routing, retry metadata, suppression, and diagnostics.
- Existing Workspace notification page product components.
- Existing i18n dictionary system.

V20B does not create:

- A second Monitoring Engine.
- A second Notification Platform.
- A second Channel Router.
- A second Workspace Intelligence layer.
- A DB-backed alert history system.

## Implemented Files

Library:

- `src/lib/intelligence/alerts/alert-types.ts`
- `src/lib/intelligence/alerts/alert-preferences.ts`
- `src/lib/intelligence/alerts/alert-priority.ts`
- `src/lib/intelligence/alerts/alert-rules.ts`
- `src/lib/intelligence/alerts/alert-correlation.ts`
- `src/lib/intelligence/alerts/alert-lifecycle.ts`
- `src/lib/intelligence/alerts/alert-notification-orchestrator.ts`
- `src/lib/intelligence/alerts/alert-diagnostics.ts`
- `src/lib/intelligence/alerts/alert-service.ts`
- `src/lib/intelligence/alerts/index.ts`

Validation:

- `scripts/validate-v20b-alert-notification.mjs`
- `npm run qa:v20b-alert-notification`

UI integration:

- `components/notifications/notifications-experience-workspace.tsx`

Docs:

- `docs/V20B_ALERT_NOTIFICATION_PLATFORM.md`

## Alert Contract

Each normalized alert contains:

- `id`
- `type`
- `ruleFamily`
- `severity`
- `priority`
- `notificationPriority`
- `status`
- `title`
- `summary`
- `whyItMatters`
- `whatToMonitor`
- `affectedAssetIds`
- `affectedFcnIds`
- `affectedSymbols`
- `sourceDomains`
- `source`
- `confidence`
- `correlationKey`
- `dedupeKey`
- `cooldownKey`
- `notificationSuppressionKey`
- `createdAt`
- `expiresAt`

Lifecycle states:

- `open`
- `acknowledged`
- `snoozed`
- `resolved`
- `archived`

V20B includes a pure lifecycle transition helper, but no persistence write path.

## Rule Families

V20B evaluates deterministic rules for:

- Portfolio attention.
- Risk attention.
- FCN risk / event attention.
- Market attention.
- Watchlist attention.
- Provider degradation.
- Data quality / limited coverage.

Rules consume V20A normalized snapshots only. They do not read provider payloads directly.

## Correlation / De-duplication

Alerts are correlated by:

- rule family
- alert type
- affected symbols
- affected FCNs
- affected assets

This prevents duplicate alert cards for the same investment context. The correlation key does not depend on transient titles alone.

## Notification Orchestration

V20B builds notification preview events from alerts and routes them through the existing V17 Notification Channel Router.

Supported channel contracts:

- In-app
- Telegram
- LINE
- Email
- Browser Push
- Mobile Push

Current channel status:

- In-app: preview ready.
- Telegram: dry-run only.
- LINE: dry-run only.
- Email: dry-run only.
- Browser Push: dry-run only.
- Mobile Push: dry-run only.

No external notification is sent.

## Preferences / Suppression / Cooldown

Default preferences:

- In-app enabled.
- External delivery disabled.
- Telegram disabled.
- LINE disabled.
- Email disabled.
- Browser Push disabled.
- Mobile Push disabled.

Cooldown defaults:

- Critical: 2 hours.
- Warning: 6 hours.
- Info: 24 hours.

Existing notification suppression inputs can be passed to the service to preview suppressed events. V20B does not persist suppression state.

## Persistence Boundary

V20B is preview-only and in-memory.

It does not add:

- DB schema.
- migration.
- Supabase writes.
- alert history writes.
- auth / RLS behavior.

The existing historical alert persistence code remains untouched. V20B diagnostics explicitly report `in-memory-preview` persistence.

## Workspace Integration

`/my-ixai/notifications` now loads:

- alert snapshot
- urgent / high alerts
- normal alerts
- low / suppressed / channel preview
- collapsed advanced diagnostics

The page keeps old local notification readback in Advanced with `autoLoad={false}` so it does not trigger legacy readback on initial render.

New visible copy is connected through the `notifications` dictionary namespace for `zh-TW` and `en-US`.

## Safety Boundaries

V20B does not change:

- API routes.
- database schema.
- migrations.
- auth / RLS.
- external providers.
- scheduler behavior.
- AI model calls.
- trading.
- recommendation.
- target prices.
- billing.
- V20A import direction.

V20A does not import V20B.

## Validation

Required validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `npm run qa:v20b-alert-notification`
- `npm run qa:v20a-intelligence`
- `QA_PORT=3001 npm run qa:mobile`
- `npm run qa:editorial-beta`

## Next Steps

Future V20C may productize alert previews across more Workspace surfaces. External delivery should not be implemented until there is an explicit channel audit, durable preference model, durable alert lifecycle model, and user-facing consent flow.

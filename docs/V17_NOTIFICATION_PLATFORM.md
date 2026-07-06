# V17.3 Notification Platform

Review date: 2026-07-06

## Purpose

V17.3 establishes the shared Notification Platform foundation for future Workspace, Monitoring, Telegram, LINE, Email, Browser Push, Mobile Push, and In-App notification workflows.

This release does not send notifications. It does not implement Telegram Bot, LINE Messaging API, Email provider, Browser Push provider, Mobile Push provider, scheduler, or UI.

## Implemented Files

New library:

- `src/lib/intelligence/notifications/notification-types.ts`
- `src/lib/intelligence/notifications/notification-channel-router.ts`
- `src/lib/intelligence/notifications/notification-delivery-policy.ts`
- `src/lib/intelligence/notifications/notification-suppression.ts`
- `src/lib/intelligence/notifications/notification-priority.ts`
- `src/lib/intelligence/notifications/notification-retry.ts`
- `src/lib/intelligence/notifications/notification-diagnostics.ts`
- `src/lib/intelligence/notifications/notification-service.ts`
- `src/lib/intelligence/notifications/index.ts`

## Reused Foundations

V17.3 reuses:

- V17.2 Monitoring Events.
- V17.2 Today Focus direction.
- V17.1 Asset Intelligence context through Monitoring Events.
- V16 failure degradation principle.

The platform is designed around:

```text
Monitoring Event
↓
Notification Event
↓
Channel Router
↓
Allowed Channels
↓
Fallback Channels
```

## Notification Event Contract

Each `NotificationEvent` includes:

- `id`
- `monitoringEventId`
- `title`
- `body`
- `whyItMatters`
- `priority`
- `severity`
- `channels`
- `fallbackChannels`
- `status`
- `suppressionKey`
- `cooldownUntil`
- `retryCount`
- `maxRetries`
- `deliveryState`
- `createdAt`
- `expiresAt`

Notification copy keeps monitoring language and does not include buy, sell, hold, target price, rebalance, or recommendation language.

## Supported Channels

The channel contract supports:

- `in-app`
- `telegram`
- `line`
- `email`
- `browser-push`
- `mobile-push`

Only `in-app` is available by default as a routing preview fallback. No external provider token, secret, webhook, sender, or environment variable was added.

## Channel Router

The channel router supports:

- priority-based channel filtering
- availability filtering
- fallback channel selection
- skipped/suppressed/expired routing
- route preview output

Routing does not send anything.

## Delivery Policy

The delivery policy supports:

- priority-based allowed channels
- severity-based routing through priority mapping
- quiet-hours placeholder
- channel availability
- fallback channel selection
- no delivery when confidence is too low

## Suppression / De-duplication

Suppression supports:

- duplicate suppression key
- cooldown window
- event expiry
- same asset + same event type suppression
- repeated provider fallback suppression

## Priority Mapping

Monitoring priority and severity map to:

- `low`
- `normal`
- `high`
- `urgent`

This priority is used for routing decisions only.

## Retry Metadata

Retry metadata supports:

- `pending`
- `delivered`
- `failed`
- `suppressed`
- `expired`
- `skipped`
- `retryable`
- `non-retryable`

V17.3 records retry intent only. It does not create a retry worker, queue, scheduler, webhook, or persistent delivery log.

## Diagnostics

Notification diagnostics report:

- notification count
- urgent / high / normal / low count
- suppressed count
- skipped count
- retryable count
- channel readiness
- fallback channel readiness
- delivery readiness green / yellow / red
- blocking issues
- warning issues

## Service Layer

The service layer exports:

- `createNotificationEvents()`
- `routeNotificationEvents()`
- `getNotificationDiagnostics()`
- `getNotificationDeliveryPreview()`

The helpers are pure and deterministic over supplied monitoring events and optional policy input.

## Integration Status

V17.3 is library-only.

It is not connected to:

- Workspace UI
- Notification Center UI
- Telegram
- LINE
- Email
- Browser Push
- Mobile Push
- Scheduler
- API routes
- database writes
- Copilot
- billing

## Out of Scope

V17.3 explicitly does not add:

- actual Telegram / LINE / Email / Push sending
- provider token / secret / env
- Scheduler
- AI call
- DB schema / migration
- trading
- buy / sell / hold
- target price
- recommendation
- billing
- Workspace Copilot
- major UI redesign

## Validation

Required validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Recommended Step

V17.4 should add a read-only Notification Delivery Preview or Settings diagnostics surface only after this platform contract is reviewed. Actual Telegram / LINE / Email / Push delivery should remain a later, separately audited provider implementation.

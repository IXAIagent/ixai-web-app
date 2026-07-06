# V18.2 Portfolio / FCN Intelligence Integration

Review date: 2026-07-06

## Executive Summary

V18.2 connects the V16 / V17 intelligence foundations into Portfolio, FCN, and Watchlist Workspace pages as read-only product surfaces.

This release does not create a new engine. It reuses V16 Editorial Intelligence, V17.1 Asset Intelligence, V17.2 Monitoring Engine, V17.3 Notification Platform, and V17.4 Workspace Intelligence concepts. The goal is to help users see what IXAI is monitoring for their assets, FCN positions, and watchlist items without sending notifications, making AI calls, changing persistence, or adding investment advice.

## Integration Scope

Updated pages:

- `/my-ixai/portfolio`
- `/my-ixai/fcn`
- `/my-ixai/watchlist`

Updated components:

- `components/portfolio/portfolio-experience-workspace.tsx`
- `components/fcn/fcn-experience-workspace.tsx`
- `components/watchlist/watchlist-experience-workspace.tsx`

## Portfolio Integration

Added:

- Portfolio Intelligence Summary.
- Position Intelligence cards.
- Portfolio Intelligence diagnostics inside the existing collapsed diagnostics panel.

Each position now shows read-only intelligence fields when available:

- Asset Health.
- Monitoring Status.
- Editorial Coverage.
- Related Themes.
- Priority.
- Confidence.
- Last Updated.

Portfolio summary shows:

- Healthy assets.
- Warning assets.
- Critical / priority monitoring events.
- Today Focus count.
- Related news / editorial coverage count.
- Coverage score.

Fallback behavior:

- If Portfolio positions do not exist, the page shows a friendly empty state and preserves the existing Add Asset CTA.
- Missing intelligence fields render as placeholders such as `暫無資料`, `待建立`, or `等待資料`.

## FCN Integration

Added:

- FCN Intelligence Summary.
- Per-FCN monitoring cards.
- FCN Intelligence diagnostics inside the existing collapsed diagnostics panel.

Each FCN card shows:

- Worst-of monitoring.
- KI risk.
- Observation status.
- Coupon status.
- Related editorial signals.
- Asset health summary.
- Related monitoring event count.
- Priority.
- Confidence.

FCN summary shows:

- Worst-of / nearest KI.
- KI Events.
- Observation Events.
- Coupon Events.
- Related Themes.
- Today Focus count.

Implementation note:

- The active FCN page currently receives `FcnPortfolioRiskSummary` and `FcnPortfolioScheduleSummary`, not raw `FCNPosition[]`.
- V18.2 derives read-only Asset Intelligence input from the existing FCN risk summary to avoid changing FCN services, API routes, persistence, or engines.

## Watchlist Integration

Added:

- Watchlist Intelligence Summary.
- Per-watchlist-item monitoring / editorial fields.
- Watchlist Intelligence diagnostics inside the existing collapsed diagnostics panel.

Each watchlist item now shows:

- Monitoring Events / Monitoring Status.
- Today Focus relation through the shared Today Focus count.
- Editorial Highlights.
- Coverage.
- Priority.

Watchlist summary shows:

- Watchlist Events.
- News Coverage.
- Priority count.
- Monitoring Status.
- Today Focus count.
- Notification Preview count.

## Reused V16 / V17 Services

Reused:

- `src/lib/intelligence/assets/getAssetIntelligence()`
- `src/lib/intelligence/monitoring/getMonitoringEvents()`
- `src/lib/intelligence/monitoring/getTodayFocus()`
- `src/lib/intelligence/notifications/getNotificationDeliveryPreview()`
- V16 Editorial coverage / theme concepts through Asset Intelligence.
- Existing V15 Workspace Product UI primitives.

No duplicate engine was introduced.

## Diagnostics

Diagnostics remain collapsed by default.

Added diagnostics:

- Portfolio Diagnostics.
- FCN Diagnostics.
- Watchlist Diagnostics.

Diagnostics show read-only counts for:

- Asset Intelligence assets.
- Monitoring events.
- Notification preview items.
- Coverage / themes / related news.

## Safety Boundaries

Not changed:

- API routes.
- Database schema.
- Migrations.
- Auth.
- Supabase policies.
- Portfolio engine logic.
- FCN engine logic.
- Watchlist service logic.
- Monitoring Engine internals.
- Notification sending.
- Scheduler.
- AI / LLM calls.
- Trading.
- Recommendation.
- Billing.
- Copilot Chat.
- Timeline.
- Navigation.

No buy / sell / hold, target price, or investment-advice language was added.

## Validation Checklist

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Manual preview checks:

- `/my-ixai/portfolio` renders Portfolio Intelligence Summary and Position Intelligence.
- `/my-ixai/fcn` renders FCN Intelligence Summary and per-FCN monitoring cards.
- `/my-ixai/watchlist` renders Watchlist Intelligence Summary and per-item intelligence fields.
- Diagnostics remain collapsed by default.
- No notification is sent.
- No trading or recommendation CTA appears.

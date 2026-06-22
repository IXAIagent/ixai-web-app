# V5 Workspace Expansion Program

## Goal

V5 expands IXAI Workspace with four connected modules that make the existing engine stack easier to use day to day:

1. Watchlist Engine.
2. Alert Engine.
3. Workspace Daily Brief Engine.
4. Workspace Dashboard v2.

The program uses existing systems only: Portfolio Persistence, Portfolio Truth, Market Service, Market Cache, Portfolio Valuation, Risk Engine, FCN Risk, FCN Schedule, and Intelligence Engine.

## Scope

- Add local/fallback Watchlist readback for Workspace.
- Generate deterministic alert cards from watchlist, risk, FCN risk, FCN schedule, and market data availability.
- Generate a rule-based Workspace Daily Brief from existing engines.
- Upgrade Workspace Home with Dashboard v2 cards and first alert / daily brief readback.
- Add `/my-ixai/watchlist` as a Workspace route.

## Files Changed

- `src/lib/watchlist/`
- `src/lib/alerts/`
- `src/lib/daily-brief/`
- `components/watchlist/watchlist-summary.tsx`
- `components/alerts/alert-summary.tsx`
- `components/daily-brief/workspace-daily-brief.tsx`
- `app/my-ixai/watchlist/page.tsx`
- `app/my-ixai/home/page.tsx`
- `components/layout/sidebar.tsx`

## Architecture

```text
Portfolio Persistence
Portfolio Truth
Market Service / Market Cache
Portfolio Valuation
Risk Engine
FCN Risk
FCN Schedule
Intelligence Engine
↓
Watchlist Engine
Alert Engine
Workspace Daily Brief Engine
↓
Workspace Dashboard v2
```

## Watchlist Behavior

- Reads existing local watchlist storage when available.
- Uses fallback sample items when no local watchlist exists.
- Uses Market Service quotes when available.
- Never crashes when quotes are unavailable.
- Does not provide buy/sell advice or trade actions.

## Alert Behavior

- Generates deterministic UI-only alert cards.
- Sources include Watchlist, Portfolio Risk, FCN Risk, FCN Schedule, and market data availability.
- Alert delivery through push, email, LINE, Telegram, or scheduler is not implemented.

## Daily Brief Behavior

- Generates a structured Workspace Daily Brief from existing readback engines.
- Sections include Portfolio Snapshot, Risk Summary, FCN Risk, FCN Schedule, Watchlist, Alerts, and Intelligence.
- No AI model calls and no new external news fetching.

## Dashboard v2 Behavior

Workspace Home now exposes module cards for:

- Portfolio Persistence.
- Valuation.
- Risk.
- FCN Risk.
- FCN Schedule.
- Watchlist.
- Alerts.
- Daily Brief.
- Intelligence.

## Compliance Boundary

V5 remains monitoring, risk awareness, and workflow organization only. It does not provide investment advice, buy/sell instructions, target-price advice, position sizing, order execution, automated trading, or return promises.

## Limitations

- Watchlist persistence remains local/fallback only.
- Alert delivery is not implemented.
- Workspace Daily Brief is rule-based and does not use live external news or AI model calls.
- Dashboard v2 is a readback surface, not a full analytics cockpit.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Steps

- Durable Watchlist persistence.
- Alert delivery design and opt-in workflow.
- Daily Brief personalization after durable preferences are approved.
- Unified dashboard hardening after data contracts stabilize.

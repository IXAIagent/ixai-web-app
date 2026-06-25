# V18.00 Morning Brief Live Data Readiness

## Goal

V18 upgrades the V16 Morning Brief Engine so it can accept market data snapshot metadata without enabling live external providers.

## Scope

- Adds `brief-market-data-adapter.ts`.
- Extends Morning Brief output with `marketDataSummary`.
- Keeps News as placeholder-only.
- Keeps Morning Snapshot reusable for Home, Web, Telegram, and future API surfaces.

## Boundaries

- No external market feed.
- No Yahoo, Binance, broker, Telegram, scheduler, OpenAI, AI recommendation, trading, SQL, migration, or database write.
- Missing market data remains placeholder / unavailable metadata and never blocks the brief.

## Next

Future provider work can replace placeholder snapshots with approved live/delayed data.

# v3.30 Global Risk Center Foundation

## Objective

v3.30 replaces the placeholder `/my-ixai/risk` route with the first working Global Risk Center foundation.

The goal is to connect existing FCN risk readback from v3.20 into a broader Risk Center surface while preparing Stock, Crypto, Grid, and Dual readiness states for future multi-asset risk work.

## Previous Foundation

- v3.09 established persisted FCN position readback through `/api/fcn` and Supabase `fcn_positions` / `fcn_underlyings`.
- v3.10 added FCN KI-distance risk monitoring using stored current price only.
- v3.20 upgraded `/my-ixai/fcn` into the FCN Intelligence Center with lifecycle, manual local price overlay, timeline, Risk Engine v2, and underlying concentration.

## What v3.30 Adds

- `/my-ixai/risk` now renders a Global Risk Center instead of a placeholder.
- FCN Risk Summary reuses the v3.20 FCN Intelligence Center helper output.
- Stock, Crypto, Grid, and Dual appear as readiness cards, not full risk engines.
- Upcoming Risk Events reuse FCN timeline events.
- Data Source Status reports FCN API, Stock API, Crypto API, Manual Price Overlay, and Live Market Data state.
- A deterministic `Foundation Score` gives a first risk overview based on FCN RED / YELLOW / UNKNOWN counts.

## Data Sources

Current readback uses existing authenticated API routes:

- `/api/fcn`
- `/api/stocks`
- `/api/crypto`

Manual FCN price overrides use the v3.20 browser-local overlay:

- `ixai.fcn.manual-prices.v320`

Live market data is explicitly not enabled.

## Global Risk Score Logic

The v3.30 Foundation Score is deterministic and intentionally narrow:

- RED FCN count increases the score by 30 each.
- YELLOW FCN count increases the score by 15 each.
- UNKNOWN FCN count increases the score by 8 each.
- The score is capped at 100.
- No FCN data returns `UNKNOWN`.
- Scores from 70 upward are `ELEVATED`.
- Scores from 35 upward are `MODERATE`.
- Lower scores are `LOW`.

This is a foundation score only. It is not AI scoring, not a prediction, and not investment advice.

## UI Sections

The v3.30 Risk Center contains:

1. Global Risk Overview
2. FCN Risk Summary
3. Multi-Asset Readiness for Stock / Crypto / Grid / Dual
4. Upcoming Risk Events
5. Data Source Status
6. Compliance Footer

## Compliance Boundary

v3.30 remains monitoring and risk-awareness only.

It does not provide:

- Investment recommendations.
- Order execution.
- Auto trading.
- Broker sync.
- Live market data.
- AI recommendation logic.

## Known Limitations

- Stock and Crypto APIs are shown as readiness sources, but full Stock / Crypto risk engines are not implemented.
- Grid and Dual are derived from crypto position type / strategy type only.
- Manual price overlay is browser-local and does not persist to Supabase.
- Upcoming events are FCN-only in this sprint.
- Live Market Data remains `Not Enabled`.

## Next Recommended Steps

The next step should be a narrow v3.31 or v3.30.x Risk Center follow-up:

- Add clearer empty / unauthenticated state QA.
- Decide whether Stock / Crypto inputs should persist before building real Stock / Crypto risk summaries.
- Move broader concentration / correlation / scenario / stress-test modules into Risk Center only after their data source contracts are clear.

Future v3.40 direction should focus on a fuller multi-asset Global Risk Center after data contracts mature:

- FCN, Stock, Crypto, Grid, and Dual risk summaries under one center.
- Portfolio concentration / correlation / scenario / stress-test ownership in Risk Center.
- Explicit data-source freshness and live-market-data provider governance before any real-time claims.
- No recommendation, trading, broker execution, or AI advisory behavior unless separately approved.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Local route smoke: `GET /my-ixai/risk` returns `200 OK`

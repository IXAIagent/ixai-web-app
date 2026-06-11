# Portfolio Correlation Engine Foundation v2.07

## Objective

Create the Portfolio Correlation Engine Foundation.

This release adds the first deterministic correlation readback layer on top of:

```text
Portfolio Assets
→ Market Data Foundation
→ Valuation Engine
→ Exposure Engine
→ Concentration Engine
→ Correlation Engine
```

## Scope

v2.07 is foundation only.

It adds:

- `PortfolioCorrelationReport`.
- `PortfolioCorrelationPair`.
- `PortfolioCorrelationLevel`.
- `PortfolioCorrelationEngine`.
- `mockPortfolioCorrelationEngine`.
- `buildPortfolioCorrelation()`.
- Portfolio Correlation Engine dashboard readback inside `/my-ixai/portfolio`.

## Correlation Types

The foundation report includes:

- `correlationScore`.
- `level`.
- `highCorrelationCount`.
- `mediumCorrelationCount`.
- `lowCorrelationCount`.
- `pairs`.
- `topCorrelationPairs`.
- `alerts`.
- `summary`.
- `generatedAt`.

Levels:

- `LOW`.
- `MEDIUM`.
- `HIGH`.
- `CRITICAL`.

## Engine Contract

`PortfolioCorrelationEngine.generateCorrelation()` receives:

- `PortfolioExposureReport`.
- `PortfolioConcentrationReport`.

It returns a `PortfolioCorrelationReport`.

## Mock Correlation Logic

The mock engine is deterministic and does not use external data.

High correlation examples:

- `TSLA ↔ NVDA`.
- `TSLA ↔ PLTR`.
- `NVDA ↔ AVGO`.
- `MDB ↔ PLTR`.
- `BTC ↔ ETH`.

Medium correlation examples:

- `AAPL ↔ MSFT`.
- `ORCL ↔ MSFT`.
- `GOOGL ↔ META`.

Low correlation examples:

- `CASH` versus market-linked assets.
- Region-diversified exposure pairs.

The mock score is derived from:

- high correlation count.
- medium correlation count.
- low correlation count.
- existing concentration score.

## Dashboard Integration

`/my-ixai/portfolio` now displays:

- Correlation Score.
- Correlation Risk Level.
- High / Medium / Low Counts.
- Top Correlation Pairs.
- Alerts.
- Summary.
- Generated Time.

## Architecture Update

The architecture sequence is now:

```text
Portfolio Exposure Engine Foundation
→ Portfolio Concentration Engine Foundation
→ Portfolio Correlation Engine Foundation
→ Portfolio Scenario Engine (Coming Soon)
```

## Compliance Boundary

This layer is monitoring and risk-awareness only.

It does not provide:

- investment advice.
- trade instructions.
- position sizing.
- target prices.
- expected returns.
- guaranteed returns.
- automated trading.

## Out of Scope

v2.07 does not add:

- migration.
- schema change.
- API route.
- auth change.
- membership change.
- entitlement change.
- broker sync.
- external market data.
- OpenAI / Claude / Gemini calls.
- recommendation logic changes.
- trading logic.

## Validation Checklist

- `git diff --check`.
- `npm run lint`.
- `npm run build`.
- `QA_PORT=3001 npm run qa:mobile`.
- Playwright checks for `/portfolio` and `/my-ixai/portfolio` at `375`, `768`, and `1280`.

## Next

v2.08 may introduce Portfolio Scenario Engine Foundation if correlation output remains stable.

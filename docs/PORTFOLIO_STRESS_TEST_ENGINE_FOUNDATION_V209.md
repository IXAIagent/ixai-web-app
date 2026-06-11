# Portfolio Stress Test Engine Foundation v2.09

## Objective

v2.09 establishes the Portfolio Stress Test Engine Foundation.

The Portfolio Center flow becomes:

```text
Portfolio Valuation
→ Exposure
→ Concentration
→ Correlation
→ Scenario
→ Stress Test
```

This is a foundation-only release. It creates deterministic stress-test types, engine contract, mock engine, builder flow, dashboard readback, and documentation. It does not connect any real market data, broker, AI, trading, or external provider.

## Scope

Included:

- `PortfolioStressTestReport`.
- `PortfolioStressTestCase`.
- `PortfolioStressTestResult`.
- `PortfolioStressTestLevel`.
- `PortfolioStressTestEngine`.
- Deterministic mock stress-test library.
- `buildPortfolioStressTestReport()`.
- Portfolio Center Stress Test dashboard section.
- Architecture Map update.

Out of scope:

- No migration.
- No schema change.
- No API route.
- No auth change.
- No membership change.
- No entitlement change.
- No broker sync.
- No external market data.
- No OpenAI, Claude, Gemini, or other AI provider.
- No trading logic.
- No recommendation logic change.

## Stress Test Types

The foundation defines six deterministic stress tests:

1. Global Equity Shock
   - Equity exposures `-30%`.
2. Crypto Crash
   - Crypto / Grid / Dual exposures `-50%`.
3. FCN Worst-of Shock
   - FCN underlyings `-35%`.
4. High Correlation Shock
   - Highly correlated exposure pairs `-25%`.
5. Concentration Breakdown
   - Largest symbol exposure `-40%`.
6. Regional Crisis
   - Largest region exposure `-35%`.

## Stress Test Engine Contract

`PortfolioStressTestEngine` exposes:

```ts
runStressTest(input: PortfolioStressTestInput): Promise<PortfolioStressTestReport>;
```

Input uses existing reports:

- `PortfolioValuationReport`.
- `PortfolioExposureReport`.
- `PortfolioConcentrationReport`.
- `PortfolioCorrelationReport`.
- `PortfolioScenarioReport`.

## Deterministic Stress Test Logic

The mock engine is deterministic only.

It does not use:

- Randomness.
- Live prices.
- External API calls.
- Broker data.
- AI output.

Each stress test identifies relevant exposure from existing reports, applies a fixed shock percentage, and produces:

- Stress Test Name.
- Stress Test Type.
- Affected Exposure.
- Estimated Impact %.
- Estimated Impact Value.
- Stress Level.
- Summary.

Aggregate output includes:

- Total Stress Tests.
- Worst Stress Test.
- Average Stress Impact.
- Stress Risk Level.
- Capital Preservation Warning.
- Alerts.
- Summary.
- Generated Time.

Stress levels:

- `LOW`.
- `MEDIUM`.
- `HIGH`.
- `CRITICAL`.

## Builder Flow

```text
Portfolio Valuation Report
↓
Portfolio Exposure Report
↓
Portfolio Concentration Report
↓
Portfolio Correlation Report
↓
Portfolio Scenario Report
↓
Portfolio Stress Test Engine
↓
Portfolio Stress Test Report
```

The builder reuses existing reports and does not duplicate valuation, exposure, concentration, correlation, or scenario logic.

## Dashboard Integration

`/my-ixai/portfolio` now displays:

- Stress Test Count.
- Worst Stress Test.
- Average Stress Impact.
- Stress Risk Level.
- Capital Preservation Warning.
- Stress Test Cards.
- Alerts.
- Summary.
- Generated Time.

The section uses responsive cards and avoids table-only layouts, fixed-width containers, and horizontal overflow.

## Architecture Update

Architecture Map now reads:

```text
Portfolio Scenario Engine Foundation
→ Portfolio Stress Test Engine Foundation
→ FCN Risk Engine Foundation (Coming Soon)
```

## Global Market Requirement

Stress tests must remain market-agnostic and future-ready across:

- US Equities.
- Taiwan Equities.
- Hong Kong Equities.
- China A-Shares.
- Japan Equities.
- Korea Equities.
- European Equities.
- Singapore Equities.
- Crypto Assets.
- FCN Structured Products.

No stress test may assume US-only assets, Taiwan-only assets, English-only labels, or a single market structure.

## Compliance Boundary

Portfolio Stress Test Engine Foundation uses deterministic mock stress-test logic.

It is for monitoring and risk-awareness only. It is not investment advice, trading instruction, a price target, an expected return model, or automated execution.

Disallowed language:

- Buy.
- Sell.
- Increase position.
- Reduce position.
- Target price.
- Expected return.
- Guaranteed return.

## Validation Checklist

Required:

- `git diff --check`.
- `npm run lint`.
- `npm run build`.
- `QA_PORT=3001 npm run qa:mobile`.
- `/portfolio` at 375 / 768 / 1280.
- `/my-ixai/portfolio` at 375 / 768 / 1280.
- Status 200.
- No horizontal overflow.
- Console errors = 0.

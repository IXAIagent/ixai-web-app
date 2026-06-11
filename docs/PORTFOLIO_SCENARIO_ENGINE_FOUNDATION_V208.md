# Portfolio Scenario Engine Foundation v2.08

## Objective

Create the Portfolio Scenario Engine Foundation.

This release adds the first deterministic scenario layer on top of:

```text
Portfolio Assets
→ Market Data Foundation
→ Valuation Engine
→ Exposure Engine
→ Concentration Engine
→ Correlation Engine
→ Scenario Engine
```

## Scope

v2.08 is foundation only.

It adds:

- `PortfolioScenarioReport`.
- `PortfolioScenario`.
- `PortfolioScenarioResult`.
- `PortfolioScenarioLevel`.
- `PortfolioScenarioEngine`.
- `mockPortfolioScenarioEngine`.
- `buildPortfolioScenarioReport()`.
- Portfolio Scenario Engine dashboard readback inside `/my-ixai/portfolio`.

## Inputs

The scenario engine receives:

- `PortfolioValuationReport`.
- `PortfolioExposureReport`.
- `PortfolioConcentrationReport`.
- `PortfolioCorrelationReport`.

It does not connect external market data, broker data, AI providers, API routes, schema, or migrations.

## Deterministic Scenario Library

Scenario 1:

- Technology Selloff.
- Assumption: Technology Assets `-20%`.

Scenario 2:

- Crypto Correction.
- Assumption: Crypto Assets `-30%`.

Scenario 3:

- FCN Underlying Stress.
- Assumption: FCN Underlyings `-15%`.

Scenario 4:

- Regional Shock.
- Assumption: Largest Region Exposure `-20%`.

Scenario 5:

- Concentration Shock.
- Assumption: Largest Symbol Exposure `-25%`.

## Output

Each scenario result includes:

- Scenario Name.
- Scenario Type.
- Affected Assets.
- Estimated Impact %.
- Estimated Impact Value.
- Risk Level.
- Summary.

The aggregate report includes:

- Total Scenarios.
- Worst Scenario.
- Average Impact.
- Scenario Risk Level.
- Alerts.
- Summary.
- Generated Time.

Levels:

- `LOW`.
- `MEDIUM`.
- `HIGH`.
- `CRITICAL`.

## Dashboard Integration

`/my-ixai/portfolio` now displays:

- Scenario Count.
- Worst Scenario.
- Average Impact.
- Scenario Risk Level.
- Scenario Cards.
- Alerts.
- Summary.
- Generated Time.

## Global Market Requirement

Scenarios must work across:

- US Equities.
- Taiwan Equities.
- Hong Kong Equities.
- China A-Shares.
- Japan Equities.
- Korea Equities.
- European Equities.
- Crypto Assets.
- FCN Structured Products.

No scenario may assume US-only assets.

## Architecture Update

The architecture sequence is now:

```text
Portfolio Correlation Engine Foundation
→ Portfolio Scenario Engine Foundation
→ Portfolio Stress Test Engine Foundation (Coming Soon)
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

v2.08 does not add:

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

v2.09 may introduce Portfolio Stress Test Engine Foundation if scenario output remains stable.

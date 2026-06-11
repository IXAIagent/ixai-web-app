# Portfolio FCN Risk Engine Foundation v2.10

## Objective

v2.10 establishes the Portfolio FCN Risk Engine Foundation.

The Portfolio Core Engine flow becomes:

```text
Valuation
→ Exposure
→ Concentration
→ Correlation
→ Scenario
→ Stress Test
→ FCN Risk
```

This is the final Portfolio Core Engine Foundation release before Platform Review.

## Scope

Included:

- `PortfolioFCNRiskReport`.
- `PortfolioFCNRiskPosition`.
- `PortfolioFCNRiskAlert`.
- `PortfolioFCNRiskLevel`.
- `PortfolioFCNRiskEngine`.
- Deterministic mock FCN-risk engine.
- `buildPortfolioFCNRiskReport()`.
- Portfolio Center FCN Risk dashboard section.
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

## FCN Identification Rules

The engine recognizes FCN assets using:

- `category === "FCN"`.
- `metadata.underlyings` when present.

This lets the foundation support current manual FCN assets and future structured products with explicit underlying metadata.

## FCN Risk Metrics

The report includes:

- FCN Count.
- FCN Exposure %.
- FCN Underlying Count.
- Worst Underlying Concentration.
- Repeated Underlying Count.
- Correlated Underlying Count.
- Stress-Test Sensitivity.
- FCN Risk Score.

## FCN Risk Engine Contract

`PortfolioFCNRiskEngine` exposes:

```ts
generateFCNRisk(input: PortfolioFCNRiskInput): Promise<PortfolioFCNRiskReport>;
```

Input uses:

- Portfolio Assets.
- Portfolio Exposure Report.
- Portfolio Concentration Report.
- Portfolio Correlation Report.
- Portfolio Stress Test Report.

## Deterministic FCN Risk Logic

Higher risk when:

- More FCNs are present.
- FCN exposure is a larger share of the portfolio.
- Underlyings repeat across FCNs.
- FCN underlying concentration is elevated.
- FCN underlyings overlap with high-correlation pairs.
- FCN stress-test sensitivity is elevated.

Lower risk when:

- FCN underlyings are more diversified.
- FCN assets span more regions.
- Portfolio provider exposure is more diversified.
- Concentration and stress-test impact are lower.

Risk levels:

- `LOW`.
- `MEDIUM`.
- `HIGH`.
- `CRITICAL`.

Alerts may include:

- High FCN Exposure.
- Repeated Underlying Exposure.
- FCN Concentration Risk.
- FCN Correlation Risk.
- FCN Stress-Test Sensitivity.
- Global Market Concentration.

## Builder Flow

```text
Portfolio Assets
↓
Exposure Report
↓
Concentration Report
↓
Correlation Report
↓
Stress Test Report
↓
Portfolio FCN Risk Engine
↓
Portfolio FCN Risk Report
```

The builder reuses existing reports and does not duplicate exposure, concentration, correlation, or stress-test logic.

## Dashboard Integration

`/my-ixai/portfolio` now displays:

- FCN Count.
- FCN Exposure %.
- FCN Risk Score.
- FCN Risk Level.
- Underlying Count.
- Repeated Underlying Count.
- Correlation Count.
- Stress-Test Sensitivity.
- Alerts.
- Summary.
- Generated Time.

The section uses responsive cards only. It does not use tables, fixed-width containers, or horizontal overflow.

## Architecture Update

Architecture Map now reads:

```text
Portfolio Stress Test Engine Foundation
→ Portfolio FCN Risk Engine Foundation
→ Portfolio Core Engine Foundation Complete
```

## Global Market Requirement

The FCN Risk Engine must support future FCN products based on:

- US Equities.
- Taiwan Equities.
- Hong Kong Equities.
- China A-Shares.
- Japan Equities.
- Korea Equities.
- European Equities.
- Singapore Equities.
- Crypto-linked FCN.
- Future Structured Products.

No FCN-risk logic may assume US-only underlyings, Taiwan-only products, English-only labels, or one broker / issuer structure.

## Compliance Boundary

Portfolio FCN Risk Engine Foundation uses deterministic mock FCN-risk logic.

It is for monitoring and risk-awareness only. It is not investment advice, product recommendation, trading instruction, a price target, an expected return model, or automated execution.

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

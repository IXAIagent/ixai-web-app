# v2.01 — Portfolio Risk Engine Foundation

## Objective

v2.01建立第一版 Portfolio Risk Engine Foundation。

Current flow:

```text
Portfolio Assets
↓
Repository
↓
Intelligence Universe
↓
News Provider
↓
AI Commentary
↓
Portfolio Intelligence Engine
↓
Portfolio Risk Engine
```

This release is foundation only. It uses deterministic mock scoring and does not connect real AI, market data, broker sync, news providers, or recommendation logic.

## Scope

- Add Portfolio Risk types.
- Add Portfolio Risk Engine contract.
- Add mock deterministic Risk Engine.
- Add Risk Score Builder.
- Display Portfolio Risk Engine report inside `/my-ixai/portfolio`.
- Update Architecture Map with Portfolio Risk Engine Foundation.

## Risk Types

`PortfolioRiskLevel`:

- `LOW`
- `MODERATE`
- `HIGH`
- `CRITICAL`

`PortfolioRiskReport` includes:

- `overallRisk`
- `concentrationRisk`
- `diversificationRisk`
- `fcnRisk`
- `cryptoRisk`
- `cashBufferRisk`
- `riskScore`
- `alerts`
- `generatedAt`
- `summary`

## Risk Engine Contract

```ts
generateRiskReport(input): Promise<PortfolioRiskReport>
```

The engine receives repository accounts, assets, and positions. It does not call external providers or rebuild portfolio persistence.

## Mock Risk Logic

The mock engine is deterministic:

- Same symbol appearing multiple times increases concentration risk.
- More FCN assets increase FCN risk.
- CRYPTO / GRID / DUAL assets increase crypto risk.
- More CASH assets reduce total risk.
- More asset categories reduce diversification risk.
- More providers reduce diversification risk.
- More regions reduce diversification risk.

## Dashboard Integration

`/my-ixai/portfolio` now includes Portfolio Risk Engine:

- Overall Risk
- Risk Score
- Concentration Risk
- Diversification Risk
- FCN Risk
- Crypto Risk
- Cash Buffer Risk
- Generated Time
- Summary
- Alerts

## Architecture Update

```text
Portfolio News Provider Foundation
↓
Portfolio AI Commentary Foundation
↓
Portfolio Intelligence Engine Foundation
↓
Portfolio Risk Engine Foundation
↓
Portfolio Recommendation Engine (Coming Soon)
```

## Compliance Boundary

Portfolio Risk Engine Foundation is monitoring and risk-awareness only.

It must not output:

- Investment advice.
- Trading instructions.
- Recommendation logic.
- Position sizing.
- Price targets.
- Expected returns.
- Guaranteed returns.
- Automated execution.

## Out of Scope

- No migration.
- No schema change.
- No API route.
- No auth change.
- No membership or entitlement change.
- No market data.
- No News API.
- No broker sync.
- No recommendation logic.
- No Daily / Weekly / Social Pack change.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `/portfolio` at 375 / 768 / 1280.
- `/my-ixai/portfolio` at 375 / 768 / 1280.
- No horizontal overflow.
- Console errors = 0.
- Authenticated Portfolio Center visual QA when session is available.

# v2.00 — Portfolio Intelligence Engine Foundation

## Objective

v2.00建立第一版 Portfolio Intelligence Engine Foundation。

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
```

This release is foundation only. It uses deterministic mock scoring and does not connect real AI, market data, broker sync, or external providers.

## Scope

- Add Portfolio Intelligence Engine types.
- Add Portfolio Intelligence Engine contract.
- Add mock Portfolio Intelligence Engine.
- Add Intelligence Score Builder.
- Display Portfolio Intelligence Engine scoring inside `/my-ixai/portfolio`.
- Update Architecture Map with Portfolio Intelligence Engine Foundation.

## Intelligence Types

`PortfolioIntelligenceScore` includes:

- `id`
- `healthScore`
- `riskScore`
- `concentrationScore`
- `diversificationScore`
- `overallRating`
- `summary`
- `generatedAt`

Supported ratings:

- `excellent`
- `good`
- `moderate`
- `elevated`
- `high_risk`

## Engine Contract

```ts
generateIntelligence(input): Promise<PortfolioIntelligenceScore>
```

The engine receives repository assets, accounts, Portfolio News Feed, and Portfolio Commentary. It does not rebuild these layers or call external providers.

## Mock Scoring Logic

The mock engine is deterministic:

- Many FCN assets increase risk and concentration scores.
- Many cash assets reduce risk score.
- Multiple providers improve diversification score.
- Larger single-category concentration increases concentration score.
- Volatile or risk-watch commentary increases risk score.
- Health score is derived from risk, concentration, and diversification.

There is no randomness, no market data, and no external AI.

## Dashboard Integration

`/my-ixai/portfolio` now includes Portfolio Intelligence Engine:

- Portfolio Health Score
- Portfolio Risk Score
- Concentration Score
- Diversification Score
- Overall Rating
- Generated Time
- Portfolio Intelligence Summary

## Architecture Update

```text
Portfolio Foundation
↓
Portfolio Input Foundation
↓
Portfolio CRUD Foundation
↓
Portfolio Data Model Foundation
↓
Portfolio Repository Foundation
↓
Portfolio Persistence Foundation
↓
Portfolio Ownership Validation
↓
Portfolio Dashboard Foundation
↓
Portfolio News Intelligence Foundation
↓
Portfolio News Provider Foundation
↓
Portfolio AI Commentary Foundation
↓
Portfolio Intelligence Engine Foundation
↓
Portfolio Risk Engine (Coming Soon)
```

## Compliance Boundary

Portfolio Intelligence Engine Foundation uses mock scoring only.

It is for monitoring and risk-awareness purposes only. It must not output:

- Investment advice.
- Trading instructions.
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
- No FCN engine change.
- No Daily / Weekly / Social Pack change.
- No OpenAI, Claude, Gemini, Anthropic, News API, market data API, broker API, or service role usage.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- `/portfolio` at 375 / 768 / 1280.
- `/my-ixai/portfolio` at 375 / 768 / 1280.
- No horizontal overflow.
- Console errors = 0.
- Authenticated Portfolio Center visual QA when session is available.

## Next

v2.01 may define Portfolio Risk Engine Foundation after the mock intelligence score model, dashboard presentation, and compliance language are validated.

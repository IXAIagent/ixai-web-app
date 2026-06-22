# v4.80 Intelligence Engine v1

## Goal

Build the first Workspace Intelligence Engine that converts existing IXAI readback systems into deterministic, structured Intelligence Cards.

This is not an AI-model sprint. v4.80 uses existing systems only:

- Portfolio Truth Layer
- Market Service
- Market Cache
- Portfolio Valuation Engine
- Risk Engine
- FCN Risk Engine
- FCN Schedule Engine

## Scope

v4.80 adds:

- Intelligence Card types.
- Deterministic rule-based Intelligence Engine.
- Client-side Intelligence Service that reuses existing readback services.
- Intelligence Summary UI inside `/my-ixai/intelligence`.
- Documentation updates.

## Intelligence Card Categories

### Portfolio Intelligence

Examples:

- Largest position
- Largest available gain
- Largest available loss
- Highest asset-class concentration

### Risk Intelligence

Examples:

- Critical risk positions
- High risk positions
- Concentration warnings
- Unpriced positions

### FCN Intelligence

Examples:

- KI breached positions
- Near KI positions
- Top risk FCNs
- Upcoming KO observations

### Schedule Intelligence

Examples:

- Next coupon
- Next observation
- Next maturity

## Output Contract

Each card includes:

- `id`
- `title`
- `summary`
- `severity`
- `sourceEngine`

Severity values:

- `info`
- `warning`
- `critical`

## Data Sources

v4.80 reads existing readback services only. It does not add a new API route, schema, migration, provider, broker integration, or AI model.

```text
Portfolio Truth
↓
Portfolio Valuation
↓
Risk Engine

Market Cache + Market Service
↓
Portfolio Valuation / FCN Risk

FCN Risk + FCN Schedule
↓
FCN / Schedule Intelligence Cards
```

## Compliance Boundary

Cards are monitoring and workflow context only. They are not investment advice.

v4.80 does not provide:

- buy/sell instructions
- order execution
- automated trading
- target prices
- guaranteed returns
- personalized investment recommendations

## Limitations

- Cards depend on existing holdings, valuation, risk, FCN risk, and schedule data.
- If no positions or schedules exist, the summary shows a safe empty state.
- FCN valuation and pricing remain limited to existing v4.30 / v4.50 boundaries.
- No external AI model is called.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Step

Recommended next sprint: v4.90 Intelligence Card QA / User Workflow Review or v4.90 FCN Scenario Monitoring, depending on product priority.

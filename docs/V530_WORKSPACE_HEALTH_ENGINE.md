# V5.30 Workspace Health Engine

## Goal

Create a deterministic 0–100 Workspace Health Score.

## Dimensions

- Portfolio health.
- Risk health.
- FCN health.
- Market health.
- Data quality health.
- Schedule health.
- Intelligence health.
- Overall health.

## Rules

The engine starts from 100 and deducts points for unavailable valuation, high/critical risk signals, FCN critical risk, missing market data, overdue FCN events, no usable portfolio data, and no usable intelligence cards.

## Boundary

Workspace Health is informational infrastructure scoring only. It is not investment advice, allocation guidance, trading logic, or a recommendation engine.

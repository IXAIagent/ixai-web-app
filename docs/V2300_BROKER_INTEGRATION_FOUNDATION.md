# V23.00 Broker Integration Foundation

## Goal

V23 creates broker-provider readiness contracts without connecting a live broker.

## Scope

- Broker provider interface.
- Manual broker placeholder.
- Account snapshot type.
- Position sync readiness type.
- Broker health diagnostics.
- Trading-disabled safety flags.

## Required Safety Flags

- `tradingEnabled: false`
- `orderExecutionEnabled: false`
- `brokerLiveApiEnabled: false`
- `positionSyncEnabled: false`

## Boundaries

- No Futu or IBKR live API.
- No broker credential flow.
- No position sync.
- No trading, order execution, buy/sell/rebalance instruction, or recommendation logic.

## Next

Future broker work requires a dedicated consent, credential, read-only sync, and trading-disabled safety review.

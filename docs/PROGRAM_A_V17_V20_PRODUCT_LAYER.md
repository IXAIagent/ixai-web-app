# Program A: V17-V20 Product Layer Acceleration

## Goal

Program A accelerates the product layer after V16 Morning Brief Engine without opening unsafe external integrations.

## Modules

- V17 Market Data Provider Foundation: provider contracts and manual placeholder snapshot.
- V18 Morning Brief Live Data Readiness: Morning Brief accepts market snapshot metadata.
- V19 Intelligence Center v2 Foundation: deterministic monitoring context layer.
- V20 SaaS Foundation Readiness: plan, usage, subscription, and team readiness metadata.

## Safety Boundary

Program A does not add:

- DB writes or Supabase mutations.
- SQL, migrations, schema, RLS, auth, or membership changes.
- Yahoo, Binance, broker, Telegram, scheduler, or external news provider connections.
- OpenAI or external AI provider calls.
- Trading, order execution, buy/sell/rebalance instructions, or investment recommendations.

Note: the repository contains older market-data provider modules for other product surfaces. Program A does not import or re-export those legacy provider modules; V17 uses the manual placeholder provider only.

## UI Surfaces

- Workspace Home: compact Program A status.
- Settings: compact Program A diagnostics.
- Intelligence Center: Intelligence v2 foundation preview.
- Workspace Graph and Integration Audit: Program A metadata.

## Next

Program B should focus on explicit provider/broker readiness decisions, controlled live integrations, portfolio sync, and advanced risk automation only after separate safety review.

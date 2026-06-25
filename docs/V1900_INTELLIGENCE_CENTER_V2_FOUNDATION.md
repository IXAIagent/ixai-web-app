# V19.00 Intelligence Center v2 Foundation

## Goal

V19 creates a deterministic Intelligence Center v2 foundation that combines existing Portfolio, Risk, FCN, Market placeholder, and Morning Brief contexts.

## Scope

- Adds `src/lib/intelligence/v2/`.
- Adds monitoring insights with source attribution.
- Adds Intelligence Center v2 preview UI.
- Adds safety flags for no AI provider, no external LLM calls, no recommendation logic, and no actionable trading instructions.

## Boundaries

- No OpenAI, Claude, Gemini, or external LLM calls.
- No external news provider.
- No broker sync.
- No trading, order execution, buy/sell/rebalance instructions, or investment recommendations.

## Next

Future Intelligence work can connect approved provider outputs while preserving deterministic source metadata and compliance boundaries.

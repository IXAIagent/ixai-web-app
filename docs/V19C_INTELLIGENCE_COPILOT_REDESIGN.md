# V19 Sprint C — Intelligence & Copilot Redesign

V19 Sprint C redesigns Intelligence and Copilot as investor-facing products.

This sprint is UX-only. It does not modify APIs, database, authentication, AI models, market providers, schedulers, business logic, FCN engine, risk engine, notification delivery, trading, recommendations, or billing.

## Intelligence

Mission:

```text
What does today's market mean for my portfolio?
```

Before:

- Intelligence could feel like workspace intelligence, engine cards, provider state, diagnostics, and readback.
- Users had to infer market meaning from internal summaries.

After:

- First screen asks what today's market means for the user's portfolio.
- Today's Market shows 3-5 key insights.
- Portfolio Impact groups impact by Affected Assets, FCN, Stocks / ETF, Crypto, and Cash.
- Today's Opportunities is reframed as things worth monitoring, not buy recommendations.
- Advanced contains engine cards, diagnostics, raw readback, provider details, and technical state.

## Copilot

Mission:

```text
Ask questions.
```

Before:

- Copilot still carried safe-shell, runtime, manual summary, and explain-only framing in the primary layer.
- Users saw status before questions.

After:

- Landing starts with a large prompt: Ask IXAI.
- Suggested questions are first-class cards.
- Conversation area is clean and user-facing.
- Existing manual summary remains available, but no longer defines the page.
- Context, prompt source, readback, and safety boundary live in Advanced.

## Component Hierarchy

Modified:

- `components/intelligence/intelligence-experience-workspace.tsx`
- `components/copilot/copilot-experience-workspace.tsx`
- `app/my-ixai/intelligence/page.tsx`
- `app/my-ixai/copilot/page.tsx`

Existing data reads and manual Copilot summary behavior are preserved.

## Future Extensions

Intelligence:

- Improve portfolio impact once richer asset/market relationships are available.
- Add more precise confidence once the read model supports it.

Copilot:

- Connect the prompt input to a future explicitly scoped answer flow.
- Add conversation history only when persistence and AI behavior are formally approved.

Future work must preserve V19 boundaries:

- No buy / sell / hold.
- No target price.
- No hidden AI model call.
- No automatic heavy graph fan-out on initial render.
- No provider or runtime wording in the first layer.


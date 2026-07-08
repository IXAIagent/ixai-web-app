# V19.2 — Today Dashboard UX Redesign

V19.2 is the first Workspace UX implementation sprint after the V19 product architecture foundation. It redesigns the Workspace Home / Today surface around one question:

```text
What do I need to know today?
```

## Design Goals

- Help a first-time user understand today's investment situation within 10-30 seconds.
- Remove engineering language from the first screen.
- Present human-readable answers before diagnostics.
- Make the page the product benchmark for future Workspace pages.
- Preserve existing services and read models without changing business logic.

## Information Hierarchy

The page follows five sections:

1. Today's Status
   - Portfolio today.
   - Risk today.
   - Market today.
   - Next important event.
   - Morning Brief availability.
2. Today's Priorities
   - Maximum three cards.
   - Each card explains why it matters.
3. Today's Portfolio
   - Estimated portfolio value.
   - Today's unrealized P/L.
   - Asset allocation.
   - Largest position, gain, and loss.
4. Today's Market
   - Market impact.
   - Watchlist focus.
   - News availability.
   - Calendar summary.
5. What's Next
   - Maximum five upcoming investment-related events.
   - Quote errors and system failures are not timeline events.

Advanced diagnostics remain collapsed after the user-facing sections.

## Component Hierarchy

The implementation reuses existing Workspace product primitives:

- `WorkspaceProductHero`
- `WorkspaceProductSection`
- `WorkspaceKpiGrid`
- `WorkspaceLoadingCard`
- `WorkspaceDiagnosticsPanel`

Primary implementation file:

- `components/home/workspace-home-dashboard.tsx`

The page still uses existing read models:

- Portfolio valuation.
- Workspace alerts.
- FCN risk summary.
- Workspace timeline summary.
- Workspace Intelligence diagnostics.

## User Journey

The intended first-pass journey:

1. User lands on Today.
2. User sees a human-readable daily status.
3. User scans the top three priorities.
4. User checks the quick portfolio summary.
5. User sees whether market context or next events matter today.
6. User opens Portfolio, Risk, Timeline, Morning Brief, or Markets only if needed.
7. Advanced diagnostics remain available but do not dominate the experience.

## Old vs New

Before:

- Home mixed product summaries with Workspace Intelligence, provider, monitoring, notification, readiness, and diagnostic wording.
- Technical readiness and preview concepts appeared before the daily user answer.
- The first screen required the user to infer what mattered.

After:

- The first screen answers what the user needs to know today.
- Technical concepts are moved into Advanced.
- Today prioritizes status, attention, portfolio, market, and next events.
- Empty and limited-data states use user language.

## Future Extensions

Future V19 work can extend Today by:

- Improving live portfolio valuation quality.
- Connecting richer market and watchlist impact.
- Adding clearer FCN observation / coupon / maturity cards.
- Improving Timeline relevance and event grouping.
- Adding localized copy once the page pattern stabilizes.

Future work must not reintroduce provider, runtime, cache, fallback, deterministic, rule-based, API, or diagnostics wording into the first user layer.


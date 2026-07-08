# V19 Sprint A — Portfolio, Markets & Risk Product Redesign

V19 Sprint A redesigns the three core Workspace product pages together:

- Portfolio
- Markets
- Risk

This sprint uses existing services and read models only. It does not change authentication, Supabase, database schema, migrations, API contracts, business logic, valuation engine, FCN engine, scheduler behavior, notification delivery, AI integrations, or market providers.

## Old vs New

Before:

- Portfolio mixed asset value with intelligence, monitoring, source, and diagnostics language.
- Watchlist behaved like a technical watchlist/readback surface instead of a Markets page.
- Risk showed engine-oriented summaries and metrics before the user-facing decision.
- The three pages could duplicate each other through repeated status, monitoring, and diagnostics cards.

After:

- Portfolio answers: How is my money performing?
- Markets answers: What happened in markets that affects me?
- Risk answers: What deserves my attention?
- Technical details are moved into collapsed Advanced panels.
- Each page owns a distinct product mission.

## Information Hierarchy

### Portfolio

Portfolio is the asset dashboard.

First screen:

- Estimated Portfolio Value
- Today's P/L
- Unrealized P/L
- Asset Allocation
- Largest Position
- Largest Gain
- Largest Loss

Second section:

- All Assets
- FCN
- Stocks
- ETF
- Crypto
- Cash

Each asset class shows allocation, market value, unrealized P/L, and position count.

Additional sections:

- Insights
- Allocation visualization
- Detailed holdings
- Advanced diagnostics

### Markets

Markets is the external-events surface.

Structure:

- Today's Market Summary
- US Market
- Taiwan Market
- Crypto
- Watchlist
- Market Movers
- Economic Calendar
- Market News
- Advanced diagnostics

Each card explains why the item matters.

### Risk

Risk is the decision center.

Structure:

- Overall Risk
- Top Risks
- Concentration
- FCN Risk
- Market Risk
- Portfolio Risk
- Upcoming Risk Events
- Risk History
- Advanced diagnostics

Each risk card explains why it matters, what is affected, and what should be monitored.

## Component Hierarchy

Modified product shells:

- `components/portfolio/portfolio-experience-workspace.tsx`
- `components/watchlist/watchlist-experience-workspace.tsx`
- `components/risk/risk-experience-workspace.tsx`

Updated metadata:

- `app/my-ixai/watchlist/page.tsx`

Shared primitives reused:

- `WorkspaceProductHero`
- `WorkspaceProductSection`
- `WorkspaceKpiGrid`
- `WorkspaceEmptyState`
- `WorkspaceStateMessage`
- `WorkspaceDiagnosticsPanel`

## Navigation

The current route remains `/my-ixai/watchlist`, but the product language now treats it as Markets. This avoids route and navigation churn while aligning the page with V19 IA.

Product ownership:

- Portfolio = my assets.
- Markets = external events.
- Risk = user attention.

## Future Extensions

Portfolio:

- Improve live valuation quality.
- Add richer asset-class detail once valuation data supports it.
- Add better ETF / cash classification when the data model supports it.

Markets:

- Connect richer economic calendar and market news once available.
- Separate US / Taiwan / Crypto cards with real market context.

Risk:

- Add clearer FCN KI / KO / observation risk once the read model provides complete values.
- Improve risk history grouping by date and asset.

All future extensions must keep technical labels behind Advanced and avoid buy / sell / hold, recommendation, target price, or trading language.


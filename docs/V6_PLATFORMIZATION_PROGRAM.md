# V6 Platformization Program

## Goal

Move IXAI from a Workspace prototype toward a SaaS-ready platform foundation without changing auth, schema, broker integration, trading, recommendations, or AI model behavior.

## Modules

- V6.10 Workspace API Routes: read-only server-safe route handlers for Workspace Graph, Health, Timeline, Notifications, Intelligence, and Daily Brief.
- V6.20 Persistent Watchlist Foundation: persistence abstraction and future schema draft, preserving local/fallback behavior.
- V6.30 Persistent Alerts Foundation: alert history abstraction and future schema draft, preserving deterministic alert cards.
- V6.40 Daily Brief History Foundation: history abstraction and future schema draft, preserving rule-based Daily Brief generation.
- V6.50 Workspace Insights Foundation: deterministic insight cards on top of Workspace Graph.
- V6.60 Notification Delivery Foundation: delivery readiness contracts only; in-app active, external channels disabled/planned.
- V6.70 Workspace Copilot Foundation: rule-based explain-only templates with no AI model calls.

## Boundaries

V6 does not add broker integrations, trading execution, order routing, buy/sell/hold recommendations, AI model calls, Supabase schema changes, migrations, or public landing page redesign.

## Next

Future work can connect these foundations to durable persistence and opt-in delivery after schema and compliance review.

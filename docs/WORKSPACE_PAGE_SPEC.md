# Workspace Page Specification

V19.1 converts Workspace UX 2.0 philosophy into page-level product blueprints. This is a docs-only specification. It does not implement React, routes, APIs, engines, providers, database schema, auth, schedulers, notifications, valuation logic, FCN logic, or UI components.

Every Workspace page must have:

- One mission.
- One core user question.
- One first-screen answer.
- Clear secondary and advanced layers.
- Explicit anti-patterns.

## 1. Today

Page mission: Give the user a clear daily operating view.

Core user question: What happened today?

First-screen answer: A concise summary of today's portfolio state, market context, risk attention, and next action.

Primary information:

- Portfolio movement and status.
- Top risks requiring attention.
- Market events that affect the user.
- Today Focus.
- Highest priority notifications.

Secondary information:

- Recent activity.
- Market snapshot.
- Watchlist highlights.
- Brief links.

Advanced/debug information:

- Provider health.
- Cache state.
- Runtime diagnostics.
- Fallback source.
- Readiness checks.

What belongs on this page:

- Daily answer.
- User impact summary.
- Next action.
- Links into Portfolio, Markets, Risk, Timeline, Notifications, and Copilot.

What does not belong on this page:

- Full engine dashboards.
- Raw provider output.
- Full Morning Brief report.
- Long diagnostic panels above the fold.

Required data dependencies:

- Workspace summary.
- Portfolio summary.
- Monitoring Today Focus.
- Notification preview.
- Editorial / market summary.
- Risk highlights.

Empty state behavior:

- Explain that IXAI needs assets or watchlist items to personalize the daily view.
- Offer clear next actions: add asset, add FCN, add watchlist item.

Error state behavior:

- Show a limited daily view.
- Explain which data is temporarily unavailable.
- Do not turn provider failures into timeline or notification events.

Mobile behavior:

- Hero answer first.
- Then Today Focus.
- Then Portfolio / Risk cards.
- Diagnostics remain collapsed.

Anti-patterns:

- Leading with Provider, Runtime, Cache, Graph, Readback, or Diagnostics.
- Showing every system event as a user event.
- Making the user infer the daily answer from many cards.

Future implementation notes:

- Today should become the default Workspace landing experience.
- Home and Today should not duplicate full Morning Brief.

## 2. Portfolio

Page mission: Explain how the user's money is performing.

Core user question: How is my money performing?

First-screen answer: Total value, daily movement, allocation, and whether anything needs attention.

Primary information:

- Total assets.
- Today's performance.
- Allocation.
- Major movers.
- Portfolio risk summary.
- Asset health.

Secondary information:

- Holdings.
- Asset classes.
- Related news / themes.
- Related monitoring events.
- Recent changes.

Advanced/debug information:

- Valuation diagnostics.
- Provider diagnostics.
- Persistence status.
- Coverage / quality details.

What belongs on this page:

- All Assets.
- FCN.
- Stocks.
- ETF.
- Crypto.
- Cash.

Future asset classes:

- Bond.
- Funds.
- Structured Products.
- Options.
- Alternative Assets.

What does not belong on this page:

- Top-level separate navigation for each asset class unless product architecture changes.
- Buy / sell / hold copy.
- Recommendation or target price copy.
- Provider status as the primary story.

Required data dependencies:

- Portfolio valuation.
- Asset Intelligence.
- Monitoring Events.
- Editorial coverage.
- Notification preview.

Empty state behavior:

- Explain that the portfolio view needs at least one asset.
- Offer add asset, add FCN, or import placeholder actions.

Error state behavior:

- Preserve known holdings if available.
- Mark valuation as temporarily unavailable.
- Do not collapse the whole page into a technical error.

Mobile behavior:

- Total value and daily movement first.
- Asset-class tabs or compact segmented controls.
- Holdings stack vertically.

Anti-patterns:

- Leading with source status.
- Showing incomplete valuation without explaining what is missing.
- Splitting asset classes into scattered pages without a unified portfolio answer.

Future implementation notes:

- V19.3 should prioritize live valuation clarity and asset-class hierarchy.

## 3. Markets

Page mission: Explain market movement that affects the user.

Core user question: What happened in markets that affects me?

First-screen answer: The relevant market moves, watchlist focus, and market news most likely to matter.

Primary information:

- Watchlist focus.
- Market movers.
- Market news.
- Economic calendar.
- Relevant themes.

Secondary information:

- Index snapshot.
- Sector / theme highlights.
- Source summary.
- Editorial coverage.

Advanced/debug information:

- Provider coverage.
- Provider quality.
- Cache status.
- Fallback state.

What belongs on this page:

- Watchlist.
- Market movers.
- Relevant market news.
- Economic calendar.
- Market themes.

What does not belong on this page:

- Generic news list.
- Provider payloads.
- Unfiltered market noise.
- Watchlist as a static symbol list without relevance.

Required data dependencies:

- Watchlist items.
- Editorial provider layer.
- Market snapshot.
- Editorial Intelligence.
- Monitoring relevance.

Empty state behavior:

- Explain that market relevance improves with watchlist and portfolio assets.
- Offer add watchlist item.

Error state behavior:

- Show limited market view.
- Explain data is temporarily limited.
- Keep source failures in Advanced.

Mobile behavior:

- Watchlist focus first.
- Then top market movers.
- Then market news.

Anti-patterns:

- Calling the page Watchlist if the mission is market relevance.
- Showing raw quote unavailable errors in the primary layer.

Future implementation notes:

- V19.4 should merge Watchlist into Markets as an attention layer.

## 4. Risk

Page mission: Help users see what deserves attention.

Core user question: What deserves my attention?

First-screen answer: A decision-center style risk summary with critical, warning, and healthy areas.

Primary information:

- Top risks.
- Affected assets.
- Affected FCNs.
- Why it matters.
- Next monitor action.

Secondary information:

- Concentration.
- Exposure.
- FCN KI / KO / observation context.
- Data quality impacting risk confidence.

Advanced/debug information:

- Risk engine diagnostics.
- Coverage / quality diagnostics.
- Provider fallback state.

What belongs on this page:

- Risk explanation.
- Priority.
- Affected assets.
- Affected FCNs.
- Monitoring next steps.

What does not belong on this page:

- Duplicated metrics dashboard.
- Raw score dump without explanation.
- Buy / sell / hold or recommendation copy.

Required data dependencies:

- Asset Intelligence.
- Monitoring Events.
- Risk Summary.
- FCN state.
- Portfolio exposure.

Empty state behavior:

- Explain that risk monitoring needs portfolio or FCN data.
- Offer add asset / add FCN.

Error state behavior:

- Show limited risk view.
- Explain confidence is reduced.
- Keep engine failures in Advanced.

Mobile behavior:

- One risk answer first.
- Top risks as stacked cards.
- Details lower on the page.

Anti-patterns:

- Leading with engine status.
- Showing risk score without user-facing interpretation.
- Treating all warnings as equal.

Future implementation notes:

- V19.5 should make Risk a decision center.

## 5. Timeline

Page mission: Show meaningful upcoming and recent events.

Core user question: What important event is coming next?

First-screen answer: The next relevant event, why it matters, and what asset or FCN it affects.

Primary information:

- Upcoming events.
- Observation dates.
- Coupon dates.
- Earnings.
- Macro events.
- Important market events.

Secondary information:

- Recent completed events.
- Event grouping by today, next 7 days, later.
- Related assets and themes.

Advanced/debug information:

- Event source diagnostics.
- Missing coverage.
- Provider health.

What belongs on this page:

- Real time-based user events.
- Asset or FCN related events.
- Market events that matter to the user.

What does not belong on this page:

- Quote errors.
- Provider failures.
- System errors.
- Generic logs.

Required data dependencies:

- Monitoring Timeline.
- Asset Intelligence.
- FCN schedule.
- Editorial events.

Empty state behavior:

- Explain that no upcoming events currently require attention.
- Offer asset / FCN / watchlist setup if needed.

Error state behavior:

- Show known events and mark event coverage as limited.
- Do not convert errors into timeline entries.

Mobile behavior:

- Next event first.
- Compact timeline groups.
- Easy scanning by date.

Anti-patterns:

- Mixing error logs with real events.
- Treating every fetch failure as a user-facing timeline event.

Future implementation notes:

- V19.6 should separate event timeline from diagnostics.

## 6. Morning Brief

Page mission: Provide a readable market narrative.

Core user question: What should I know in 3 minutes?

First-screen answer: A concise narrative of the market story, why it matters, and what to watch next.

Primary information:

- Today's summary.
- Market story.
- Key themes.
- Why it matters.
- Watch next.

Secondary information:

- Supporting stories.
- Source attribution.
- Weekly context.
- Share actions.

Advanced/debug information:

- Provider health.
- Coverage.
- Quality.
- Fallback state.
- Publication readiness.

What belongs on this page:

- Readable and shareable narrative.
- Human editorial structure.
- Public-friendly context.

What does not belong on this page:

- API-style summary output.
- Raw topic arrays.
- Provider diagnostics above the fold.
- User portfolio-specific monitoring.

Required data dependencies:

- Editorial providers.
- Editorial Intelligence.
- Daily / Weekly Brief builders.
- Publication health.

Empty state behavior:

- Publish a limited brief when data is insufficient.
- Explain coverage limitations clearly.

Error state behavior:

- Use limited brief fallback.
- Do not fail the whole report because one downstream pack or provider fails.

Mobile behavior:

- Readable text rhythm.
- Shareable sections.
- No diagnostic clutter.

Anti-patterns:

- Making Morning Brief look like JSON, API output, or admin diagnostics.
- Treating Social Pack as a blocker for core brief.

Future implementation notes:

- V19.7 should prioritize readability and shareability.

## 7. Notifications

Page mission: Tell users what they need to know now.

Core user question: What do I need to know right now?

First-screen answer: A prioritized list of high-impact alerts with why each matters.

Primary information:

- Urgent / high priority items.
- Why it matters.
- Affected assets.
- Status.
- Suggested in-app next step.

Secondary information:

- Suppressed / completed items.
- History.
- Notification preview.
- Channel readiness summary.

Advanced/debug information:

- Channel router diagnostics.
- Suppression keys.
- Retry metadata.
- Delivery preview.

What belongs on this page:

- User-impact alerts.
- Monitoring notifications.
- Prioritized grouped status.

What does not belong on this page:

- System alert log.
- Developer event feed.
- Provider state as notification content.
- Actual notification sending in this spec.

Required data dependencies:

- Monitoring Events.
- Notification Platform.
- Notification Preview.
- Workspace Intelligence.

Empty state behavior:

- Say nothing needs attention right now.
- Explain how notifications improve after assets / watchlist setup.

Error state behavior:

- Show in-app notification preview if external channels are unavailable.
- Keep channel failures in Advanced.

Mobile behavior:

- Priority groups first.
- Short summaries.
- Clear tap targets.

Anti-patterns:

- Showing provider failures as user notifications.
- Using notification page as an ops console.

Future implementation notes:

- V19.8 should improve notification grouping and user impact copy.

## 8. Copilot

Page mission: Help users ask useful questions.

Core user question: What do I want to ask?

First-screen answer: Suggested questions based on portfolio, risk, market, and recent monitoring context.

Primary information:

- Suggested questions.
- Recent useful questions.
- Context chips.
- Safe explanation-only status.

Secondary information:

- Conversation history.
- Related assets.
- Related risks.
- Related Brief links.

Advanced/debug information:

- Context availability.
- Runtime readiness.
- Graph or summary generation diagnostics.

What belongs on this page:

- Question suggestions.
- Answer interface.
- Context-aware prompts.
- Explain-only boundaries.

What does not belong on this page:

- Runtime panel as the primary UI.
- Explain-only status as the main product.
- Automatic heavy graph fan-out on initial load.
- Investment advice.

Required data dependencies:

- Workspace Intelligence.
- Today Focus.
- Risk Summary.
- Editorial summary.
- Manual summary generation entrypoint when needed.

Empty state behavior:

- Show useful starter questions.
- Explain what IXAI can answer after assets are added.

Error state behavior:

- Keep the safe shell available.
- Show manual retry for summary generation.
- Do not crash or hang from hidden graph fan-out.

Mobile behavior:

- Suggested questions first.
- Chat input accessible.
- Heavy diagnostics hidden.

Anti-patterns:

- Starting with runtime / graph / explain-only labels.
- Auto-running expensive workspace graph generation on mount.
- Presenting Copilot as a status page.

Future implementation notes:

- V19.9 should make Copilot feel like a guided AI assistant.


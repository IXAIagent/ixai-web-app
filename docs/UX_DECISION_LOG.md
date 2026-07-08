# UX Decision Log

This log records product decisions from the V18 Workspace review and V19 Workspace UX 2.0 planning. It is a product governance document, not an implementation changelog.

## Decision 001 — Workspace Must Become Product-First

Decision: Workspace must become product-first, not engineering-first.

Context: V18 connected strong domain services to UI, but several pages still exposed service, provider, diagnostics, and readiness concepts before user value.

Rationale: Users need investment monitoring answers, not engine topology.

Consequence: Future Workspace work must begin with the user question and first-screen answer.

Applies to: All Workspace pages.

Implementation guidance: Design the first screen from user impact. Move engine details to Advanced diagnostics.

## Decision 002 — Every Page Answers One User Question

Decision: Every page answers one user question.

Context: Workspace pages can accumulate overlapping summaries, diagnostics, and cards.

Rationale: A clear question prevents dashboard sprawl.

Consequence: Page scope must be explicit before implementation.

Applies to: Today, Portfolio, Markets, Risk, Timeline, Morning Brief, Notifications, Copilot.

Implementation guidance: Add or preserve only content that helps answer the page's core question.

## Decision 003 — Asset Classes Belong Under Portfolio

Decision: FCN, Stocks, ETF, Crypto, and Cash are asset classes under Portfolio, not top-level navigation.

Context: IXAI supports multiple asset classes and will support more.

Rationale: Users think of these as parts of their money, not separate products.

Consequence: Portfolio owns asset-class hierarchy unless product architecture explicitly changes.

Applies to: Portfolio, navigation, asset pages, future asset-class UI.

Implementation guidance: Use tabs, filters, or grouped sections under Portfolio before creating new top-level navigation.

## Decision 004 — Risk Must Be A Decision Center

Decision: Risk must become a decision center, not a duplicated metrics dashboard.

Context: Risk data can easily become score dumps and repeated metrics from Portfolio or FCN.

Rationale: Users need to know what deserves attention and why.

Consequence: Risk pages should prioritize top risks, affected assets, affected FCNs, severity, and next monitor action.

Applies to: Risk, FCN risk, Portfolio risk, Today risk summaries.

Implementation guidance: Every risk card should explain impact, not only display a metric.

## Decision 005 — Timeline Shows Real User Events

Decision: Timeline must show real time-based user events, not quote failures or system errors.

Context: Previous timeline and diagnostics concepts could mix system state with user events.

Rationale: A timeline is for meaningful events, not logs.

Consequence: Provider errors and quote failures belong in diagnostics, not event timelines.

Applies to: Timeline, Today, Notifications, Diagnostics.

Implementation guidance: Only emit timeline entries for real market, asset, FCN, calendar, or monitoring events.

## Decision 006 — Morning Brief Must Be Narrative

Decision: Morning Brief must be readable/shareable narrative, not API-style summary output.

Context: Brief systems can expose structured data or internal topic outputs too directly.

Rationale: Public Brief builds trust and habit through readability.

Consequence: Morning Brief must read like a human editorial report.

Applies to: Daily Brief, Weekly Brief, public share surfaces, Home summary.

Implementation guidance: Use narrative sections, clear hierarchy, and limited diagnostics below the reading experience.

## Decision 007 — Notifications Communicate User Impact

Decision: Notifications must communicate user impact, not provider/system state.

Context: Notification systems often expose delivery or provider status as user-facing alerts.

Rationale: Users care about what affects investments.

Consequence: Provider failures and delivery diagnostics stay in Advanced.

Applies to: Notifications, Today, Workspace summary, Notification Preview.

Implementation guidance: Every notification should answer why it matters to the user's investments.

## Decision 008 — Watchlist Belongs In Markets

Decision: Watchlist should be part of Markets, focused on market impact and user attention.

Context: Watchlist as a static list does not explain what changed.

Rationale: Users watch symbols to understand market movement that matters to them.

Consequence: Watchlist should become an attention layer in Markets.

Applies to: Markets, Watchlist, Today market summaries.

Implementation guidance: Prioritize movers, relevant news, editorial signals, and monitoring relation over static symbol display.

## Decision 009 — Copilot Must Be A Q&A Interface

Decision: Copilot must become a question-answer interface, not a runtime or explain-only status page.

Context: Safe shell work reduced runtime risk, but Copilot still needs product clarity.

Rationale: Users come to Copilot to ask useful questions.

Consequence: Suggested questions, context, and safe answer boundaries should lead.

Applies to: Copilot, Today quick actions, Workspace intelligence summaries.

Implementation guidance: Start with suggested questions and avoid automatic heavy graph fan-out on initial render.

## Decision 010 — Engineering Wording Must Not Dominate First Layer

Decision: Provider, placeholder, runtime, deterministic, rule-based, engine status, API route, cache, fallback, and diagnostics wording must not dominate the first user layer.

Context: V16-V18 created many useful diagnostic concepts, but they can overwhelm product clarity.

Rationale: Engineering terms are useful for debugging but do not answer user investment questions.

Consequence: Technical wording belongs in Advanced panels, not primary cards or hero sections.

Applies to: All Workspace pages, Daily / Weekly surfaces, Admin-adjacent product previews.

Implementation guidance: Translate system state into user impact. Keep raw technical labels only in developer/debug views.


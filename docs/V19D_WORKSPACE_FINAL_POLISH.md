# V19 Sprint D — Workspace Final Polish

## Scope

V19 Sprint D completes the Workspace UX redesign polish pass across the main authenticated Workspace product surfaces.

Audited pages:

- Today / Home
- Portfolio
- FCN
- Markets / Watchlist
- Risk
- Timeline
- Morning Brief
- Notifications
- Intelligence
- Copilot

This is UI / UX only. It does not change API contracts, database schema, auth, market providers, schedulers, AI model behavior, business logic, valuation logic, FCN engine logic, or risk engine logic.

## UX Goals

- Make every Workspace page feel like one coherent product.
- Keep each page focused on one user question.
- Use a consistent page order: hero, KPI row, primary cards, secondary cards, Advanced.
- Keep diagnostics collapsed and below the primary product content.
- Replace raw loading, empty, and error language with user-facing explanations.
- Avoid exposing provider, runtime, cache, readback, engine status, internal IDs, placeholders, or diagnostics in first-screen copy.

## Shared Polish Applied

- Standardized `WorkspaceProductHero` spacing, typography balance, side-card padding, KPI wrapping, and visual hierarchy.
- Updated shared loading copy so missing data is explained as incomplete information rather than a technical placeholder.
- Updated shared state messages to avoid provider-first wording in user-facing error states.
- Kept `WorkspaceDiagnosticsPanel` collapsed by default and described it as advanced checks.

## Page-Level Polish

### Portfolio

- Portfolio remains focused on assets, allocation, value, holdings, and data completeness.
- Advanced now describes asset completeness and advanced checks instead of raw valuation implementation.

### FCN

- FCN main sections now emphasize Worst-of, KI distance, observations, coupons, related market themes, and watch states.
- Removed normal-layer references to monitoring engines, source/readback/provider wording, and technical schedule implementation.
- Advanced remains the place for FCN data status and deeper checks.

### Markets / Watchlist

- Markets remains focused on external events that affect the user.
- Empty and unavailable states explain what the user can do next and what will appear later.
- Advanced contains watchlist completeness and data availability checks.

### Risk

- Risk remains a decision center for attention, affected assets, and monitoring focus.
- Normal section copy avoids raw metric framing.
- Advanced contains risk data availability and deeper checks.

### Timeline

- Timeline stays focused on "what is happening next."
- Hero and section copy no longer describe system logs, provider logs, runtime logs, or source details above the fold.
- Empty states explain that events will appear after FCN positions, reminders, or watched assets exist.

### Morning Brief

- Morning Brief remains a readable report, not a raw card dump.
- Advanced keeps raw sections, warnings, and quality details collapsed.

### Notifications

- Notifications stay focused on "what requires my attention?"
- Empty states explain where urgent, medium, informational, completed, and historical items will appear.
- Advanced contains delivery preview and deeper checks.

### Intelligence

- Intelligence remains focused on "what does today's market mean for my portfolio?"
- Hero and summary copy now avoid normal-layer engine/provider/readback language.
- Advanced contains supporting cards and deeper checks.

### Copilot

- Copilot remains focused on asking questions.
- The landing prompt, suggestions, and conversation area use assistant language instead of runtime or shell language.
- Advanced contains question context and safety boundary details.

## Navigation Audit

The Workspace product model remains:

- Today
- Portfolio
- Markets
- Risk
- Timeline
- Morning Brief
- Notifications
- Copilot

V19 Sprint D does not perform a navigation rewrite. It verifies that page language follows this model and does not duplicate page missions.

## Advanced Section Rule

The following belong only in Advanced / 進階資訊:

- Provider
- Cache
- Runtime
- Readback
- Diagnostics
- Engine status
- Placeholder wording
- Technical IDs
- Raw source labels

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`

## Out of Scope

- API changes
- Database changes
- Auth changes
- Business logic changes
- Market provider changes
- Scheduler changes
- AI model changes
- FCN engine changes
- Risk engine changes
- Trading
- Recommendations
- Billing

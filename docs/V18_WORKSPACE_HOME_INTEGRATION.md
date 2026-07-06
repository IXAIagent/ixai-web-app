# V18.1 Workspace Home Integration

Review date: 2026-07-06

## Executive Summary

V18 starts the Workspace Product Integration phase. V16 and V17 created the domain and service layers for Editorial Intelligence, Asset Intelligence, Monitoring, Notification Preview, and Workspace Intelligence. V18.1 connects those read-only services to `/my-ixai/home` without creating new engines, notification delivery, trading actions, recommendations, schedulers, AI calls, database schema, or migrations.

The Home page remains the V15 AI Wealth Workspace dashboard. This release adds Workspace Intelligence sections that answer what IXAI already knows about the user's Workspace, what matters today, which risks need attention, and what notification previews exist.

## Scope

Implemented:

- Workspace Intelligence Summary on Home.
- Today Focus on Home.
- Risk Highlights on Home.
- Notification Preview on Home.
- Workspace Intelligence diagnostics inside the existing collapsed diagnostics panel.
- Documentation updates for V18.1 status and product integration direction.

Not implemented:

- New Intelligence Engine.
- New Monitoring Engine.
- New Editorial Engine.
- Notification sending.
- Telegram / LINE / Email / Push delivery.
- Scheduler.
- AI model call.
- Trading, recommendation, target price, buy / sell / hold wording.
- Database schema or migration.
- Copilot Chat.
- Timeline rewrite.
- Major navigation redesign.

## Integration Points

Home UI:

- `components/home/workspace-home-dashboard.tsx`

Workspace Intelligence services:

- `src/lib/intelligence/workspace/getWorkspaceIntelligence()`
- `getWorkspaceSummary()`
- `getWorkspaceTodayFocus()`
- `getWorkspaceRiskSummary()`
- `getWorkspaceNotificationPreview()`
- `getWorkspaceDiagnostics()`

Reused foundations:

- V16 Editorial Intelligence and provider diagnostics.
- V17.1 Asset Intelligence.
- V17.2 Monitoring Engine and Today Focus.
- V17.3 Notification Platform preview / diagnostics.
- V17.4 Workspace Intelligence aggregation layer.

## Home Sections Added

### Workspace Intelligence Summary

Shows:

- Overall health.
- Readiness.
- Asset count.
- Monitoring event count.
- Notification preview count.
- Editorial / provider status.
- Last updated.
- Coverage and quality.

Purpose:

- Give the user a quick read on what the Workspace intelligence layer currently understands.
- Keep the information read-only and user-facing.

### Today Focus

Uses:

- `getWorkspaceTodayFocus()`

Shows up to three items:

- Title.
- Summary.
- Why it matters.
- Affected assets.
- Next monitor action.

Purpose:

- Bring the V17 Monitoring Engine into Home as a readable focus list.
- Avoid trading or recommendation language.

### Risk Highlights

Uses:

- `getWorkspaceRiskSummary()`

Shows:

- Critical count.
- Warning count.
- Healthy count.
- Affected asset / FCN count.
- Top risk items.

Purpose:

- Summarize risk awareness without rebuilding the Risk page or risk engine.

### Notification Preview

Uses:

- `getWorkspaceNotificationPreview()`

Shows:

- Urgent.
- High.
- Normal.
- Suppressed / pending.

Purpose:

- Preview future notification routing output without sending messages.
- Explicitly keeps Telegram, LINE, Email, Browser Push, and Mobile Push out of scope.

### Workspace Diagnostics

Uses:

- `getWorkspaceDiagnostics()`

Shows inside the existing collapsed `WorkspaceDiagnosticsPanel`:

- Asset diagnostics.
- Monitoring diagnostics.
- Editorial diagnostics.
- Notification diagnostics.
- Provider status.
- Workspace readiness.
- Blocking / warning issues.

Purpose:

- Keep engineering-oriented diagnostics available but not first-screen primary content.

## Product Rules Preserved

Home continues to follow the V15 product hierarchy:

```text
Hero / Summary
↓
KPI Row
↓
Primary user-facing cards
↓
Detail sections
↓
Diagnostics collapsed by default
```

The new sections do not start background delivery, auto-publish, AI analysis, provider fetch, scheduler work, or persistence changes. They only present existing read-only service output.

## Validation Checklist

Required before merge:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Manual checks after preview deploy:

- `/my-ixai/home` renders without route instability.
- Home still shows Hero, Morning Brief Summary, Portfolio Snapshot, Alerts, Market Snapshot, Quick Actions, Recent Activity, and collapsed diagnostics.
- Workspace Intelligence Summary renders read-only values.
- Today Focus does not use investment advice language.
- Notification Preview does not send any notification.
- Diagnostics remain collapsed by default.

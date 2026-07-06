# V17.4 Workspace Intelligence

Review date: 2026-07-06

## Purpose

V17.4 establishes the Workspace Intelligence Layer.

This release does not create a new Intelligence Engine. It aggregates and presents the output of existing V16 / V17 foundations:

- V16 Editorial Intelligence.
- V17.1 Asset Intelligence.
- V17.2 Monitoring Engine.
- V17.3 Notification Platform.

## Implemented Files

New library:

- `src/lib/intelligence/workspace/workspace-types.ts`
- `src/lib/intelligence/workspace/workspace-summary.ts`
- `src/lib/intelligence/workspace/workspace-risk-summary.ts`
- `src/lib/intelligence/workspace/workspace-focus.ts`
- `src/lib/intelligence/workspace/workspace-notification-preview.ts`
- `src/lib/intelligence/workspace/workspace-diagnostics.ts`
- `src/lib/intelligence/workspace/workspace-readiness.ts`
- `src/lib/intelligence/workspace/workspace-service.ts`
- `src/lib/intelligence/workspace/index.ts`

## Workspace Summary

`WorkspaceSummary` includes:

- overall health
- overall readiness
- asset summary
- monitoring summary
- editorial summary
- notification summary
- provider summary
- coverage
- quality
- last updated

It is an aggregation model for future Workspace surfaces.

## Today Focus

Workspace Today Focus directly reuses V17.2 Monitoring Today Focus.

Workspace only adds:

- aggregation
- ranking
- presentation model

It does not reimplement Today Focus or create a second focus engine.

## Risk Summary

`WorkspaceRiskSummary` includes:

- critical count
- warning count
- healthy asset count
- top risks
- affected assets
- affected FCNs

Risk Summary is monitoring awareness only. It does not provide investment advice.

## Notification Preview

`WorkspaceNotificationPreview` reuses V17.3 Notification Platform output.

It summarizes:

- pending
- suppressed
- urgent
- high
- normal
- low

It does not send notifications.

## Workspace Diagnostics

`WorkspaceDiagnostics` combines:

- asset diagnostics
- monitoring diagnostics
- provider diagnostics
- notification diagnostics
- editorial diagnostics
- workspace readiness

This is the operational aggregation layer for future read-only UI integration.

## Workspace Readiness

`WorkspaceReadiness` reports:

- green / yellow / red
- blocking issues
- warning issues
- next actions

Readiness combines asset, monitoring, provider, notification, and editorial states.

## Workspace Service Layer

The service layer exports:

- `getWorkspaceSummary()`
- `getWorkspaceTodayFocus()`
- `getWorkspaceRiskSummary()`
- `getWorkspaceNotificationPreview()`
- `getWorkspaceDiagnostics()`
- `getWorkspaceIntelligence()`

All helpers are pure and deterministic over supplied input.

## Integration Status

V17.4 is service-only.

It does not change:

- `/my-ixai`
- Workspace Home
- Dashboard UI
- Copilot
- Timeline
- Notification Center
- API routes
- database schema

Future work can add a read-only preview after the service contract is reviewed.

## Out of Scope

V17.4 explicitly does not add:

- Telegram
- LINE
- Email
- Push
- AI call
- Scheduler
- Trading
- Recommendation
- Billing
- Copilot Chat
- Timeline rewrite
- Database schema
- Migration
- new Monitoring Engine
- new Editorial Engine

## Validation

Required validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Recommended Step

V17.5 can add a read-only Workspace Intelligence preview or diagnostic panel, but only after V17.4 service contracts are reviewed.

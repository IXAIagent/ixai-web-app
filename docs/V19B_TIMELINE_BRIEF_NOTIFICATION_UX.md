# V19 Sprint B — Timeline, Morning Brief & Notifications UX

V19 Sprint B redesigns three Workspace information surfaces around one user question each:

- Timeline: What is happening next?
- Morning Brief: What happened?
- Notifications: What requires my attention?

This sprint changes page hierarchy and UX copy only. It does not change APIs, database, authentication, market providers, schedulers, Telegram, business logic, AI models, risk engine, FCN engine, or notification delivery.

## Old vs New

Before:

- Timeline could feel like a grouped technical schedule surface.
- Morning Brief exposed report cards, manual shell behavior, share/export controls, and implementation-adjacent framing.
- Notifications used notification-center language and mixed product alerts with delivery/system status.

After:

- Timeline shows Today, Tomorrow, and This Week as real user events only.
- Morning Brief reads as a short narrative report with Today's Summary, Portfolio, Markets, Risk, and Next sections.
- Notifications are grouped by attention: High, Medium, Information, Completed, and History.
- Technical source, runtime, provider, cache, diagnostics, and delivery details stay inside Advanced.

## Timeline

Mission:

```text
What is happening next?
```

Information hierarchy:

1. Next event answer.
2. Today.
3. Tomorrow.
4. This Week.
5. Event type summary.
6. Advanced diagnostics.

Timeline is not a system log, provider log, runtime log, or quote error feed.

## Morning Brief

Mission:

```text
What happened?
```

Information hierarchy:

1. Today's Summary with 3-5 bullet points.
2. Portfolio narrative.
3. Markets narrative.
4. Risk narrative.
5. Next / what to watch.
6. Advanced raw sections and quality details.

Removed from the reading layer:

- Copy markdown.
- Share markdown.
- Raw export.
- Manual shell copy.
- Rule-based wording.
- Provider wording.

## Notifications

Mission:

```text
What requires my attention?
```

Information hierarchy:

1. High priority.
2. Medium priority.
3. Information.
4. Completed.
5. History.
6. Advanced delivery/readback diagnostics.

Each attention card includes:

- Title.
- Why.
- Affects.
- Action.

Notifications are not a system alert log or developer event feed.

## Component Hierarchy

Modified:

- `components/timeline/timeline-experience-workspace.tsx`
- `components/notifications/notifications-experience-workspace.tsx`
- `app/my-ixai/morning-brief/page.tsx`

Added:

- `components/morning-brief/workspace-morning-brief-experience.tsx`

Advanced / diagnostic components remain available only below the primary user-facing layer.

## Future Extensions

Timeline:

- Add richer economic calendar and FCN event details once read models support them.

Morning Brief:

- Improve narrative quality and localization after the V19 UX pattern is stable.

Notifications:

- Add richer action routing once notification delivery and channel routing are explicitly scoped.

All future extensions must preserve the V19 rule: answer first, details second, diagnostics last.


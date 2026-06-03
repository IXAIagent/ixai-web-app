# IXAI Content Engine Architecture

Status: v1.62.0 architecture baseline.

This document describes the current Daily / Weekly / Social Pack content engine
architecture and the target separation needed before v1.62.1 implementation.

## 1. Current Architecture

```text
Public RSS / provider intake
→ NormalizedNewsItem[]
→ IXAI Insight Engine
→ Daily / Weekly draft
→ Editorial persistence
→ Public article / Social Pack
```

The architecture is strongest when each period owns its own narrative. It fails
when broad shared fallback fields become the public title, article thesis, and
social thesis for multiple periods or dates.

## 2. Daily Brief Current Flow

```text
getLatestNewsIntakeResult()
→ generateDailyIntelligenceDraftFromNews(newsItems)
→ generateDailyIntelligenceDraftWithOpenAI() or fallback
→ attachDailyContentEngine()
→ buildIXAIInsight({ period: "daily" })
→ questionDriven
→ title / marketSummary / sections / intelligence
→ saveDraftAsync()
```

Key source priority:

```text
Daily title
= questionDriven.centralQuestion
?? todayHeadline
```

Current risk:

- A broad deterministic `questionDriven.centralQuestion` can override an
  event-specific generated headline.
- Daily sections also use `questionDriven.keyAnswer`, `counterEvidence`,
  `watchNext`, and `ixuanView`.

## 3. Social Pack Current Flow

Daily Social:

```text
DailyBriefDraft
→ getDailyIntelligenceCoreFromBrief()
→ source.intelligence.insight.questionDriven
→ generateDailySocialPack()
```

Important fields:

- Slide 1: `questionDriven.centralQuestion`
- Slide 2: `questionDriven.keyAnswer` and `evidenceDetails`
- Slide 3: `questionDriven.counterEvidence`
- Slide 4: `questionDriven.watchNext`
- Slide 5: `questionDriven.ixuanView`

Weekly Social:

```text
WeeklyIntelligenceDraft
→ sections.periodicNarrative
→ sections.majorEvents
→ sections.upcomingWeek
→ sections.insight.questionDriven
→ generateWeeklySocialPack()
```

Current risk:

- Daily and Weekly are separated better than before v1.50.1, but both still use
  shared insight structures. If the shared insight structure falls back to the
  same AI / rates thesis, social assets can converge.

## 4. Weekly Intelligence Current Flow

```text
getWeeklyGenerationRange()
→ getLatestNewsIntakeResult()
→ getDraftsAsync()
→ buildWeeklyAggregationFromDailyCores()
→ weekly categorization / periodic narrative
→ buildIXAIInsight({ period: "weekly" })
→ Weekly draft sections
```

Expected rule:

```text
Weekly thesis source = weekly news + weekly events + next-week catalysts
Daily Core = continuity metadata only
```

Current risk:

- `dailyCoreAggregation` is still visible and persisted.
- Shared question-driven insight logic can make weekly output resemble the
  latest Daily output if not guarded by source priority and QA.

## 5. Provider Health Current Flow

```text
rssSources[]
→ fetchAndParseRssSource()
→ sourceStatus[]
→ getLatestNewsIntakeResult()
→ Provider Health / Coverage Score
```

Provider statuses:

- `success`
- `failed`
- `disabled`
- `fallback`
- `empty`

Provider classification:

- `production_active`
- `recoverable`
- `experimental`
- `deprecated`

Provider health should diagnose public Daily news intake only unless explicitly
documented otherwise.

## 6. Root Cause Matrix

| Layer | Current Failure Mode | Evidence | Architecture Fix |
| --- | --- | --- | --- |
| Insight | AI + macro branch can emit fixed Daily question | `build-insight.ts` hardcoded central question | Event-specific question builder. |
| Daily title | Title uses question before headline | `title: questionDriven.centralQuestion ?? todayHeadline` | Headline/question source contract. |
| Daily Social | Social directly uses Daily questionDriven | `generateDailySocialPack()` priority | Social-specific hook generation. |
| Weekly | Shared insight / Daily aggregation can leak similarity | `dailyCoreAggregation`, shared `questionDriven` | Weekly-events-first source contract. |
| Date key | UTC key can mismatch Taiwan product day | `toISOString().slice(0, 10)` | Asia/Taipei product-date helper. |
| Provider health | Quote/news provider paths can be conflated | Yahoo chart API vs Yahoo RSS vs yfinance | Separate provider categories. |

## 7. Target Architecture

```text
News intake
→ Event extraction
→ Period-aware narrative builder
→ Period-specific headline/question
→ Period-specific article draft
→ Period-specific social asset
```

Daily:

```text
Daily news
→ today's event
→ today's question
→ today's evidence
→ today's Social Pack
```

Weekly:

```text
Weekly news + upcoming events
→ weekly change
→ weekly thesis
→ next-week catalysts
→ weekly Social Pack
```

Social:

```text
Brief source material
→ slide-native social funnel
→ divergence / repetition QA
→ manual export
```

## 8. Narrative Diversification Contract

Each generated output must carry a narrative fingerprint:

```ts
{
  period: "daily" | "weekly",
  productDate: "YYYY-MM-DD",
  primaryEventKey: string,
  sourceEntityKeys: string[],
  centralQuestion: string,
  ixuanViewHash: string
}
```

v1.62.0 does not implement this object. It defines the contract so v1.62.1 can
implement a lightweight version or equivalent test helper.

## 9. Daily / Social Separation Contract

Daily article and Daily Social Pack can share evidence, but must not share the
same long-form copy without social rewrite.

Daily Social should use:

- one short hook;
- 2-3 specific evidence points;
- one risk contrast;
- 2-3 watch-next items;
- one short I-Xuan View plus CTA.

It should not use:

- full article summary;
- generic AI / rates thesis;
- identical previous-day question;
- identical previous-day I-Xuan View.

## 10. Weekly / Daily Separation Contract

Weekly must be distinguishable from Daily by source, question, and CTA.

Weekly Social Pack must fail QA if:

- Slide 1 question equals latest Daily Slide 1.
- Slide 2 evidence equals latest Daily Slide 2.
- Slide 5 I-Xuan View equals latest Daily Slide 5.
- Weekly Slide 4 does not contain next-week catalyst or equivalent upcoming
  event content when available.

## 11. Asia/Taipei Date Contract

Target helper:

```ts
getContentProductDate({
  now,
  timezone: "Asia/Taipei",
  period: "daily"
})
```

Expected outputs:

- `productDate`
- `slugDate`
- `displayDate`
- `generatedAtUtc`

Slug, draft lookup, and publish metadata should use the same product-date
contract.

## 12. Regression Test Requirements

v1.62.1 should add or update tests for:

- consecutive Daily narrative divergence;
- Daily Social Pack divergence;
- Weekly vs Daily Social Pack divergence;
- Asia/Taipei date-key behavior;
- provider disabled-reason visibility;
- no accidental provider activation;
- no auth / SSO / publish-flow changes.

## 13. Rollback Requirements

The Content Engine must remain rollback-friendly:

- Existing published content stays unchanged.
- New helpers should be additive or low-risk.
- Admin manual review remains the final publish gate.
- If date-key behavior changes, logs should expose both old UTC and new
  Asia/Taipei keys during rollout.

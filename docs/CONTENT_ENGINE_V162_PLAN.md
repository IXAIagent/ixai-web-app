# IXAI v1.62.0 — Content Intelligence Foundation Plan

Status: architecture / documentation only.

This version pauses SSO implementation work and establishes the Content Engine
foundation needed before another Daily / Weekly / Social Pack code change.

## 1. Why v1.62 Exists

The latest Daily Brief root-cause audit found that IXAI can still generate
highly similar Daily titles and Social Packs across adjacent dates. The issue is
not a single UI defect. It is a content architecture defect:

- Daily title source priority can hide the generated headline behind a repeated
  `questionDriven.centralQuestion`.
- `build-insight.ts` contains a deterministic AI + macro narrative branch.
- Daily Social Pack directly consumes Daily `questionDriven` fields.
- Weekly uses a separate weekly flow, but still shares the same insight builder
  and can carry similar AI / rates thesis language.
- Scheduler date keys and publish slugs currently use UTC date behavior in
  several places, which can conflict with the Asia/Taipei product day.

v1.62.0 does not fix these in code. It defines the architecture, regression
tests, and v1.62.1 implementation boundary.

## 2. Current Flow Summary

### Daily Brief

```text
News intake
→ getLatestNewsIntakeResult()
→ generateDailyIntelligenceDraftFromNews()
→ provider / fallback draft
→ attachDailyContentEngine()
→ buildIXAIInsight(period=daily)
→ questionDriven fields
→ Daily title / sections / persisted draft
```

Current highest-risk source priority:

```text
Daily title
= intelligence.insight.questionDriven.centralQuestion
?? intelligence.todayHeadline
```

### Daily Social Pack

```text
Persisted Daily draft
→ generateDailySocialPack()
→ source.intelligence.insight.questionDriven
→ Slide 1 / answer / evidence / risk / Slide 5
```

Current highest-risk source priority:

```text
Slide 1 = questionDriven.centralQuestion
Slide 5 = questionDriven.ixuanView
```

### Weekly Intelligence

```text
Weekly generation range
→ getLatestNewsIntakeResult()
→ weekly categorization / periodic narrative
→ upcoming-week calendar
→ buildIXAIInsight(period=weekly)
→ weekly sections / persisted weekly draft
```

Weekly also reads recent Daily drafts:

```text
getDraftsAsync()
→ buildWeeklyAggregationFromDailyCores()
→ dailyCoreAggregation continuity metadata
```

This aggregation is useful for continuity, but must not become the primary
weekly thesis source.

### Weekly Social Pack

```text
Persisted Weekly draft
→ generateWeeklySocialPack()
→ weekly periodicNarrative / majorEvents / upcomingWeek / insight
→ weekly-specific slides
```

Weekly Social Pack must stay period-specific:

- Slide 1: weekly question / biggest change.
- Slide 2: what changed this week.
- Slide 3: one week-level thesis.
- Slide 4: next-week catalysts.
- Slide 5: weekly I-Xuan View.

## 3. Root Cause Matrix

| Problem | Current Source | Risk | Required v1.62.1 Direction |
| --- | --- | --- | --- |
| Daily title repeats | `build-insight.ts` AI + macro fixed `centralQuestion` | High | Generate date/event-specific question. |
| Social Pack repeats | `generateDailySocialPack()` consumes Daily `questionDriven` directly | High | Add slide-native diversification and date-specific evidence source priority. |
| Provider headline hidden | Daily title prioritizes `questionDriven.centralQuestion` before `todayHeadline` | High | Rebalance title priority or derive question from headline/events. |
| Weekly similar to Daily | Shared `buildIXAIInsight()` templates and Daily aggregation metadata | Medium | Keep Weekly source priority weekly-events-first. |
| Date confusion | UTC `toISOString().slice(0, 10)` for daily keys / slugs | High | Add Asia/Taipei product-date key. |
| Provider diagnostics incomplete | Persisted `source_status` can be empty even when intelligence stores source details | Medium | Keep diagnostics visible in admin / QA. |
| Yahoo Finance confusion | App Daily news RSS disabled, but quote path still uses Yahoo chart API | Medium | Document provider roles separately. |
| Bloomberg confusion | Provider seed exists but not active due unverified public RSS access | Medium | Keep disabled until legal / stable access is verified. |

## 4. Narrative Diversification Design

Daily and Weekly must not rely on broad fixed themes such as "AI + rates" to
produce final headline, question, and I-Xuan View.

### Daily Diversification

Daily question generation should use this priority:

1. Highest-scored event title and source.
2. Event-specific signal.
3. What changed versus previous brief.
4. Time-sensitive watchpoint.
5. Editorial-safe fallback.

Daily output must answer:

```text
What happened today?
What changed today?
Why does today's evidence matter?
What should be watched next?
```

Daily must not answer a generic multi-week thesis unless the actual day's news
supports that thesis with concrete evidence.

### Weekly Diversification

Weekly question generation should use this priority:

1. Weekly major events.
2. Weekly theme rotation / extension / reversal.
3. Upcoming-week catalysts.
4. Weekly periodic narrative.
5. Weekly-only fallback.

Weekly output must answer:

```text
What changed this week?
What one thesis matters for next week?
Which catalysts can validate or invalidate it?
```

Weekly should not reuse the Daily central question or Daily I-Xuan View with a
period label changed.

## 5. Daily / Social Separation Design

Social Pack may derive from Daily, but it must not simply mirror the Daily
question-driven object.

Required separation:

```text
Daily Brief = article interpretation
Daily Social Pack = social entry asset
```

Daily Social Pack source priority:

1. Daily date-specific hook.
2. Specific evidence items from current news.
3. Risk / counter-evidence from current news.
4. Near-term watch-next items.
5. Short I-Xuan View and contextual CTA.

Social Pack must pass a same-day role check:

- Slide 1 introduces a question.
- Slide 2 introduces evidence.
- Slide 3 introduces risk / contrast.
- Slide 4 introduces watch-next.
- Slide 5 introduces viewpoint + CTA.

Slides should not repeat the same thesis in different words.

## 6. Weekly / Daily Separation Design

Weekly may use Daily Core only as continuity metadata.

Weekly must not use:

- Daily `centralQuestion` as weekly question.
- Daily evidence lines as weekly Slide 2 evidence unless they are part of a
  week-level event cluster.
- Daily I-Xuan View as weekly I-Xuan View.
- Daily aggregation as the primary weekly thesis.

Weekly source priority:

```text
weekly majorEvents
→ weekly categorized headlines
→ upcomingWeek catalysts
→ periodic weekly narrative
→ weekly insight
→ dailyCoreAggregation only as secondary continuity
```

## 7. Asia/Taipei Date Key Design

Daily Intelligence is a Taiwan-market-facing product and should use an explicit
product date.

Current risk:

```text
new Date().toISOString().slice(0, 10)
```

This is UTC. A cron at `23:30 UTC` is `07:30 Asia/Taipei` on the next local day,
but the UTC date can still produce the previous calendar date.

Target design:

```text
getProductDateKey({ timezone: "Asia/Taipei" })
→ YYYY-MM-DD
```

Rules:

- Daily generation slug should use the product date key.
- Existing draft lookup should use the same product date key.
- Publish slug should not silently drift between UTC and Taiwan date.
- Admin should display both generatedAt UTC and productDate Asia/Taipei.
- Latest API should make productDate visible for diagnostics.

## 8. Provider Health Scope

Provider health should separate:

1. Public Daily news providers.
2. Public market quote providers.
3. Backend / legacy Pro portfolio news providers.
4. Backend / legacy Pro quote providers.

These are not the same pipeline.

Example:

- App Daily `Yahoo Finance` RSS is disabled.
- App market quote `Yahoo Finance` chart API remains active for quotes.
- Backend / Legacy Pro uses yfinance / Yahoo provider paths for portfolio news
  and market data.

v1.62.1 should not merge these paths. It should only document and test them
clearly.

## 9. Regression Test Plan

Minimum tests for v1.62.1:

### Daily Narrative Regression

- Generate two consecutive Daily drafts with overlapping AI + macro categories
  but different source events.
- Assert titles are not identical.
- Assert `centralQuestion` is not the same hardcoded AI/rates question.
- Assert `todayHeadline` or top event affects title/question.

### Daily Social Regression

- Generate Daily Social Pack from each draft.
- Assert Slide 1 differs between dates.
- Assert Slide 5 does not reuse identical I-Xuan View.
- Assert concrete evidence appears on Slide 2 / Slide 3.

### Weekly Separation Regression

- Generate Weekly draft with dailyCoreAggregation available.
- Assert Weekly question is not equal to latest Daily question.
- Assert Weekly Slide 4 uses upcoming-week catalysts when available.
- Assert Weekly I-Xuan View is not copied from Daily I-Xuan View.

### Date Key Regression

- Freeze time around Asia/Taipei morning and UTC previous day.
- Assert product date key matches Asia/Taipei.
- Assert slug and existing-draft lookup use the same key.

### Provider Health Regression

- Assert disabled providers report explicit reasons.
- Assert Yahoo Finance RSS disabled reason remains visible.
- Assert Bloomberg disabled reason remains visible.
- Assert App quote provider does not get treated as App Daily news provider.

## 10. v1.62.1 Implementation Scope

Allowed files for v1.62.1 should be limited to content-engine code and tests:

- `src/lib/intelligence/insight/build-insight.ts`
- `src/lib/intelligence/generator.ts`
- `src/lib/intelligence/social/social-intelligence-pack.ts`
- `src/lib/editorial/scheduler.ts`
- `src/lib/editorial/repository.ts` only if date-key lookup requires it.
- `src/lib/news/providers.ts` only for diagnostics / provider-health reporting,
  not provider activation.
- `src/types/editorial.ts` only if productDate diagnostics are added.
- Tests / QA scripts for Daily, Social, Weekly, date key, and provider health.
- Docs updates.

Explicitly out of scope:

- Auth / SSO implementation.
- LINE / LIFF.
- Supabase schema migration.
- Weekly revision schema.
- Provider activation.
- Bloomberg / Yahoo scraping.
- Social Pack UI redesign.
- Publish flow rewrite.

## 11. Rollback Plan

If v1.62.1 introduces content regressions:

1. Revert only the content-engine commit.
2. Keep this v1.62.0 documentation in place.
3. Disable new date-key behavior behind a compatibility fallback if needed.
4. Keep previous Daily publish rows untouched.
5. Do not delete existing published Daily / Weekly content.
6. Preserve admin/manual publish review as the final gate.

## 12. Success Criteria

v1.62.1 can proceed only if:

- Consecutive Daily Briefs with overlapping AI / macro categories produce
  date-specific titles.
- Daily Social Pack no longer repeats identical Slide 1 / Slide 5 across
  adjacent dates.
- Weekly Social Pack remains weekly-specific.
- Asia/Taipei product date is explicit.
- Provider disabled reasons remain visible and accurate.
- No auth, SSO, publish, or provider activation code is touched.

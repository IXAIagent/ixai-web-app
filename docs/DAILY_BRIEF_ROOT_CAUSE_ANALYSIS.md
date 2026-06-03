# Daily Brief Root Cause Analysis

Date: 2026-06-03
Scope: investigation only. No code fix, no commit, no push.

## Executive Verdict

The 2026-06-02 and expected 2026-06-03 Daily Brief / Social Pack similarity is caused by two separate issues:

1. **Production does not currently expose a published `daily-intelligence-2026-06-03` Daily Brief.**
   The public API latest brief is still `daily-intelligence-2026-06-02`. The route `/daily-brief/daily-intelligence-2026-06-03` returns a page shell with "Daily Brief Not Found" rather than a real published 2026-06-03 article.

2. **When a Daily Brief contains both AI and macro/rates signals, the Insight Engine uses a hardcoded question-driven thesis.**
   This branch returns the same `centralQuestion`, `keyAnswer`, and `ixuanView`:
   - `AI 股還在漲，為什麼市場反而更挑剔？`
   - `資金沒有離開 AI，但開始只買能證明獲利、訂單與資本支出的 AI。`
   - `一玄觀點：下一階段不是買 AI 故事，而是看誰能把 AI 變成現金流...`

Because the Daily public title prioritizes `intelligence.insight.questionDriven.centralQuestion`, the repeated hardcoded question becomes the public title. The Daily Social Pack then directly derives Slide 1 and Slide 5 from the same question-driven object, so the Social Pack repeats the same thesis.

This is not primarily a UI issue. It is a Daily Insight / Social Pack source-priority issue plus a production-date/publication availability issue.

## Production Checks

### Public Daily Brief List

Checked:

```bash
curl -sS "https://app.ixuan.ai/api/daily-briefs"
```

Result summary:

```json
{
  "latest": {
    "slug": "daily-intelligence-2026-06-02",
    "title": "AI 股還在漲，為什麼市場反而更挑剔？",
    "publishedAt": "2026-06-02T15:47:08.172+00:00",
    "status": "published"
  },
  "recentSlugs": [
    "daily-intelligence-2026-06-02",
    "daily-intelligence-2026-05-31",
    "daily-intelligence-2026-05-30",
    "daily-intelligence-2026-05-29",
    "daily-intelligence-2026-05-28"
  ]
}
```

### 2026-06-03 Slug Check

Checked:

```bash
curl -sS "https://app.ixuan.ai/api/daily-briefs?slug=daily-intelligence-2026-06-03"
```

Result:

```json
{
  "hasBrief": false,
  "hasIntelligence": false,
  "brief": null
}
```

Conclusion: no public persisted/published 2026-06-03 Daily Brief was found through the public API.

### 2026-06-02 Narrative Source

Checked:

```bash
curl -sS "https://app.ixuan.ai/api/daily-briefs?slug=daily-intelligence-2026-06-02"
```

Relevant fields:

```json
{
  "slug": "daily-intelligence-2026-06-02",
  "title": "AI 股還在漲，為什麼市場反而更挑剔？",
  "todayHeadline": "AI推動科技擴張與就業熱潮，市場風險偏好分歧加劇",
  "centralQuestion": "AI 股還在漲，為什麼市場反而更挑剔？",
  "keyAnswer": "資金沒有離開 AI，但開始只買能證明獲利、訂單與資本支出的 AI。",
  "ixuanView": "一玄觀點：下一階段不是買 AI 故事，而是看誰能把 AI 變成現金流。資金沒有離開 AI，但它會更挑剔：有訂單、有毛利、有現金流證據的公司，才有機會繼續取得溢價。"
}
```

Important observation: `todayHeadline` is different from the public `title`. The public title is not the provider headline; it is the question-driven `centralQuestion`.

## Daily Narrative Generation Flow

```text
News Intake
  ↓
src/lib/news/providers.ts:getLatestNewsIntakeResult()
  ↓
src/lib/intelligence/generator.ts:generateDailyIntelligenceDraftFromNews()
  ↓
AI provider output or fallback draft
  ↓
src/lib/intelligence/generator.ts:attachDailyContentEngine()
  ↓
src/lib/intelligence/insight/build-insight.ts:buildIXAIInsight()
  ↓
questionDriven centralQuestion / keyAnswer / ixuanView
  ↓
Daily Brief title / sections / intelligence fields
  ↓
src/lib/editorial/persistence.ts saves persisted draft
```

Key files:

- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/news/providers.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/generator.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/insight/build-insight.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/persistence.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/repository.ts`

### Title Source

In `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/generator.ts:907-912`:

```ts
return {
  id: `generated-${slug}`,
  slug,
  status: "review",
  title: intelligence.insight?.questionDriven.centralQuestion ?? intelligence.todayHeadline,
  ...
};
```

Therefore the Daily title directly prioritizes `questionDriven.centralQuestion`.

### Repeated Question Source

In `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/insight/build-insight.ts:307-350`, the branch:

```ts
if (hasAi && hasMacro) {
  const daily: QuestionDrivenInsight = {
    centralQuestion: "AI 股還在漲，為什麼市場反而更挑剔？",
    keyAnswer: "資金沒有離開 AI，但開始只買能證明獲利、訂單與資本支出的 AI。",
    ixuanView: "一玄觀點：下一階段不是買 AI 故事，而是看誰能把 AI 變成現金流..."
  };
}
```

This is the primary deterministic cause of repeated Daily titles when the intake contains both AI and macro/rates categories.

### Additional Generic Daily Templates

In `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/generator.ts:167-195`, `buildTodaySignal()` returns fixed phrases for AI + macro, AI-only, and macro/risk-only conditions.

In `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/generator.ts:197-230`, `buildTopThreeThings()` uses a fixed Macro / AI / Risk-or-Taiwan structure.

These templates amplify the repetition, but the title and Social Pack sameness comes mainly from the question-driven branch.

## Social Pack Generation Flow

```text
Persisted Daily Brief Draft
  ↓
src/lib/intelligence/social/social-intelligence-pack.ts:generateDailySocialPack()
  ↓
getDailyIntelligenceCoreFromBrief()
  ↓
source.intelligence.insight.questionDriven
  ↓
Slide 1 socialTitle = questionDriven.centralQuestion
Slide 2/3 evidence = questionDriven.evidenceDetails
Slide 5 dailyInsight = questionDriven.ixuanView
```

In `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/social/social-intelligence-pack.ts:295-349`:

- `socialTitle` uses `questionDriven?.centralQuestion`
- `shortAnswer` uses `questionDriven?.keyAnswer`
- `dailyEvidence` uses `questionDriven?.evidenceDetails`
- `riskCopy` uses `questionDriven?.counterEvidence[0]`
- `dailyInsight` uses `questionDriven?.ixuanView`

Conclusion: the Daily Social Pack directly uses the Daily narrative. It is expected to match the Daily title/thesis. The bug is that the Daily narrative itself can become deterministic and repeated across days.

## Weekly Aggregation Flow

```text
Weekly generation
  ↓
src/lib/editorial/weekly.ts:generateWeeklyIntelligenceDraft()
  ↓
getLatestNewsIntakeResult()
  ↓
getDraftsAsync()
  ↓
buildWeeklyAggregationFromDailyCores(recentDailyBriefs)
  ↓
weekly periodic narrative + weekly insight
  ↓
weekly sections / weekly social pack
```

In `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/weekly.ts:1220-1222`:

```ts
const intake = await getLatestNewsIntakeResult();
const recentDailyBriefs = await getDraftsAsync();
const dailyCoreAggregation = buildWeeklyAggregationFromDailyCores(recentDailyBriefs);
```

The Weekly generator does read recent Daily Core data for aggregation/debug/continuity. It also uses current news intake and weekly narrative helpers. Weekly aggregation is not the direct cause of the 2026-06-02 / 2026-06-03 Daily title repetition, but it is a secondary risk because Weekly and Daily still share the same underlying insight builder and broad AI/macro thesis language.

## Cache / Persistence / Reuse Findings

### News Intake Cache

In `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/news/providers.ts:822-827`, `getLatestNewsIntakeResult()` reuses `cachedResult` only when it is within `NEWS_CACHE_TTL_MS`.

Observed TTL: three minutes.

Conclusion: this cache cannot explain a 24-hour Daily Brief repetition by itself.

### Persistence Layer

Daily drafts are persisted through:

- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/persistence.ts`
- Supabase table: `ixai_daily_intelligence_drafts`

`draftToRow()` stores the full `intelligence` object but currently writes `source_status: []` at `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/persistence.ts:65-85`. This means source diagnostics may be less visible after persistence, but it does not directly cause repeated titles.

### Local / Server Draft Reuse

`/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/repository.ts` keeps:

- localStorage drafts under `ixai.editorial.dailyBriefDrafts.v1`
- module-level `serverDrafts`
- Supabase persisted drafts
- static local seed drafts

This can affect admin/local preview behavior, but the production public API result for 2026-06-02 comes from the persisted published row.

### Existing Draft Reuse

In `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/scheduler.ts:75-101`, scheduled generation checks:

```ts
const dateKey = todayKey();
const existingDraft = await findDraftForDateAsync(dateKey);
...
if (existingDraft && !force) {
  return status: "existing";
}
```

This means a same-date existing draft blocks regeneration unless `force` is true.

### UTC Date Key Risk

In `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/scheduler.ts:13-15`:

```ts
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
```

The cron schedule in `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/vercel.json` is:

```json
{
  "path": "/api/admin/daily-briefs/generate",
  "schedule": "30 23 * * *"
}
```

`23:30 UTC` is `07:30 Asia/Taipei` on the next calendar day. Because `todayKey()` uses UTC, a Taiwan-morning Daily job can still create the previous UTC date slug. This can cause operational confusion where the Taiwan date is 2026-06-03 but the generated slug remains `daily-intelligence-2026-06-02`.

## Per-Date Narrative Source

### 2026-06-02

Source status from public API:

- Published slug exists: `daily-intelligence-2026-06-02`
- Published at: `2026-06-02T15:47:08.172+00:00`
- Public title: `AI 股還在漲，為什麼市場反而更挑剔？`
- Provider/AI headline inside intelligence: `AI推動科技擴張與就業熱潮，市場風險偏好分歧加劇`
- Effective title source: `intelligence.insight.questionDriven.centralQuestion`
- Effective Social Pack source: `source.intelligence.insight.questionDriven`

Therefore the 2026-06-02 narrative source is a persisted published draft whose final public title is determined by the deterministic question-driven insight branch, not the provider headline.

### 2026-06-03

Source status from public API:

- No public published brief found for `daily-intelligence-2026-06-03`
- `/api/daily-briefs?slug=daily-intelligence-2026-06-03` returns no brief
- `/daily-brief/daily-intelligence-2026-06-03` renders a not-found client shell rather than a real article

Therefore there is no confirmed public 2026-06-03 narrative source from the production public API. If a 2026-06-03 draft exists in admin/review/local storage, it is not visible through the public API checked during this audit.

## Specific Questions Answered

### Does the daily title directly reuse the previous title?

No direct previous-title copy path was found.

The repeated title is better explained by this deterministic source priority:

```text
Daily title
  = intelligence.insight.questionDriven.centralQuestion
  = hardcoded AI + macro daily centralQuestion
```

### Does Social Pack directly reuse Daily narrative?

Yes.

The Daily Social Pack is intentionally derived from the Daily Brief object. It uses:

- `questionDriven.centralQuestion` for Slide 1 / title
- `questionDriven.keyAnswer` for the short answer
- `questionDriven.evidenceDetails` for evidence
- `questionDriven.counterEvidence` for risk
- `questionDriven.ixuanView` for Slide 5

Therefore repeated Daily narrative creates repeated Social Pack content.

### Is there a narrative cache?

No long-lived narrative cache was found.

There is a short news-intake cache in `getLatestNewsIntakeResult()`, but it is only a few minutes and does not explain multi-day repetition.

### Is there a persistence layer?

Yes.

Daily drafts are persisted in Supabase through `src/lib/editorial/persistence.ts`, with fallback/local draft support in `src/lib/editorial/repository.ts`.

### Is there previous draft reuse?

Yes, but only same-date reuse was found in the scheduler:

- If a draft exists for `todayKey()`, scheduled generation returns the existing draft unless forced.
- `todayKey()` is UTC-based, which can mismatch the Taiwan product day.

No direct "reuse previous day's title" logic was found.

## Root Cause

Primary root cause:

**The Daily question-driven insight branch for AI + macro inputs is hardcoded and reused across days.**

File:

`/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/insight/build-insight.ts`

Function area:

`buildQuestionDrivenInsight()` / AI + macro branch around lines `307-350`.

Data object:

`QuestionDrivenInsight`

Repeated fields:

- `centralQuestion`
- `keyAnswer`
- `ixuanView`
- `watchNext`
- `whatChangesMyMind`

Secondary root causes:

1. **Daily title source priority hides the actual provider headline.**
   `title` uses `questionDriven.centralQuestion` before `todayHeadline`.

2. **Daily Social Pack directly derives from the same Daily question-driven insight.**
   This makes Slide 1 and Slide 5 repeat when `questionDriven` repeats.

3. **UTC-based scheduler date key can create or reuse a previous UTC-date slug during Taiwan-morning operations.**
   This can explain why the latest public production brief remains `2026-06-02` when the local product day is `2026-06-03`.

4. **The 2026-06-03 public brief is not present in the public API.**
   The similarity report may be comparing the latest 2026-06-02 content against a missing 2026-06-03 route, admin draft, local draft, or social pack generated from the same deterministic branch.

## Recommended Next Investigation / Fix Direction

No fix was implemented in this audit.

Recommended future fix areas:

1. Make Daily `centralQuestion` event-specific instead of hardcoded for `hasAi && hasMacro`.
2. Change Daily title source priority so the public title can reflect the actual generated headline or a date-specific headline hook.
3. Make Daily Social Pack Slide 1 derive from date-specific event/question fields, not a static AI+macro question.
4. Add a period/date divergence QA check for consecutive Daily briefs.
5. Replace UTC `todayKey()` with an explicit product timezone date key or make scheduler/admin date behavior visible.
6. Return true 404 or clearer UX for missing Daily Brief slugs to avoid confusing a missing page with a real generated article.

## Files Inspected

- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/generator.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/ai-provider.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/core/daily-intelligence-core.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/insight/build-insight.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/insight/evidence-quality.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/insight/extract-events.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/insight/extract-signals.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/social/social-intelligence-pack.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/memory/market-memory.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/intelligence/periodic/periodic-narrative.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/news/providers.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/repository.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/persistence.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/scheduler.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/editorial/weekly.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/app/api/admin/daily-briefs/generate/route.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/app/api/admin/daily-briefs/draft/route.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/app/api/daily-briefs/route.ts`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/app/daily-brief/[slug]/page.tsx`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/components/daily-brief/daily-brief-local-detail.tsx`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/components/admin/social-intelligence-pack-studio.tsx`
- `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/vercel.json`

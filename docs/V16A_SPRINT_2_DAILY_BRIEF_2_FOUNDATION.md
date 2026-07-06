# V16A Sprint 2 — Daily Brief 2.0 Foundation

Status: implemented.

Scope: V16A AI Financial Media only.

This sprint connects the Sprint 1 Editorial Architecture Foundation into the first deterministic Daily Brief 2.0 pipeline.

## 1. Why

V16A needs Daily Brief to become AI Curated Financial Media instead of a generic news list.

Daily Brief must answer:

```text
今天市場最重要的是什麼？
```

It must not answer:

```text
今天哪些事情影響我的投資？
```

That belongs to V16B Workspace Monitoring and remains out of scope.

## 2. What Changed

Added Daily Brief 2.0 foundation under:

- `src/lib/editorial/daily-brief/daily-brief-types.ts`
- `src/lib/editorial/daily-brief/daily-brief-builder.ts`
- `src/lib/editorial/daily-brief/daily-brief-mock-source.ts`
- `src/lib/editorial/daily-brief/daily-brief-diagnostics.ts`
- `src/lib/editorial/daily-brief/index.ts`

Updated:

- `src/lib/editorial/index.ts`
- `app/daily-brief/page.tsx`
- `components/admin/daily-briefs-admin.tsx`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_MAP.md`
- `docs/VERSION_HISTORY.md`

## 3. Pipeline

Implemented deterministic foundation pipeline:

```text
Mock / Existing Editorial Source
↓
Normalize Story
↓
Story Ranking
↓
Topic Ranking
↓
Daily Brief Builder
↓
Daily Brief 2.0 Snapshot
↓
Public / Admin Preview Integration
```

No external provider fetch is performed.

No AI model call is performed.

No scheduler or publish behavior is changed.

## 4. Daily Brief 2.0 Snapshot Contract

The snapshot includes:

- Brief date.
- Version.
- Title.
- Subtitle.
- Market pulse.
- Today Focus.
- Ranked topics.
- Ranked stories.
- Key narratives.
- Risk / uncertainty notes.
- Source coverage.
- Quality signals.
- Fallback state.
- Publication readiness.
- Generated at.
- No-investment-advice disclaimer.

The canonical snapshot type is `DailyBrief2Snapshot`.

## 5. Mock / Existing Editorial Source

Sprint 2 uses deterministic mock source input only.

The mock source covers:

- Macro story.
- US equity story.
- Taiwan market story.
- Crypto story.
- FCN / structured product relevance story.
- Risk / volatility story.
- Duplicate story suppression path.

The mock source is intentionally provider-neutral and does not fetch external data.

## 6. Normalization

Mock source output is not consumed directly by downstream logic.

All source items pass through Sprint 1 normalization:

- `normalizeEditorialStories`
- `EditorialStory`
- `EditorialSource`

Downstream Daily Brief 2.0 builder consumes normalized IXAI-owned editorial objects.

## 7. Story Ranking

Story ranking uses Sprint 1 deterministic ranking:

- Importance.
- Freshness.
- Market relevance.
- Duplication risk.
- Source confidence.

Daily Brief 2.0 exposes:

- Top ranked stories.
- Importance.
- Freshness.
- Relevance.
- Duplication risk.
- Source confidence.
- Ranking explanation.

## 8. Topic Ranking

Topic ranking uses Sprint 1 deterministic topic grouping:

- Topic importance.
- Story count.
- Source diversity.
- Market impact.
- Topic summary.

Daily Brief 2.0 exposes ranked topics for Today Focus and key narratives.

## 9. Daily Brief Builder

The builder produces:

### Today Focus

Up to 3 items.

Each item includes:

- Title.
- Summary.
- Why it matters.
- Related topic.
- Related stories.
- Confidence.
- Risk note when relevant.

### Market Pulse

Includes:

- Market tone.
- Major drivers.
- Uncertainty level.
- Source coverage status.

### Key Narratives

Includes:

- Narrative title.
- Narrative body.
- Supporting topics.
- Supporting stories.
- Confidence.
- Limitation note.

### Risk / Uncertainty Notes

Includes:

- Data gap.
- Low confidence.
- Missing AI provider.
- Duplicate story suppression.
- High volatility / macro uncertainty.
- Social Pack unavailable.
- Publish unavailable.

## 10. Fallback / Degradation Behavior

Supported fallback:

- No stories -> limited brief.
- Low source confidence -> limited coverage.
- Duplicate-heavy source -> suppress duplicates.
- No AI provider -> rule-based narrative only.
- Missing topic coverage -> limited topic coverage.
- Social Pack unavailable -> core brief still ready for preview.
- Publish unavailable -> preview still generated.

Core principle:

```text
Provider failure must degrade intelligence, not crash the product.
外部來源失敗，只能讓內容降級，不能讓產品停擺。
```

## 11. Diagnostics

Daily Brief 2.0 diagnostics include:

- Source count.
- Normalized story count.
- Ranked story count.
- Topic count.
- Deduped story count.
- Low confidence count.
- Fallback state.
- Provider independence status.
- AI dependency status.
- Publication dependency status.
- Public brief readiness.

## 12. Integration Points

Public preview:

- `/daily-brief` includes a read-only Daily Brief 2.0 Foundation Preview section.
- Existing published Daily Brief archive and public readback remain unchanged.

Admin preview:

- `/admin/daily-briefs` includes a read-only Daily Brief 2.0 Foundation Preview in the Daily desk.
- Existing Daily generate, review, publish, health, scheduler, and Social Pack workflows remain unchanged.

## 13. Validation

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## 14. Out of Scope

This sprint does not add:

- V16B Workspace Monitoring.
- Portfolio-aware monitoring.
- Telegram / LINE / Email delivery.
- Scheduler auto-publish.
- External news provider fetch.
- OpenAI / Claude / Gemini / AI SDK call.
- DB schema / migration.
- Trading.
- Buy / sell / hold.
- Target price.
- Rebalance.
- Investment recommendation.
- Billing / subscription enforcement.

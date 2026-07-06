# V16A Sprint 1 — Editorial Architecture Foundation

Status: implemented as contract-first foundation.

Scope: V16A AI Financial Media only.

This sprint does not implement V16B Workspace Monitoring.

## 1. Objective

V16A Sprint 1 establishes the editorial architecture foundation for Daily / Weekly Brief as AI Financial Media.

The product question is:

```text
今天市場發生什麼？
```

This sprint does not answer:

```text
今天哪些事情影響我的投資？
```

That question belongs to V16B Workspace Monitoring and remains out of scope.

## 2. V15.2.1 Verification

Source-level verification confirms V15.2.1 Brief Publish Reliability Hotfix is present in the codebase:

- Admin Daily health derives from persisted draft rows through `buildDailyBriefPublishHealth`.
- Admin Weekly health derives from persisted weekly draft rows through `buildWeeklyBriefPublishHealth`.
- Daily API returns latest published, latest draft/review, stale published state, and draft/publish gap.
- Daily draft generation returns persistence metadata.
- Daily manual publish uses `publishDraftWithPersistenceStatusAsync`.
- Daily manual publish returns `502 persistence_failed` when configured Supabase write fails and memory fallback is not public-readback visible.
- Weekly generate/list/publish responses include publish health.
- Weekly generation surfaces durable persistence failures rather than showing phantom drafts.
- Scheduler status remains explicit: scheduler creates review drafts only; human publish remains required.
- Social Pack remains downstream optional and does not block core Brief publication.

No V15.2.1 production blocker was found in the source-level verification.

## 3. Architecture Boundary

V16A Sprint 1 is contract-first and deterministic.

It adds:

- Editorial domain types.
- Normalization contracts.
- Story ranking foundation.
- Topic ranking foundation.
- Narrative model foundation.
- Fallback / degradation behavior.
- Editorial diagnostics helper.

It does not add:

- External news provider fetch.
- AI model call.
- Scheduler auto-publish.
- Telegram / LINE / Email delivery.
- DB schema.
- Migration.
- Trading.
- Recommendation.
- Billing.
- V16B Workspace Monitoring.

## 4. Source Architecture

V16A source architecture remains:

```text
Source Layer
↓
Normalization
↓
Story Ranking
↓
Topic Ranking
↓
Editorial AI
↓
Daily Brief / Weekly Brief
```

Sprint 1 implements the deterministic foundation through `EditorialBrief` and rule-based narrative output. `Editorial AI` remains a future layer and is not called in this sprint.

## 5. Domain Contracts

Added contracts:

- `EditorialSource`
- `EditorialStory`
- `EditorialTopic`
- `EditorialNarrative`
- `EditorialBrief`
- `EditorialQualitySignal`
- `EditorialFailureState`
- `RawEditorialProviderItem`
- `EditorialPipelineDiagnostics`

These contracts are IXAI-owned and provider-neutral. Downstream code should not depend on provider-specific response shapes.

## 6. Normalization Foundation

`editorial-normalization.ts` converts future provider output into IXAI-owned editorial objects.

It supports:

- Source normalization.
- Story normalization.
- Confidence scoring.
- Freshness scoring.
- Market relevance scoring.
- Failure state construction.

The normalization layer does not fetch external data.

## 7. Story Ranking Foundation

`story-ranking.ts` provides deterministic ranking using:

- Importance.
- Freshness.
- Market relevance.
- Duplication risk.
- Source confidence.

Duplicate stories are suppressed before ranking.

## 8. Topic Ranking Foundation

`topic-ranking.ts` groups ranked stories into topics and scores:

- Topic importance.
- Story count.
- Source diversity.
- Market impact.

This produces a deterministic editorial topic order for Daily / Weekly narrative construction.

## 9. Narrative Model Foundation

`narrative-builder.ts` builds:

- Daily narrative shape.
- Weekly narrative shape.
- Market summary placeholder.
- Why-it-matters placeholder.
- Compliance note.
- Rule-based limited brief fallback.

The narrative uses monitoring / awareness language only and avoids investment advice wording.

## 10. Fallback / Degradation Behavior

Supported degradation:

- No sources -> limited brief.
- Low confidence -> limited coverage.
- Duplicate stories -> dedupe / suppress.
- Missing AI provider -> rule-based summary only.
- Social Pack failure -> non-blocking downstream state.

Provider failure must degrade intelligence, not crash the product.

```text
外部來源失敗，只能讓內容降級，不能讓產品停擺。
```

## 11. Diagnostics Foundation

`editorial-diagnostics.ts` reports:

- Editorial pipeline readiness.
- Provider independence status.
- Fallback readiness.
- Brief publication dependency status.
- Source count.
- Story count.
- Topic count.
- Failure states.

Diagnostics are pure helpers and do not call external systems.

## 12. Files Added

- `src/lib/editorial/editorial-types.ts`
- `src/lib/editorial/editorial-normalization.ts`
- `src/lib/editorial/story-ranking.ts`
- `src/lib/editorial/topic-ranking.ts`
- `src/lib/editorial/narrative-builder.ts`
- `src/lib/editorial/editorial-diagnostics.ts`
- `src/lib/editorial/index.ts`
- `docs/V16A_SPRINT_1_EDITORIAL_ARCHITECTURE_FOUNDATION.md`

## 13. Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`

## 14. Next Steps

Recommended next V16A work:

1. Add minimal unit coverage for deterministic ranking and fallback behavior.
2. Wire editorial diagnostics into an admin read-only status panel.
3. Define V16A Sprint 2 Daily Brief 2.0 structure.
4. Audit existing Daily / Weekly provider source contracts before adding any provider integration.

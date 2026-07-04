# V16 Editorial Architecture

This document defines the V16A AI Financial Media architecture gate before Daily / Weekly implementation work.

## 1. Product Boundary

Public Daily / Weekly Brief is AI Curated Financial Media.

It answers:

```text
今天市場發生什麼？
```

Workspace answers:

```text
今天哪些事情影響我的投資？
```

Daily / Weekly Brief is not a free Workspace and not a generic news list.

## 2. Source Strategy

Public Daily / Weekly Brief must not bind to a single news provider.

Editorial architecture:

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

Potential sources include:

- Yahoo.
- Google News.
- 富途.
- Bloomberg.
- Reuters.
- 鉅亨網.
- 商業週刊.
- RSS.
- Exchange announcements.
- Company filings.
- Crypto sources.

## 3. Curated Relevance

IXAI's value is not news volume.

IXAI's value is:

- Selecting what matters.
- Ranking what matters.
- Explaining why it matters.
- Avoiding duplicated stories.
- Avoiding filler content.
- Creating a daily / weekly habit.

Daily Brief answers:

```text
今天市場真正重要的是什麼？
```

Weekly Brief answers:

```text
本週真正重要的是什麼？
下週最值得注意的是什麼？
```

## 4. Failure Degradation

Provider failure must degrade editorial output, not stop publication.

Examples:

- News source failure -> cached / limited brief.
- AI provider failure -> rule-based limited summary.
- Single topic source failure -> omit or mark limited coverage.
- Social Pack failure -> must not block core Brief publication.

## 5. Editorial Audit

Before V16A implementation, audit:

- Existing Daily Brief sources.
- Existing Weekly Brief sources.
- Admin editorial flow.
- Scheduler / Vercel Cron behavior.
- Social Pack dependency.
- Public route readback.
- Provider fallback.
- AI fallback.
- Cache / previous brief fallback.

## 6. Out of Scope

This document does not authorize:

- Investment advice.
- Trading signals.
- Buy / sell / hold recommendations.
- Provider lock-in.
- New AI calls before architecture approval.
- New DB schema without explicit review.

# IXAI OpenAI Daily Intelligence Engine

v1.11 adds an optional server-side OpenAI synthesis layer for Daily Intelligence drafts.

## Environment

Set this only in server environments such as Vercel Project Environment Variables:

```bash
OPENAI_API_KEY=sk-...
```

Optional model override:

```bash
OPENAI_DAILY_INTELLIGENCE_MODEL=gpt-4.1-mini
```

Do not expose the API key to the client and do not prefix it with `NEXT_PUBLIC_`.

## Flow

```text
RSS / normalized news intake
→ OpenAI structured synthesis
→ Daily Intelligence draft
→ Admin editorial review
→ Publish
→ Dashboard and Daily Brief update
```

Publishing is never automatic. The scheduler and admin generator only create review drafts.

## Fallback Behavior

If `OPENAI_API_KEY` is missing, invalid, rate limited, or returns malformed JSON, IXAI falls back to the existing structured generator.

Provider modes:

- `openai`: OpenAI generated the structured draft.
- `fallback`: No OpenAI key was configured; local structured generator was used.
- `error_fallback`: OpenAI was attempted but failed; local structured generator was used.

The build must remain safe without OpenAI environment variables.

## Safety Rules

The prompt requires:

- Traditional Chinese output.
- Professional, institutional, risk-first tone.
- No hype, no buy/sell instruction, no guaranteed returns.
- Use only provided headlines, summaries, source labels, categories, and timestamps.
- Do not invent facts, prices, events, or sources.
- If source coverage is weak, state that clearly.

Compliance copy:

> 本簡報由 IXAI 根據公開新聞標題、摘要與市場資料生成草稿，並需經人工審閱。內容僅供資訊參考，不構成投資建議、買賣指令或報酬承諾。

## Cost Guardrails

- Maximum news items sent to OpenAI: 16.
- Titles and summaries are truncated before sending.
- Full article text is never fetched or sent.
- No streaming is used.
- The homepage never displays a raw news dump; it only displays published curated intelligence.

## Human Review

OpenAI output is a draft only. Editors must review source coverage, risk framing, factual consistency, and compliance language before publishing.

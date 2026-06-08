# v1.82.7 — Narrative Depth Engine

## Goal

Upgrade Social Pack generation from an information organizer into a Strategist Narrative Engine.

The Social Pack should no longer merely summarize Daily / Weekly Brief content. It should translate market events into a strategist-style reading path:

```text
What happened
→ Why it matters
→ What changes my mind
→ What this means for FCN / risk awareness
```

This version changes only the Social Pack narrative generator.

## Root Cause

v1.82.5 removed placeholders and obvious weak fallback text, but the generator could still behave like a structured summary layer:

- Some bullets were concrete but not strategic.
- Generic fallback sentences could still act as primary viewpoints when source content was thin.
- Cross-market linkage was present in Weekly source data but not forced into the Social Pack structure.
- FCN content remained mostly education / awareness, not a translation of market events into FCN risk context.

## Modified Files

- `src/lib/intelligence/social/social-intelligence-pack.ts`
- `docs/NARRATIVE_DEPTH_ENGINE_V1827.md`

No auth, SSO, Supabase schema, Stripe, LINE, LIFF, backend, Portfolio, FCN backend, Stock, Crypto, Membership, or Pro launch files were changed.

## Generic Narrative Ban

The generator now uses a concrete narrative anchor check before allowing a sentence to become a primary strategist line.

Concrete anchors include:

- company / asset: NVDA, TSMC, 2330, SPY, QQQ, BTC, ETH
- event / data: FOMC, Powell, CPI, PCE, earnings, guidance
- market variable: Fed, USD, yields, rates, volatility
- FCN terms: KO, KI, worst-of, basket, observation date

Generic-only lines are not allowed to stand as primary card insight unless tied to a concrete event, asset, date, data point, company, or catalyst.

## Cross-Market Chain Engine

Weekly Social Pack now prioritizes the chain:

```text
Fed → USD → AI Beta → Taiwan Semis → Crypto → FCN
```

The Weekly Market Review card now surfaces this chain directly:

- `Fed → USD`
- `AI Beta → Taiwan Semis`
- `Crypto → FCN`

This makes the Weekly Social Pack carry the Weekly Brief's market structure instead of reducing it to disconnected events.

## Strategist Insight Layer

Core cards now prefer strategist lines:

- `What Happened`
- `Why It Matters`
- `What Changes My Mind`

Daily:

- The `What The Market Sees` card now uses the strategist layer.
- The card explains the event, why it matters, and what would change the view.

Weekly:

- The `The One Thing That Matters` card now uses the strategist layer.
- It connects AI earnings / guidance / capex to Fed / USD pricing and next-week validation.

## FCN Native Intelligence

FCN no longer appears only as generic education.

Daily risk card now includes:

- `FCN Translation`
- market-risk translation into KO / KI / worst-of / basket distance

Weekly view now includes:

- FCN risk awareness through `worst-of`, volatility, KO / KI, and basket language.
- Crypto / FCN chain awareness when BTC / ETH diverge from AI beta.

This remains monitoring and risk-awareness language only. It is not investment advice, product recommendation, or trading instruction.

## Narrative Before / After Examples

### Daily What The Market Sees

Before:

```text
Macro｜利率、美元與通膨仍是今日風險資產的定價錨點。
AI-Tech｜AI 主線要從題材回到訂單、資本支出與現金流證據。
Taiwan-Crypto｜台股供應鏈與 BTC / ETH 共同反映風險偏好的承接力。
```

After:

```text
What Happened｜Fed / USD / AI beta 的定價鏈條正在影響台股與 BTC / ETH 風險承接。
Why It Matters｜利率與美元若同步壓抑估值，AI beta、台灣半導體與 Crypto 的容錯率會一起下降。
What Changes My Mind｜若 AI guidance、台積電供應鏈與 BTC / ETH 風險偏好同步轉強，市場主線才算被重新驗證。
```

### Weekly Market Review

Before:

```text
Macro｜FOMC、Powell、利率與美元仍是下週風險資產的共同定價錨。
AI｜AI 主線要接受 earnings、guidance、capex 與雲端需求驗證。
Market｜資金會檢查美股 AI beta、台股供應鏈、BTC 與 FCN 波動是否同向。
```

After:

```text
Fed → USD｜FOMC / Powell 會先改變利率與美元，再影響 SPY、QQQ 與 BTC 的風險定價。
AI Beta → Taiwan Semis｜AI earnings / guidance / capex 若被上修，台積電、2330 與台灣半導體供應鏈才有延續證據。
Crypto → FCN｜BTC / ETH 若跟不上 AI beta，FCN worst-of、KO / KI 距離與籃子波動要提高警覺。
```

## Quality Guard Relationship

v1.82.4 quality guard remains active and unchanged.

The depth engine improves narrative generation, but formal export still requires:

- matching source period
- Weekly published + canonical source
- no fallback-only source
- quality guard passed
- no placeholder / repeated sentence / generic-card blockers

## Known Limitations

- This does not add Social Pack snapshot tests yet.
- This does not fix Daily public slug readback.
- This does not change Weekly canonical / publish behavior.
- If source content is extremely thin, the generator still uses anchored educational fallback lines, but those lines now include concrete market anchors and FCN risk terms.

## QA Checklist

- Daily Social Pack has no `Watch 1 / Watch 2 / Watch 3`.
- Daily core card includes What Happened / Why It Matters / What Changes My Mind.
- Daily risk card includes FCN Translation.
- Weekly Market Review shows Fed → USD → AI Beta → Taiwan Semis → Crypto → FCN chain.
- Weekly The One Thing That Matters uses strategist lines.
- Weekly pack includes FCN risk awareness.
- Quality guard remains active.

## Rollback

Rollback is limited to:

- revert `src/lib/intelligence/social/social-intelligence-pack.ts`
- remove `docs/NARRATIVE_DEPTH_ENGINE_V1827.md`

No database rollback is required.

# v1.83.5 — Weekly Narrative Dedup Fix

## Root cause

v1.83.4 fixed Weekly canonical export source selection, and v1.83.4c fixed selected/export source metadata separation. The remaining blocker was content quality: Weekly Social Pack could still repeat the same source sentence across Market Review, AI / Tech Watch, Next Week Catalysts, or I-Xuan Weekly View.

The quality guard was working as intended. The generator needed stronger role separation before formal export.

## Duplicate examples

Blocked output could contain repeated body copy such as:

- the same market logic repeated in Market Review bullets
- AI / Tech Watch reusing the same sentence for What Happened and Why It Matters
- Next Week Catalysts collapsing into one repeated event
- I-Xuan Weekly View copying Market Review wording instead of adding a strategist conclusion

## Fixed generation rules

Weekly generation now applies narrative deduplication before cards are assembled:

- Market Review always renders three distinct chains:
  - Fed / Rates -> USD
  - AI Beta -> Taiwan Semis
  - Crypto -> FCN Volatility
- AI / Tech Watch separates:
  - What Happened
  - Why It Matters
  - Watch Next
- Next Week Catalysts forces three different catalyst groups:
  - FOMC / Powell
  - AI guidance / earnings
  - FCN volatility
- I-Xuan Weekly View forces separate market, risk, and next-week watch bullets.

If source text is too similar, the generator falls back to concrete market anchors instead of repeating the same sentence.

## Quality guard behavior

The v1.82.4 quality guard remains strict:

- placeholder / TBD / TODO stays blocked
- editor-pending text stays blocked
- Watch 1 / Watch 2 / Watch 3 stays blocked
- Market Pulse / Market Pulse stays blocked
- empty cards stay blocked
- real body-text duplication stays blocked

The guard is not loosened. v1.83.5 fixes the generator output so valid canonical Weekly packs can pass.

## Fixture validation

The weekly export fixture now validates:

- selected review source metadata remains separate from export canonical source metadata
- source eligible is true when same-week published canonical source exists
- content quality is passed
- quality issue count is 0
- export eligible is true
- Export Current Pack, Download PNG, and Copy Caption are visible and enabled
- generated weekly card text does not contain repeated body lines

## Before / after

Before:

```text
Market Review
Fed / Rates -> USD｜本週市場重點在事件下週催化
AI Beta -> Taiwan Semis｜本週市場重點在事件下週催化
```

After:

```text
Market Review
Fed / Rates -> USD｜FOMC / Powell 與利率預期會先改變美元、SPY / QQQ、BTC 與台股半導體的資金成本。
AI Beta -> Taiwan Semis｜AI guidance、earnings、capex 與台積電 / 2330 供應鏈決定 AI beta 能否擴散。
Crypto -> FCN Volatility｜BTC / ETH 波動會把風險傳導到 FCN worst-of basket、KO / KI 與籃子集中度。
```

## Remaining limitations

- This is still deterministic extraction and card assembly, not a full editorial rewrite.
- The fixture validates the canonical-export path with controlled source data; production content still depends on source Brief quality.
- If a source Brief has genuinely weak or contradictory content, the quality guard may still block export correctly.


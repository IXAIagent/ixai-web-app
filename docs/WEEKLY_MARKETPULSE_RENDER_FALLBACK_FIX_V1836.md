# v1.83.6 — Weekly MarketPulse Render Fallback Fix

## Root cause

Production was already running v1.83.5 (`5857363`), and the Weekly Social Pack generator was producing structured weekly bullets:

- `Fed / Rates -> USD`
- `AI Beta -> Taiwan Semis`
- `Crypto -> FCN Volatility`

The remaining `Market Pulse / Market Pulse` issue came from the render layer, not the generator.

Call path:

```text
SocialIntelligencePackStudio
-> SocialPackPreview
-> SlidePreview
-> MarketPulseSlide
-> splitBullet
-> heading fallback = "Market Pulse"
```

When a bullet could not be split into heading/body cleanly, `splitBullet()` used `Market Pulse` as the fallback heading. Multiple bullets could therefore render the same fallback label and trigger content quality failure / export disabled.

## Fix

`MarketPulseSlide()` now passes context-aware fallback headings to `splitBullet()`.

Weekly `market_review` fallback headings:

- `Fed / Rates -> USD`
- `AI Beta -> Taiwan Semis`
- `Crypto -> FCN Volatility`

Daily `market_review` fallback headings:

- `Macro`
- `AI-Tech`
- `Taiwan-Crypto`

Other social cards use `Market Signal` instead of `Market Pulse` as a safer generic render fallback.

## Separator support

`splitBullet()` now supports these separators:

- `｜`
- `|`
- `：`
- `:`
- `->` represented by `→`

The parser prioritizes `｜` / `|` before `→`, so headings such as `Fed / Rates -> USD｜...` stay intact.

## Quality guard behavior

The source guard, weekly canonical guard, and content quality guard were not loosened.

Still blocked:

- `Watch 1 / Watch 2 / Watch 3`
- `具體事件待 editor 審閱`
- `TBD / TODO / placeholder`
- `Market Pulse / Market Pulse` in actual pack content
- empty cards
- true duplicated body copy

This patch prevents render fallback labels from creating duplicate visible card text.

## Fixture validation

`scripts/qa-weekly-export-fixture.mjs` now also verifies:

- no visible `Market Pulse` fallback remains in the Weekly Studio output
- content quality passed
- quality issues = 0
- source eligible = true
- export eligible = true
- Export Current Pack / Download PNG / Copy Caption are enabled

## Remaining limitations

This does not rewrite the narrative engine. It only fixes the render fallback that could mask valid generator output with `Market Pulse`.


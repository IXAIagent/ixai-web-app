import { Compass, Sparkles } from "lucide-react";
import type { WeeklyNarrativeBundle } from "@/src/types/editorial";

// v1.33 — Intelligence quote card. Renders a shareable card-style block
// (deep forest, gold accents) from a narrative bundle. This is the
// foundation for future "export as PNG" capability; for now it is a
// regular server-rendered component embedded on detail pages so readers
// can screenshot or future-export it.

const REGIME_LABEL: Record<WeeklyNarrativeBundle["regime"]["regime"], string> = {
  risk_on: "RISK-ON",
  neutral: "NEUTRAL",
  risk_off: "RISK-OFF",
};

const AI_LABEL: Record<WeeklyNarrativeBundle["regime"]["aiMomentum"], string> = {
  strong: "STRONG",
  neutral: "NEUTRAL",
  weak: "WEAK",
};

export function IntelligenceQuoteCard({
  narrative,
  eyebrow = "IXAI Intelligence",
  contextLine,
}: {
  narrative: WeeklyNarrativeBundle;
  eyebrow?: string;
  contextLine?: string;
}) {
  const pricingFirst = narrative.pricingWhat[0];
  const firstFlow = narrative.crossMarketLinks[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-[rgba(176,141,87,0.40)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_22px_60px_rgba(9,41,31,0.30)] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          {eyebrow}
        </p>
        <span className="rounded-md border border-[var(--ixai-gold)]/45 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          {REGIME_LABEL[narrative.regime.regime]} · AI {AI_LABEL[narrative.regime.aiMomentum]}
        </span>
      </div>

      {contextLine ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.62)]">
          {contextLine}
        </p>
      ) : null}

      <h2 className="mt-4 max-w-2xl font-serif text-2xl font-semibold leading-9 sm:text-3xl sm:leading-snug">
        {pricingFirst ?? narrative.marketNarrative.slice(0, 140)}
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        {firstFlow ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              Cross-market
            </div>
            <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.82)]">
              {firstFlow.from} → {firstFlow.to}：{firstFlow.note}
            </p>
          </div>
        ) : null}

        <div className="flex items-center gap-2 self-end font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)] sm:flex-col sm:items-end sm:text-right">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>app.ixuan.ai</span>
        </div>
      </div>
    </article>
  );
}

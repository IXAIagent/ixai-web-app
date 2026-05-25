import {
  Activity,
  ArrowRight,
  Compass,
  LineChart,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { WeeklyNarrativeBundle } from "@/src/types/editorial";

// v1.32 — Narrative Intelligence display component.
//
// Used on both /weekly-brief/[slug] and /daily-brief detail pages so the
// market narrative / regime / cross-market / importance ranking shows up
// with the same calm institutional tone across surfaces.

const REGIME_LABELS: Record<WeeklyNarrativeBundle["regime"]["regime"], string> = {
  risk_on: "Risk-On",
  neutral: "Neutral",
  risk_off: "Risk-Off",
};

const REGIME_STYLES: Record<WeeklyNarrativeBundle["regime"]["regime"], string> = {
  risk_on: "border-emerald-900/15 bg-emerald-50/75 text-emerald-900",
  neutral: "border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest-soft)]",
  risk_off: "border-red-900/20 bg-red-50/80 text-red-900",
};

const AI_LABELS: Record<WeeklyNarrativeBundle["regime"]["aiMomentum"], string> = {
  strong: "Strong",
  neutral: "Neutral",
  weak: "Weak",
};

const MACRO_LABELS: Record<WeeklyNarrativeBundle["regime"]["macroPressure"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const VOL_LABELS: Record<WeeklyNarrativeBundle["regime"]["volatilityState"], string> = {
  compressed: "Compressed",
  normal: "Normal",
  stressed: "Stressed",
};

function importanceTone(importance: number): string {
  if (importance >= 9) {
    return "border-red-900/20 bg-red-50/75 text-red-900";
  }
  if (importance >= 6) {
    return "border-[rgba(176,141,87,0.36)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-forest)]";
  }
  return "border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest-soft)]";
}

export function NarrativeIntelligence({
  narrative,
  eyebrow = "Narrative Intelligence",
}: {
  narrative: WeeklyNarrativeBundle;
  eyebrow?: string;
}) {
  return (
    <section className="flex flex-col gap-4 sm:gap-5">
      <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
              市場理解 — 不是新聞摘要，而是 IXAI 市場 strategist note。
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${REGIME_STYLES[narrative.regime.regime]}`}
            >
              Regime · {REGIME_LABELS[narrative.regime.regime]}
            </span>
            <span className="rounded-md border border-[var(--ixai-border)] bg-white/55 px-2.5 py-1 font-mono text-[11px] text-[var(--ixai-forest-soft)]">
              AI · {AI_LABELS[narrative.regime.aiMomentum]}
            </span>
            <span className="rounded-md border border-[var(--ixai-border)] bg-white/55 px-2.5 py-1 font-mono text-[11px] text-[var(--ixai-forest-soft)]">
              Macro · {MACRO_LABELS[narrative.regime.macroPressure]}
            </span>
            <span className="rounded-md border border-[var(--ixai-border)] bg-white/55 px-2.5 py-1 font-mono text-[11px] text-[var(--ixai-forest-soft)]">
              Vol · {VOL_LABELS[narrative.regime.volatilityState]}
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:text-base sm:leading-8">
          {narrative.marketNarrative}
        </p>
        <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3.5 text-sm leading-7 text-[var(--ixai-forest)] sm:p-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            IXAI takeaway
          </span>
          <span className="mt-2 block">{narrative.intelligenceTakeaway}</span>
        </p>
      </section>

      <section className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              市場正在 pricing 什麼
            </p>
          </div>
          <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {narrative.pricingWhat.map((item) => (
              <li className="border-b border-[var(--ixai-border)] pb-2 last:border-b-0 last:pb-0" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Risk Focus
            </p>
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">{narrative.riskFocus}</p>
          <div className="mt-4 border-t border-[var(--ixai-border)] pt-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Volatility Narrative
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {narrative.volatilityNarrative}
            </p>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
            <Activity className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Cross-Market Narrative
          </p>
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:text-base sm:leading-8">
          {narrative.crossMarketNarrative}
        </p>
        <ol className="mt-4 grid gap-2.5">
          {narrative.crossMarketLinks.map((link) => (
            <li
              className="grid gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3.5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3 sm:p-4"
              key={`${link.from}-${link.to}`}
            >
              <span className="font-mono text-xs font-semibold text-[var(--ixai-forest)]">
                {link.from}
              </span>
              <span className="hidden text-[var(--ixai-gold)] sm:inline-flex">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-mono text-xs font-semibold text-[var(--ixai-forest)]">
                {link.to}
              </span>
              <p className="sm:col-span-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {link.note}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              AI Narrative
            </p>
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">{narrative.aiNarrative}</p>
        </article>
        <article className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
              <LineChart className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Taiwan AI Narrative
            </p>
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">{narrative.taiwanNarrative}</p>
        </article>
      </section>

      {narrative.importanceRanking.length > 0 ? (
        <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Importance Ranking
          </p>
          <h3 className="mt-2 text-base font-semibold leading-6 text-[var(--ixai-forest)] sm:text-lg">
            按市場 pricing 重要性排序的本期 headlines
          </h3>
          <ol className="mt-4 grid gap-2.5">
            {narrative.importanceRanking.slice(0, 8).map((headline) => (
              <li
                className="flex flex-col gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3.5 sm:flex-row sm:items-start sm:gap-3 sm:p-4"
                key={`${headline.source}-${headline.title}`}
              >
                <span
                  className={`inline-flex h-7 shrink-0 items-center justify-center rounded-md border px-2 font-mono text-[11px] font-semibold ${importanceTone(headline.importance)}`}
                >
                  {headline.importance}/10
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                    {headline.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                    {headline.source} · {headline.importanceReason}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="text-xs leading-6 text-[var(--ixai-ink-muted)]">
        以上為 IXAI Public Intelligence Layer 的高層市場 narrative，不構成投資建議、買賣指令或績效保證。
        個人化 portfolio intelligence 與個別 FCN 風控保留在未來 IXAI Pro。
      </p>
    </section>
  );
}

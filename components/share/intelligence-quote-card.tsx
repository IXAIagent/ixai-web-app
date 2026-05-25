import { Compass, ShieldAlert, Sparkles } from "lucide-react";
import type {
  WeeklyNarrativeBundle,
  WeeklyUpcomingEvent,
} from "@/src/types/editorial";
import { pickEventChips } from "@/app/api/og/_lib/intelligence-card";

// v1.33.1 — Intelligence quote card on detail pages. Mirrors the new
// institutional OG card layout: regime row, pricing bullets, risk focus,
// event chips. Used today as a readable in-page module; foundation for
// a future client-side PNG export so the share card on socials matches
// the surface readers screenshot.

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

const MACRO_LABEL: Record<WeeklyNarrativeBundle["regime"]["macroPressure"], string> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

const VOL_LABEL: Record<WeeklyNarrativeBundle["regime"]["volatilityState"], string> = {
  compressed: "COMPRESSED",
  normal: "NORMAL",
  stressed: "STRESSED",
};

function trimLine(value: string, max: number): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) {
    return collapsed;
  }
  return `${collapsed.slice(0, max - 1).trim()}…`;
}

export function IntelligenceQuoteCard({
  narrative,
  eyebrow = "IXAI Intelligence",
  contextLine,
  events = [],
}: {
  narrative: WeeklyNarrativeBundle;
  eyebrow?: string;
  contextLine?: string;
  events?: WeeklyUpcomingEvent[];
}) {
  const regime = narrative.regime;
  const pricingLines = narrative.pricingWhat.slice(0, 2);
  const riskFocus = narrative.riskFocus
    ? trimLine(narrative.riskFocus.split(/[。.]/)[0] ?? narrative.riskFocus, 160)
    : "Risk regime remains mixed; the next Fed / earnings event is the repricing trigger.";

  const chipEvents = events.map((event) => ({
    date: event.date,
    title: event.title,
    category: event.category,
  }));
  const chips = pickEventChips(chipEvents);

  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-[rgba(176,141,87,0.45)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_60px_rgba(9,41,31,0.34)] sm:p-7"
    >
      {/* Subtle gold radial glow behind regime badges, matches the OG card. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(176,141,87,0.32), rgba(176,141,87,0.0) 70%)",
        }}
      />

      <header className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            {eyebrow}
          </p>
          {contextLine ? (
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.62)]">
              {contextLine}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border border-[var(--ixai-gold)]/55 bg-[rgba(176,141,87,0.13)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            Regime · {REGIME_LABEL[regime.regime]}
          </span>
          <span className="rounded-md border border-white/15 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(245,240,230,0.88)]">
            AI · {AI_LABEL[regime.aiMomentum]}
          </span>
          <span className="rounded-md border border-white/15 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(245,240,230,0.88)]">
            Macro · {MACRO_LABEL[regime.macroPressure]}
          </span>
          <span className="rounded-md border border-white/15 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(245,240,230,0.88)]">
            Vol · {VOL_LABEL[regime.volatilityState]}
          </span>
        </div>
      </header>

      <h2 className="relative mt-5 max-w-3xl font-serif text-xl font-semibold leading-9 text-[var(--ixai-cream)] sm:text-2xl sm:leading-snug">
        {trimLine(narrative.marketNarrative, 200)}
      </h2>

      <section className="relative mt-5 flex flex-col gap-3">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--ixai-gold)]">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          Market is pricing
        </p>
        <ul className="flex flex-col gap-2.5">
          {pricingLines.map((line) => (
            <li
              className="flex items-start gap-3 text-sm leading-7 text-[rgba(245,240,230,0.86)] sm:text-base"
              key={line}
            >
              <span
                aria-hidden="true"
                className="mt-2.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ixai-gold)]"
              />
              <span>{trimLine(line, 160)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative mt-5 rounded-xl border border-white/12 bg-white/[0.045] p-4 sm:p-5">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--ixai-gold)]">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
          Risk Focus
        </p>
        <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.86)] sm:text-base">
          {riskFocus}
        </p>
      </section>

      {chips.length > 0 ? (
        <section className="relative mt-5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--ixai-gold)]">
            Next
          </span>
          {chips.map((label) => (
            <span
              className="rounded-full border border-[var(--ixai-gold)]/55 bg-[rgba(176,141,87,0.12)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]"
              key={label}
            >
              {label}
            </span>
          ))}
        </section>
      ) : null}

      <footer className="relative mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgba(245,240,230,0.58)]">
          app.ixuan.ai · risk-first market intelligence
        </p>
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--ixai-gold)]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          I-XUAN · IXAI
        </p>
      </footer>
    </article>
  );
}

"use client";

import { ChevronDown, Compass } from "lucide-react";
import { useState } from "react";
import type { WeeklyNarrativeBundle } from "@/src/types/editorial";

const DEFAULT_PRICING_FALLBACK = [
  "AI capex 延續性是否足以支撐高估值。",
  "Fed 利率路徑是否壓抑風險資產流動性。",
  "台股 AI supply chain 是否延續外資輪動。",
  "Crypto risk appetite 是否代表整體槓桿情緒回溫。",
  "Volatility regime 是否影響 FCN 類結構商品風險。",
];

// v1.33.2 — Reading rhythm: show 2 pricing bullets by default, expose the
// rest behind an "展開更多 intelligence" toggle. Keeps the first screen
// scannable on mobile while preserving the full institutional read for
// users who want depth.

const PREVIEW_COUNT = 2;

export function PricingWhat({
  narrative,
}: {
  narrative: WeeklyNarrativeBundle | null;
}) {
  const items =
    narrative?.pricingWhat && narrative.pricingWhat.length > 0
      ? narrative.pricingWhat
      : DEFAULT_PRICING_FALLBACK;

  const hasMore = items.length > PREVIEW_COUNT;
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
          <Compass className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          市場正在 pricing 什麼
        </p>
      </div>
      <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
        不是新聞列表，而是市場 strategist 的 pricing 觀察。
      </h2>
      <ul className="mt-4 grid gap-2.5">
        {visible.map((item) => (
          <li
            className="flex items-start gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3.5 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:p-4 sm:leading-8"
            key={item}
          >
            <span
              aria-hidden="true"
              className="mt-2.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ixai-gold)]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {hasMore ? (
        <button
          aria-expanded={expanded}
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-forest)] transition active:scale-[0.98]"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          <ChevronDown
            aria-hidden="true"
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "收合" : "展開更多 intelligence"}
        </button>
      ) : null}
      <p className="mt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        以上為 IXAI Public Intelligence Layer 的高層市場觀察，不構成投資建議、買賣指令或績效保證。
      </p>
    </section>
  );
}

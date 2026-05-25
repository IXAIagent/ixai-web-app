import { Compass } from "lucide-react";
import type { WeeklyNarrativeBundle } from "@/src/types/editorial";

const DEFAULT_PRICING_FALLBACK = [
  "AI capex 延續性是否足以支撐高估值。",
  "Fed 利率路徑是否壓抑風險資產流動性。",
  "台股 AI supply chain 是否延續外資輪動。",
  "Crypto risk appetite 是否代表整體槓桿情緒回溫。",
  "Volatility regime 是否影響 FCN 類結構商品風險。",
];

// v1.32.2 — "市場正在 pricing 什麼". Reads narrative.pricingWhat if
// available, otherwise renders a deterministic editorial fallback so the
// home page never shows an empty list. Pure presentational.

export function PricingWhat({
  narrative,
}: {
  narrative: WeeklyNarrativeBundle | null;
}) {
  const items =
    narrative?.pricingWhat && narrative.pricingWhat.length > 0
      ? narrative.pricingWhat
      : DEFAULT_PRICING_FALLBACK;

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
      <ul className="mt-4 grid gap-2.5 sm:gap-3">
        {items.map((item) => (
          <li
            className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3.5 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:p-4"
            key={item}
          >
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        以上為 IXAI Public Intelligence Layer 的高層市場觀察，不構成投資建議、買賣指令或績效保證。
      </p>
    </section>
  );
}

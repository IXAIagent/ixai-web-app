import { ArrowDown, ArrowRight, Activity } from "lucide-react";
import type { WeeklyNarrativeBundle } from "@/src/types/editorial";

const DEFAULT_FLOW: WeeklyNarrativeBundle["crossMarketLinks"] = [
  {
    from: "Fed / Rates",
    to: "USD / Liquidity",
    note: "利率路徑與通膨黏性直接決定美元強弱與全球風險資產折現率。",
  },
  {
    from: "USD / Liquidity",
    to: "US AI Beta",
    note: "美元未過度走強時，美股大型 AI 權值股 (QQQ / NVDA) 估值容錯率較高。",
  },
  {
    from: "US AI Beta",
    to: "Taiwan Semis",
    note: "台積電與伺服器供應鏈是 US AI trade 的映射；24 小時內 read-across 至台股。",
  },
  {
    from: "Taiwan Semis",
    to: "Crypto Risk Appetite",
    note: "風險偏好擴散時，Crypto 跟隨高 beta 科技股；去槓桿階段 BTC / ETH 流動性敏感度上升。",
  },
  {
    from: "Crypto Risk Appetite",
    to: "FCN Volatility",
    note: "整體波動率影響 FCN worst-of 與 KI 緩衝；教育觀察而非個人化風控。",
  },
];

// v1.32.2 — Cross-market intelligence flow card.
//
// Mobile: vertical timeline with ArrowDown between nodes.
// Desktop: horizontal grid with ArrowRight separators.
// Each node is a from → to pair with a one-sentence "why it matters".

export function CrossMarketFlow({
  narrative,
}: {
  narrative: WeeklyNarrativeBundle | null;
}) {
  const links =
    narrative?.crossMarketLinks && narrative.crossMarketLinks.length > 0
      ? narrative.crossMarketLinks.slice(0, 5)
      : DEFAULT_FLOW;

  return (
    <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Cross-Market Intelligence Flow
        </p>
      </div>
      <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
        從利率到 FCN：跨資產的市場 narrative 鏈。
      </h2>
      {narrative?.crossMarketNarrative ? (
        <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:text-base sm:leading-8">
          {narrative.crossMarketNarrative}
        </p>
      ) : null}

      <ol className="mt-5 grid gap-3">
        {links.map((link, index) => (
          <li
            className="rounded-xl border border-[var(--ixai-border)] bg-white/55 p-3.5 sm:p-4"
            key={`${link.from}-${link.to}`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="font-mono text-xs font-semibold text-[var(--ixai-forest)] sm:text-sm">
                {link.from}
              </span>
              <span aria-hidden="true" className="text-[var(--ixai-gold)]">
                <ArrowDown className="h-4 w-4 sm:hidden" />
                <ArrowRight className="hidden h-4 w-4 sm:inline" />
              </span>
              <span className="font-mono text-xs font-semibold text-[var(--ixai-forest)] sm:text-sm">
                {link.to}
              </span>
              <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)] sm:inline">
                Stage {index + 1}
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {link.note}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        每一個 stage 都是教育型市場 narrative；不構成投資建議或個別 FCN 風控。
      </p>
    </section>
  );
}

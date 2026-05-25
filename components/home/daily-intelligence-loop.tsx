import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Compass,
  Newspaper,
  Sparkles,
} from "lucide-react";

// v1.33.2 — Daily Intelligence Loop. Sits between the hero and the
// pricing section so first-time readers immediately see the rhythm of
// what IXAI Public actually delivers (daily + weekly + cross-market +
// FCN education) before scrolling into deeper data widgets. Institutional
// tone; no hype, no performance promise.

const LOOP_PILLARS: Array<{ label: string; copy: string; icon: typeof Newspaper }> = [
  {
    label: "每日 AI-assisted market intelligence",
    copy: "Fed / AI / Taiwan / Crypto / volatility — 一份結構化 daily read。",
    icon: Newspaper,
  },
  {
    label: "每週 strategist narrative",
    copy: "Past-week pricing + next-week catalysts，不只是新聞列表。",
    icon: CalendarDays,
  },
  {
    label: "AI / Fed / Taiwan / Crypto / volatility intelligence",
    copy: "Regime + cross-market flow + importance ranking 同框觀察。",
    icon: Compass,
  },
  {
    label: "FCN education 與 cross-market flow",
    copy: "Worst-of / KI / volatility 教育型 intelligence；個人化保留 Pro。",
    icon: Sparkles,
  },
];

export function DailyIntelligenceLoop() {
  return (
    <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.18)] sm:p-7">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
        Daily AI Market Intelligence
      </p>
      <h2 className="mt-3 font-serif text-xl font-semibold leading-9 sm:text-3xl sm:leading-snug">
        每日 AI-assisted market intelligence — 由一玄投資以 risk-first 視角編成。
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
        IXAI Public 把市場 regime、pricing 觀察、跨資產脈絡與 FCN 教育整合成一個可閱讀的日常節奏。
        個人化 portfolio 與 FCN 風控保留在未來 IXAI Pro。
      </p>

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        {LOOP_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <li
              className="flex gap-3 rounded-xl border border-white/12 bg-white/[0.045] p-3 sm:p-3.5"
              key={pillar.label}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-[rgba(176,141,87,0.16)] text-[var(--ixai-gold)]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                  {pillar.label}
                </p>
                <p className="mt-1 text-sm leading-7 text-[rgba(245,240,230,0.78)]">
                  {pillar.copy}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <Link
          className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
          href="/register"
        >
          建立免費 IXAI Account
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
          href="/weekly-brief"
        >
          閱讀最新 Weekly Intelligence
        </Link>
      </div>

      <p className="mt-4 text-xs leading-6 text-white/52">
        Public Intelligence 不提供個別投資建議；個人化分析保留至付費 Pro 開放。
      </p>
    </section>
  );
}

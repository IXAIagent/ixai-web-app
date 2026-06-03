import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Gauge,
  Layers3,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

const conceptCards = [
  {
    copy: "KI 是風險觸發門檻；一旦連結標的跌破，投資人需要理解本金與標的表現的關係。",
    icon: TrendingDown,
    title: "KI：風險觸發",
  },
  {
    copy: "KO 是提前出場條件；它影響產品是否提早結束，也影響配息與觀察節奏。",
    icon: Gauge,
    title: "KO：條件出場",
  },
  {
    copy: "多標的 FCN 通常由最弱標的主導風險，這也是 worst-of 結構最需要被監控的原因。",
    icon: Layers3,
    title: "Worst-of：最弱標的",
  },
  {
    copy: "配息日曆與觀察日決定投資人何時需要重新檢查標的價格、波動率與產品狀態。",
    icon: CalendarDays,
    title: "配息與觀察日",
  },
];

export const metadata = buildPublicMetadata({
  title: "FCN 教育與風險觀念 | IXAI",
  description:
    "IXAI FCN 頁面介紹 FCN、KI / KO、Worst-of 與配息觀察日概念；個人化 FCN 監控保留在 IXAI Pro。",
  canonical: "/fcn",
});

export default function FCNPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          FCN 教育
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-2xl font-semibold leading-9 sm:text-5xl sm:leading-snug">
          先理解 FCN 的風險結構，再談監控。
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
          FCN 不只是配息產品。真正需要理解的是 KI、KO、Worst-of、觀察日與波動率如何一起影響風險。
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
            href="/pro"
          >
            了解 IXAI Pro
            <ArrowRight className="h-4 w-4 text-[var(--ixai-forest)]" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
            href="/account"
          >
            申請 Pro 測試
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          什麼是 FCN
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          FCN 是結構型商品，配息只是表面，風險來自條件與連結標的。
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
          FCN 通常連結一組股票、ETF 或指數。投資人會看到 coupon、觀察日、KI / KO 等條件，
          但真正需要監控的是標的價格、波動率、最弱標的與時間節奏如何改變風險。
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {conceptCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5"
              key={card.title}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.24)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)]">
                <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {card.copy}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(176,141,87,0.08)] p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.24)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)]">
            <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              為什麼需要 FCN 監控
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
              FCN 風險會隨標的、時間與市場波動改變。
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              單次閱讀產品條件並不夠。當標的價格接近 KI、觀察日接近、最弱標的換手或市場波動率上升時，
              投資人需要重新理解風險脈絡。這類個人化監控屬於 IXAI Pro，不在免費 App 頁面提供。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            IXAI Pro
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            一玄 Pro 未來提供 FCN 監控與風險工作流。
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Pro 監控會以教育與風險意識為核心，不提供買賣指令、商品推薦、保證收益或自動交易。
          </p>
        </div>
        <Link
          className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
          href="/pro"
        >
          查看 IXAI Pro
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}

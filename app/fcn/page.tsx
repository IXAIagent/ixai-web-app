import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Coins,
  FileSpreadsheet,
  Gauge,
  Inbox,
  Layers3,
  LineChart,
  RadioTower,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

// v1.64.0 — FCN education + conversion page. The App owns FCN education;
// FCN Monitoring is a Pro moat and 顧問服務 covers high-net-worth
// individual review. This page must inform, not monitor.

const HIGH_NET_WORTH_PILLARS = [
  {
    title: "現金流",
    copy: "每月配息為投資組合提供可預期的現金流，特別適合需要穩定收入的高資產投資人。",
    icon: Coins,
  },
  {
    title: "盤整市場收益",
    copy: "盤整或緩漲市場下，傳統股票報酬有限。FCN 透過結構條件，把區間表現轉化為配息。",
    icon: LineChart,
  },
  {
    title: "客製化條件",
    copy: "可依投資人需求挑選連結標的、Worst-of 結構、KI / KO 門檻、觀察日與配息頻率。",
    icon: Sparkles,
  },
];

const REAL_RISK_CARDS = [
  {
    title: "KI：風險觸發",
    copy: "KI 是風險觸發門檻；一旦連結標的跌破，投資人需要理解本金與標的表現的關係。",
    icon: TrendingDown,
  },
  {
    title: "KO：條件出場",
    copy: "KO 是提前出場條件；它影響產品是否提早結束，也影響配息與觀察節奏。",
    icon: Gauge,
  },
  {
    title: "Worst-of：最弱標的",
    copy: "多標的 FCN 通常由最弱標的主導風險。Worst-of 結構讓任何一檔失守都會牽動全產品。",
    icon: Layers3,
  },
  {
    title: "配息與觀察日",
    copy: "配息日曆與觀察日決定投資人何時需要重新檢查標的價格、波動率與產品狀態。",
    icon: CalendarDays,
  },
];

const MANUAL_PAIN_POINTS = [
  {
    title: "對帳單與業務通知",
    copy: "多數投資人靠對帳單、簡訊與業務的通知掌握 FCN 進度；資訊片段散落、難以對齊。",
    icon: Inbox,
  },
  {
    title: "Excel 自製追蹤",
    copy: "稍熟的投資人會自己拉 Excel 追 KI / KO 與配息日，但標的變動與波動率資料更新困難。",
    icon: FileSpreadsheet,
  },
  {
    title: "多檔多標的的負擔",
    copy: "一旦持有多檔 FCN、跨多家券商、跨多檔連結標的，人工追蹤幾乎無法即時反映 Worst-of。",
    icon: Layers3,
  },
];

const PRO_FCN_MOAT = [
  { label: "KI / KO 距離追蹤", copy: "每個連結標的離 KI / KO 的即時距離與歷史軌跡。" },
  { label: "Worst-of 監控", copy: "誰是當下最弱標的？誰是潛在 Worst-of 候選？" },
  { label: "配息與觀察日", copy: "下一個配息日、下一個觀察日、到期日整理為單一行事曆。" },
  { label: "風險等級", copy: "綜合距離、波動率、最弱標的的風險分級提示。" },
  { label: "標的集中度", copy: "跨多檔 FCN 的標的重複曝險與類股集中度。" },
  { label: "AI 風險提醒", copy: "重要狀態改變時的非即時、人工審視優先的提醒設計。" },
];

export const metadata = buildPublicMetadata({
  title: "FCN 教育與風險觀念 | IXAI",
  description:
    "IXAI FCN 頁面整理 FCN 收益結構、KI / KO、Worst-of 與觀察日風險，並說明為什麼個人化 FCN 監控屬於 IXAI Pro。",
  canonical: "/fcn",
});

export default function FCNPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      {/* 1. Hero */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          FCN 教育
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-2xl font-semibold leading-9 sm:text-5xl sm:leading-snug">
          FCN 不是只看配息，更要看風險有沒有被監控。
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
          一玄以投資顧問經驗，協助投資人理解 FCN 的收益結構、KI / KO、Worst-of 風險與配息觀察日。
          本頁是教育與風險說明，個人化監控屬於 IXAI Pro。
        </p>
        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
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
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.55)] bg-[rgba(176,141,87,0.18)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-[rgba(176,141,87,0.28)]"
            href="/feedback?intent=fcn_consultation"
          >
            預約 FCN 健檢
            <CalendarCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 2. What is FCN */}
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          什麼是 FCN
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          FCN 是結構型收益商品；配息只是表面，風險來自條件與連結標的。
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
          FCN 連結一組股票或指數。投資人通常重視月配息、固定收益感。
          但實際承擔的是標的股價走勢與 Worst-of 風險，特別是當市場進入較大波動時。
        </p>
      </section>

      {/* 3. Why high-net-worth investors use FCN */}
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          為什麼高資產投資人會用 FCN
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          FCN 提供現金流與盤整市場收益，但前提是風險被看懂、被監控。
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {HIGH_NET_WORTH_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                className="flex h-full flex-col rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4"
                key={pillar.title}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.28)] bg-[var(--ixai-forest)]">
                  <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {pillar.copy}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. The real risk — KI / KO / Worst-of / observation */}
      <section className="grid gap-3 sm:grid-cols-2">
        {REAL_RISK_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <article
              className="flex h-full flex-col rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5"
              key={card.title}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.28)] bg-[var(--ixai-forest)]">
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

      {/* 5. Realistic example (non-advisory) */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.92)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          實境舉例
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          Worst-of 怎麼把「看起來穩」的 FCN 變成高風險商品？
        </h2>
        <div className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/65 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          <p>
            假設一檔 FCN 連結 TSLA、MDB、AFRM 三檔股票，KI 設於 -30%、KO 設於 +5%。
          </p>
          <p className="mt-2">
            產品上線後，TSLA 與 MDB 維持穩定，但 AFRM 因為財報與利率因素跌幅超過 35%。
            雖然另外兩檔表現平穩，Worst-of 結構仍由 AFRM 主導，整檔 FCN 進入高風險狀態，
            最終可能以 AFRM 計算到期轉股或本金扣減。
          </p>
          <p className="mt-3 rounded-md border border-[var(--ixai-border)] bg-white/55 p-3 text-xs leading-6 text-[var(--ixai-ink-muted)]">
            本舉例僅為結構說明，不構成個別投資建議、買賣指令或商品推薦。
          </p>
        </div>
      </section>

      {/* 6. Why monitoring matters */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(176,141,87,0.08)] p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.28)] bg-[var(--ixai-forest)]">
            <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              為什麼需要 FCN 監控
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
              FCN 風險會隨標的、時間與市場波動改變。
            </h2>
            <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              <li>• 不是買入後等配息，而是每天追蹤每個標的距離 KI / KO 的變化。</li>
              <li>• 需要知道 Worst-of 是否換手，因為最弱標的會主導整檔 FCN 的風險。</li>
              <li>• 需要看配息觀察日與到期日，避免錯過關鍵節奏。</li>
              <li>• 需要管理多檔 FCN 的標的集中度與總曝險，避免類股或單一名稱過度堆疊。</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. Why this is hard today */}
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          為什麼今日很難做到
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          多數投資人依靠對帳單與業務通知，工具還沒跟上 FCN 真正的風險樣貌。
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {MANUAL_PAIN_POINTS.map((pain) => {
            const Icon = pain.icon;
            return (
              <article
                className="flex h-full flex-col rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4"
                key={pain.title}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.28)] bg-[var(--ixai-forest)]">
                  <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                  {pain.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {pain.copy}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* 8. IXAI Pro FCN Monitoring — clearly labeled Pro-only */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              IXAI Pro 的 FCN 監控
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 sm:text-2xl">
              完整 FCN 監控屬於 IXAI Pro 功能。
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
              Pro 把 FCN 教育延伸為持續監控與風險工作流；不提供買賣指令、商品推薦、保證收益或自動交易。
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[var(--ixai-gold)]">
            <RadioTower className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
            Pro 功能
          </span>
        </div>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {PRO_FCN_MOAT.map((item) => (
            <li
              className="rounded-md border border-white/10 bg-white/[0.045] p-3 text-sm leading-6 text-white/82"
              key={item.label}
            >
              <p className="font-semibold text-[var(--ixai-cream)]">{item.label}</p>
              <p className="mt-1 text-white/64">{item.copy}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
            href="/pro"
          >
            查看 IXAI Pro
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

      {/* 9. Consulting CTA — 一玄投資顧問服務 */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(255,250,240,0.92)] p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              一玄投資顧問服務
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
              如果你手上已有 FCN 或正在評估結構型商品，可以先做 FCN 健檢。
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              FCN 健檢由一玄投資顧問團隊以投資顧問經驗審視標的結構、Worst-of 風險、KI / KO 距離、配息與到期節奏，
              提供風險意識整理。本服務為 1:1 顧問流程，非系統自動分析，亦不構成個別投資建議。
            </p>
          </div>
          <Link
            className="ixai-cta-forest inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-5 py-3 text-sm font-semibold text-[var(--ixai-cream)]"
            href="/feedback?intent=fcn_consultation"
          >
            預約 FCN 健檢
            <CalendarCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 10. Compliance note */}
      <p className="rounded-md border border-[var(--ixai-border)] bg-white/45 px-4 py-3 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        本頁為教育與風險說明，不構成個別投資建議、買賣指令、商品推薦或報酬保證。
        個人化監控與資產審視屬於 IXAI Pro 或一玄投資顧問服務範圍。
      </p>
    </main>
  );
}

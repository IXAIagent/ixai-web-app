import Link from "next/link";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";

const operatingSystemPoints = [
  "每日市場簡報",
  "多資產監控",
  "投資組合情報",
  "風險導向決策脈絡",
];

const previewBlocks = [
  {
    label: "A",
    title: "AI Morning Brief",
    copy: "以利率、AI 科技主線、台灣供應鏈、Crypto 流動性與風險焦點開啟每日市場閱讀。",
  },
  {
    label: "B",
    title: "Portfolio Intelligence",
    copy: "未來將市場變化轉譯為投資組合層級的曝險、集中度與情境觀察。",
  },
  {
    label: "C",
    title: "FCN Monitoring",
    copy: "在票息成為唯一焦點之前，追蹤標的品質、距離、波動與最差情境。",
  },
  {
    label: "D",
    title: "Crypto Monitoring",
    copy: "以流動性、資金流、波動率與風險紀律閱讀 BTC / ETH，而不是只看價格動能。",
  },
];

const philosophy = [
  "AI-assisted",
  "多資產",
  "風險導向",
  "編輯式情報",
  "持續監控",
];

export const metadata = {
  title: "IXAI Pro | 產品教育",
  description:
    "了解 IXAI 如何將 Daily Brief、Weekly Brief、風險監控與投資組合情報整合為 AI Wealth Operating System。",
};

export default function IxaiPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          IXAI Pro
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
          從每日閱讀，進入 AI Wealth Intelligence 的監控層。
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
          IXAI 不是另一個資訊看板，而是把市場情報、AI 分析與風險監控整合成可每天使用的 financial intelligence layer。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-[var(--ixai-cream)]"
            href="/daily-brief"
          >
            閱讀每日簡報
          </Link>
          <Link
            className="inline-flex rounded-lg border border-white/12 px-4 py-2 text-sm font-medium text-white/78"
            href="/weekly-brief"
          >
            閱讀週報
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI 是什麼
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <h2 className="text-2xl font-semibold leading-8 text-[var(--ixai-forest)]">
            不是券商，不是喊單群，也不是另一個新聞流。
          </h2>
          <div>
            <p className="text-sm leading-7 text-[var(--ixai-ink-muted)]">
              IXAI 是面向現代投資者的 AI Wealth Intelligence Platform，協助整理股票、利率、Crypto、結構型商品與個人風險脈絡，讓市場資訊轉化成更穩定的 daily intelligence。
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {operatingSystemPoints.map((point) => (
                <div
                  className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2 text-sm text-[var(--ixai-forest-soft)]"
                  key={point}
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)]">
        <div className="border-b border-[var(--ixai-border)] px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            IXAI 能提供什麼
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            從免費閱讀層延伸到未來 Pro 監控層
          </h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {previewBlocks.map((block) => (
            <article
              className="border-b border-[var(--ixai-border)] p-5 md:border-r"
              key={block.title}
            >
              <span className="font-mono text-xs text-[var(--ixai-gold)]">
                {block.label}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-[var(--ixai-forest)]">
                {block.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-ink-muted)]">
                {block.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            為什麼每天使用 IXAI
          </p>
          <h2 className="mt-3 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            市場很吵，財富決策需要穩定的操作節奏。
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            投資人不缺新聞、價格提醒或圖表。更困難的是把總經、利率、財報、AI 資本支出、台灣供應鏈、Crypto 流動性與個人曝險連成每天能持續使用的系統。
          </p>
        </div>

        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            產品哲學
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {philosophy.map((item) => (
              <span
                className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-paper)] px-3 py-2 text-sm text-[var(--ixai-forest-soft)]"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--ixai-ink-muted)]">
            IXAI 不承諾報酬，也不提供買賣指令。它的核心是 intelligence、visibility、monitoring 與 context。
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
        <div className="border-b border-[var(--ixai-border)] px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            免費版 vs 未來 Pro 方向
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            先建立每日使用習慣，再延伸到監控與提醒
          </h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          <article className="border-b border-[var(--ixai-border)] p-5 md:border-b-0 md:border-r">
            <h3 className="text-lg font-semibold text-[var(--ixai-forest)]">
              免費閱讀層
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
              Daily Brief、Weekly Brief、市場總覽與自選觀察，協助使用者每天建立市場脈絡。
            </p>
          </article>
          <article className="p-5">
            <h3 className="text-lg font-semibold text-[var(--ixai-forest)]">
              未來 Pro 方向
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
              FCN 監控、AI 風險提醒、投資組合情報與 Crypto 監控，將閱讀層延伸為持續追蹤層。
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          升級說明 / Pro
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              先使用免費市場入口，當閱讀習慣形成後，再理解 IXAI Pro 能補上的監控能力。
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/68">
              Daily Brief 與 Weekly Brief 是免費閱讀層。IXAI Pro 的方向，是把這個習慣延伸到監控、提醒、投資組合情報與結構型商品脈絡。
            </p>
          </div>
          <a
            className="ixai-cta-cream inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-[var(--ixai-cream)] px-4 py-2 text-sm font-semibold"
            href={ixaiEcosystem.proDashboardUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {ixaiEcosystem.cta.enterPro}
          </a>
        </div>
      </section>
    </div>
  );
}

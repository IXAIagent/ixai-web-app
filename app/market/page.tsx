import { MarketOverview } from "@/components/dashboard/market-overview";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { MARKET_DATA_DISCLAIMER } from "@/src/lib/market-data/types";

export const metadata = buildPublicMetadata({
  title: "IXAI 市場總覽 — Market Overview",
  description:
    "IXAI 市場總覽追蹤 Crypto、美股 ETF、美股科技股與台股代表標的，並清楚標示資料狀態。",
});

export default function MarketPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Market Overview
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-snug sm:text-5xl">
          主要市場價格與風險觀察入口。
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
          追蹤 Crypto、美股 ETF、美股科技股與台股代表標的，並清楚標示每筆市場資料的更新狀態。
        </p>
      </section>

      <MarketOverview />

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          市場資料說明
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          資料狀態說明
        </h2>
        <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--ixai-forest-soft)] md:grid-cols-2">
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            Crypto：BTC / ETH / SOL 會優先讀取公開市場資料；若資料暫時不可用，頁面會明確標示。
          </p>
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            美股與 ETF：SPY、QQQ、NVDA、TSLA、AAPL、TSM 等標的可能為延遲報價。
          </p>
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            台股代表標的：2330.TW、0050.TW 作為台股與半導體觀察入口。
          </p>
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            IXAI 不提供交易指令；市場資料與內容僅用於資訊整理與風險觀察。
          </p>
        </div>
        <p className="mt-5 border-t border-[var(--ixai-border)] pt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
          {MARKET_DATA_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}

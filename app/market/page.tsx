import { MarketOverview } from "@/components/dashboard/market-overview";
import { MARKET_DATA_DISCLAIMER } from "@/src/lib/market-data/types";

export const metadata = {
  title: "市場總覽 | IXAI",
  description: "IXAI Market Data Layer 的第一版市場入口。",
};

export default function MarketPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Market Data Layer
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-snug sm:text-5xl">
          市場總覽，從資料狀態開始。
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
          IXAI 以 provider 架構讀取 Crypto、美股 ETF、美股科技股與台股代表標的，
          並在每筆 quote 明確標示真實、延遲或 fallback 狀態。
        </p>
      </section>

      <MarketOverview />

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Source Strategy
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          資料來源策略
        </h2>
        <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--ixai-forest-soft)] md:grid-cols-2">
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            CoinGecko provider：BTC / ETH / SOL 真實資料，API 失敗時回落至明確標示的 fallback。
          </p>
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            Yahoo Finance provider：SPY、QQQ、NVDA、TSLA、AAPL、TSM 等美股與 ETF 延遲報價。
          </p>
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            Taiwan symbols：2330.TW、0050.TW 使用 Yahoo Finance Taiwan symbol，失敗時才 fallback。
          </p>
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            News provider placeholder：未來僅接合法新聞源、RSS 或摘要入口，不做未授權全文抓取。
          </p>
        </div>
        <p className="mt-5 border-t border-[var(--ixai-border)] pt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
          {MARKET_DATA_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}

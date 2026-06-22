import { WatchlistSummary } from "@/components/watchlist/watchlist-summary";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/watchlist",
  description:
    "IXAI Workspace Watchlist 整理 local/fallback watchlist readback、Market Service quote status 與 monitoring-only context。",
  title: "Watchlist | 我的 IXAI",
});

export default function MyIxaiWatchlistPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
            Workspace Watchlist
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
            Watchlist Center
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
            用 local / fallback watchlist readback 整理關注標的，並透過 Market Service 顯示可用 quote 狀態。本頁僅用於監控與工作流程整理。
          </p>
        </section>

        <WatchlistSummary />

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Watchlist Center 不提供投資建議、買賣指令、目標價建議、下單功能、自動交易或報酬承諾。
        </p>
      </section>
    </main>
  );
}

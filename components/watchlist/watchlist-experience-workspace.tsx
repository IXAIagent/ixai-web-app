"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bell, Eye, LineChart, Plus, TrendingUp } from "lucide-react";

import { WatchlistSummary } from "@/components/watchlist/watchlist-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import {
  getWatchlistPersistenceSummary,
  type WatchlistPersistenceSummary,
} from "@/src/lib/watchlist/persistence";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import type { WorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-types";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function formatPrice(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return new Intl.NumberFormat("zh-TW", {
    currency: currency === "USDT" ? "USD" : currency,
    maximumFractionDigits: value >= 100 ? 2 : 4,
    style: "currency",
  }).format(value);
}

function marketStatus(summary: WorkspaceWatchlistSummary | null) {
  if (!summary) return "準備中";
  if ((summary.missingQuoteCount ?? 0) > 0 || summary.unquotedItemCount > 0) return "部分可用";
  return "已更新";
}

export function WatchlistExperienceWorkspace() {
  const [summary, setSummary] = useState<WorkspaceWatchlistSummary | null>(null);
  const [persistence, setPersistence] = useState<WatchlistPersistenceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      setIsLoading(true);
      const result = await runWorkspaceSafe(
        "watchlist-experience-load",
        async () => Promise.all([getWorkspaceWatchlistSummary(), getWatchlistPersistenceSummary()]),
        [null, null] as [WorkspaceWatchlistSummary | null, WatchlistPersistenceSummary | null],
      );

      if (!mountedRef.current) return;
      setSummary(result.data[0]);
      setPersistence(result.data[1]);
      setIsLoading(false);
    }

    queueMicrotask(() => void load());

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const items = summary?.items ?? [];
  const missingQuotes = summary?.missingQuoteCount ?? summary?.unquotedItemCount ?? 0;

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/input", icon: Plus, label: "新增追蹤標的" },
            { href: "/my-ixai/intelligence", icon: LineChart, label: "查看市場摘要", variant: "secondary" },
          ]}
          eyebrow="Market"
          kpis={[
            { description: "目前在 Workspace 追蹤的標的。", icon: Eye, label: "Watched Symbols", value: String(summary?.itemCount ?? 0) },
            { description: "本頁先顯示狀態，不做交易訊號。", icon: TrendingUp, label: "Movers", value: "觀察中" },
            { description: "有價格或資料缺口時會提醒。", icon: Bell, label: "Alerts", value: String(missingQuotes) },
            { description: "資料來源細節放在進階診斷。", icon: LineChart, label: "Market Status", value: marketStatus(summary) },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                今天你關注的市場
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{summary?.itemCount ?? 0} 個標的</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {items.length > 0 ? `${items.slice(0, 3).map((item) => item.symbol).join("、")} 正在整理中。` : "新增 watchlist 後，這裡會整理今日關注標的。"}
              </p>
            </>
          }
          summary="把關注標的、行情狀態與需要補資料的地方整理在一起，provider/cache 細節收到底部。"
          title="市場追蹤：今天你關注的市場。"
        />

        <WorkspaceProductSection
          description="用使用者語言呈現關注標的，不先顯示 persistence 或 source 狀態。"
          eyebrow="Watchlist Summary"
          title="我的關注標的"
        >
          {items.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-3">
              {items.slice(0, 6).map((item) => (
                <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-base font-semibold text-[var(--ixai-forest)]">{item.symbol}</p>
                      <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">{item.name}</p>
                    </div>
                    <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {item.quoteStatus === "available" ? "有行情" : "待更新"}
                    </span>
                  </div>
                  <p className="mt-4 text-xl font-semibold text-[var(--ixai-forest)]">
                    {formatPrice(item.quote?.quote?.price, item.quote?.quote?.currency)}
                  </p>
                  {item.note ? <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.note}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-5">
              <p className="text-base font-semibold text-[var(--ixai-forest)]">還沒有追蹤標的</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                新增股票、ETF 或 Crypto 後，IXAI 會在這裡整理市場追蹤摘要。
              </p>
              <Link className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)]" href="/my-ixai/input">
                新增追蹤標的
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            </div>
          )}
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="主卡只顯示關注標的狀態；資料來源細節放在進階診斷。"
          eyebrow="Market Snapshot"
          title="行情狀態"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "已有行情的關注標的。", icon: LineChart, label: "可用行情", value: String(summary?.quotedItemCount ?? 0) },
              { description: "暫時缺少行情的標的。", icon: Bell, label: "待更新", tone: missingQuotes > 0 ? "warning" : "default", value: String(missingQuotes) },
              { description: "最近可用市場資料時間。", icon: Eye, label: "更新時間", value: summary?.liveMarketAsOf ? new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit" }).format(new Date(summary.liveMarketAsOf)) : "待更新" },
            ]}
          />
        </WorkspaceProductSection>

        {isLoading ? (
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-sm text-[var(--ixai-forest-soft)]">
            正在整理 watchlist。缺少資料時會保留安全 placeholder。
          </p>
        ) : null}

        <WorkspaceDiagnosticsPanel description="watchlist persistence/source、market source">
          <WatchlistSummary />
          <WorkspaceKpiGrid
            items={[
              { description: "目前 watchlist 讀取狀態。", icon: Eye, label: "Watchlist Source", value: persistence?.sourceStatus ?? summary?.sourceStatus ?? "unknown" },
              { description: "已儲存項目數。", icon: Plus, label: "Persisted", value: String(persistence?.persistedItems ?? 0) },
              { description: "Local fallback 項目數。", icon: Bell, label: "Local / Fallback", value: String((persistence?.localItems ?? 0) + (persistence?.fallbackItems ?? 0)) },
            ]}
          />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}

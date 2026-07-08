"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  Eye,
  Globe2,
  Landmark,
  LineChart,
  Newspaper,
  Plus,
  Radio,
  ShieldCheck,
} from "lucide-react";

import { WatchlistSummary } from "@/components/watchlist/watchlist-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceEmptyState,
  WorkspaceKpiGrid,
  WorkspaceLoadingCard,
  WorkspaceProductHero,
  WorkspaceProductSection,
  WorkspaceStateMessage,
} from "@/components/workspace/product";
import { getAssetIntelligence } from "@/src/lib/intelligence/assets";
import type { AssetIntelligence } from "@/src/lib/intelligence/assets";
import { getMonitoringEvents, getTodayFocus } from "@/src/lib/intelligence/monitoring";
import type { MonitoringEvent } from "@/src/lib/intelligence/monitoring";
import { getWatchlistPersistenceSummary } from "@/src/lib/watchlist/persistence/watchlist-persistence-service";
import type { WatchlistPersistenceSummary } from "@/src/lib/watchlist/persistence/watchlist-persistence-types";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import type { WorkspaceWatchlistItemReadback, WorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-types";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function formatPrice(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return new Intl.NumberFormat("zh-TW", {
    currency: currency === "USDT" ? "USD" : currency,
    maximumFractionDigits: value >= 100 ? 2 : 4,
    style: "currency",
  }).format(value);
}

function formatTime(value: string | null | undefined) {
  if (!value) return "待更新";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "待更新";
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return `${Math.round(value * 100)}%`;
}

function relatedEvents(asset: AssetIntelligence | null | undefined, events: MonitoringEvent[]) {
  if (!asset) return [];
  return events.filter((event) => event.assetId === asset.id || event.relatedAssetIds.includes(asset.id));
}

function whyWatchlistMatters(item: WorkspaceWatchlistItemReadback, asset: AssetIntelligence | undefined, events: MonitoringEvent[]) {
  const eventCount = relatedEvents(asset, events).length;

  if (eventCount > 0) {
    return `${item.symbol} has ${eventCount} monitoring signals connected to today's market context.`;
  }

  if (item.quoteStatus !== "available") {
    return `${item.symbol} needs a market update before IXAI can explain today's movement.`;
  }

  return `${item.symbol} is ready for market tracking. Add alerts or review related news when available.`;
}

function marketState(summary: WorkspaceWatchlistSummary | null) {
  if (!summary?.itemCount) return "No watchlist yet.";
  if ((summary.missingQuoteCount ?? summary.unquotedItemCount) > 0) return "Some symbols need updates.";
  return "Your watchlist is ready.";
}

export function WatchlistExperienceWorkspace() {
  const [intelligenceGeneratedAt] = useState(() => new Date().toISOString());
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

  const items = useMemo(() => summary?.items ?? [], [summary?.items]);
  const missingQuotes = summary?.missingQuoteCount ?? summary?.unquotedItemCount ?? 0;
  const intelligenceGeneratedAtValue = summary?.generatedAt ?? intelligenceGeneratedAt;
  const assetIntelligence = useMemo(
    () =>
      getAssetIntelligence({
        generatedAt: intelligenceGeneratedAtValue,
        watchlistItems: items,
      }),
    [intelligenceGeneratedAtValue, items],
  );
  const monitoringEvents = useMemo(
    () =>
      getMonitoringEvents({
        assets: assetIntelligence,
        generatedAt: intelligenceGeneratedAtValue,
      }),
    [assetIntelligence, intelligenceGeneratedAtValue],
  );
  const todayFocus = useMemo(
    () =>
      getTodayFocus({
        assets: assetIntelligence,
        generatedAt: intelligenceGeneratedAtValue,
      }),
    [assetIntelligence, intelligenceGeneratedAtValue],
  );
  const assetsBySymbol = useMemo(() => {
    const map = new Map<string, AssetIntelligence>();
    assetIntelligence.forEach((asset) => {
      map.set(asset.symbol, asset);
    });
    return map;
  }, [assetIntelligence]);
  const newsCoverageCount = assetIntelligence.filter((asset) => asset.newsState.status !== "missing").length;
  const highPriorityCount = monitoringEvents.filter((event) => event.priorityScore >= 70).length;

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/input", icon: Plus, label: "新增追蹤標的" },
            { href: "/my-ixai/morning-brief", icon: Newspaper, label: "閱讀市場摘要", variant: "secondary" },
          ]}
          eyebrow="Markets"
          kpis={[
            { description: "目前用 Watchlist 代表你的市場關注範圍。", icon: Eye, label: "Watchlist", value: String(summary?.itemCount ?? 0) },
            { description: "與關注標的相關的高優先級變化。", icon: Bell, label: "Market Movers", value: String(highPriorityCount) },
            { description: "已有新聞或主題覆蓋的標的。", icon: Newspaper, label: "Market News", value: String(newsCoverageCount) },
            { description: "下一步會由 Timeline 顯示更完整的事件日程。", icon: CalendarClock, label: "Economic Calendar", value: "觀察中" },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                What happened today that affects me?
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{marketState(summary)}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Markets is about external events: watchlist, market movers, news, and calendar. Portfolio performance stays on Portfolio.
              </p>
            </>
          }
          summary="Markets explains what happened outside your portfolio that may affect your attention today."
          title="Markets: what moved around you today."
        />

        {!summary?.itemCount ? (
          <WorkspaceEmptyState
            actionHref="/my-ixai/input"
            actionLabel="建立 Watchlist"
            body="No watchlist yet. Create your watchlist so IXAI can explain which market moves affect you."
            icon={Plus}
            title="No market focus yet."
          />
        ) : null}

        <WorkspaceProductSection
          description="A concise market answer before individual symbols."
          eyebrow="Today's Market Summary"
          title="今天市場重點"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "US market impact will focus on your watched US symbols.", icon: Globe2, label: "US Market", value: items.some((item) => item.assetType === "stock") ? "需留意" : "待建立" },
              { description: "Taiwan market context appears when related symbols or news are available.", icon: Landmark, label: "Taiwan Market", value: "觀察中" },
              { description: "Crypto context appears when crypto symbols are watched.", icon: Radio, label: "Crypto", value: items.some((item) => item.assetType === "crypto") ? "需留意" : "待建立" },
              { description: "Watchlist is the user's personal market lens.", icon: Eye, label: "Watchlist", value: `${summary?.itemCount ?? 0} symbols` },
            ]}
          />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Every watched symbol explains why it matters instead of only showing a price."
          eyebrow="Watchlist"
          title="你關注的市場"
        >
          {items.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-3">
              {items.slice(0, 6).map((item) => {
                const asset = assetsBySymbol.get(item.symbol.toUpperCase());
                return (
                  <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={item.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-base font-semibold text-[var(--ixai-forest)]">{item.symbol}</p>
                        <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">{item.name}</p>
                      </div>
                      <span className="rounded-full border border-[var(--ixai-border)] bg-white/72 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                        {formatPrice(item.quote?.quote?.price, item.quote?.quote?.currency)}
                      </span>
                    </div>
                    <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/56 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                      Why it matters: {whyWatchlistMatters(item, asset, monitoringEvents)}
                    </p>
                    <p className="mt-3 text-xs text-[var(--ixai-forest-soft)]">
                      Coverage {formatScore(asset?.coverage.score)} · Updated {formatTime(item.updatedAt ?? summary?.liveMarketAsOf)}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <WorkspaceEmptyState
              actionHref="/my-ixai/input"
              actionLabel="新增追蹤標的"
              body="No market events today because no symbols are being watched yet."
              icon={Eye}
              title="No watchlist yet."
            />
          )}
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Market movers are external events. They do not repeat Portfolio value or allocation."
          eyebrow="Market Movers"
          title="今天值得留意的市場變化"
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {(todayFocus.length > 0 ? todayFocus.slice(0, 3) : monitoringEvents.slice(0, 3)).map((event, index) => (
              <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={`${event.title}-${index}`}>
                <p className="text-base font-semibold text-[var(--ixai-forest)]">{event.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {event.whyItMatters}
                </p>
              </article>
            ))}
            {todayFocus.length === 0 && monitoringEvents.length === 0 ? (
              <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)] lg:col-span-3">
                No market events today. Add watchlist symbols to make this view more useful.
              </p>
            ) : null}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Market news and calendar remain a market context layer, not a portfolio valuation layer."
          eyebrow="Market News / Economic Calendar"
          title="新聞與日程"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "具備新聞覆蓋的關注標的。", icon: Newspaper, label: "Relevant News", value: String(newsCoverageCount) },
              { description: "高優先級市場事件。", icon: Bell, label: "Important Items", tone: highPriorityCount > 0 ? "warning" : "default", value: String(highPriorityCount) },
              { description: "日程內容會在 Timeline 中完整呈現。", icon: CalendarClock, label: "Calendar", value: "See Timeline" },
            ]}
          />
        </WorkspaceProductSection>

        {isLoading ? (
          <WorkspaceLoadingCard
            body="正在整理你關注的市場。缺少的部分會用清楚文字說明。"
            title="正在整理 Markets"
          />
        ) : null}

        {!isLoading && missingQuotes > 0 ? (
          <WorkspaceStateMessage
            body={`${missingQuotes} watched symbols need a market update. They remain visible, but market impact is limited.`}
            variant="provider-unavailable"
          />
        ) : null}

        <WorkspaceDiagnosticsPanel description="watchlist storage, market data availability, diagnostics">
          <WatchlistSummary />
          <WorkspaceKpiGrid
            items={[
              { description: "Persisted watchlist items.", icon: Eye, label: "Persisted", value: String(persistence?.persistedItems ?? 0) },
              { description: "Local or fallback watchlist items.", icon: Bell, label: "Local / Fallback", value: String((persistence?.localItems ?? 0) + (persistence?.fallbackItems ?? 0)) },
              { description: "Symbols with available quotes.", icon: LineChart, label: "Available Quotes", value: String(summary?.quotedItemCount ?? 0) },
              { description: "Symbols waiting for quotes.", icon: ShieldCheck, label: "Waiting", value: String(missingQuotes) },
            ]}
          />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}

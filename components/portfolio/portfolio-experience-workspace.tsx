"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CandlestickChart,
  Newspaper,
  PieChart,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { LivePortfolioValuationCard } from "@/components/portfolio/live-portfolio-valuation-card";
import { PortfolioPersistenceSummary } from "@/components/portfolio/portfolio-persistence-summary";
import { PortfolioTruthSummary } from "@/components/portfolio/portfolio-truth-summary";
import { PortfolioValuationSummary } from "@/components/portfolio/portfolio-valuation-summary";
import { RecentInputsPanel } from "@/components/portfolio/recent-inputs-panel";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceEmptyState,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
  WorkspaceStateMessage,
  WorkspaceStatusBadge,
} from "@/components/workspace/product";
import { useTranslation } from "@/src/lib/i18n";
import { getAssetIntelligence } from "@/src/lib/intelligence/assets";
import type { AssetIntelligence } from "@/src/lib/intelligence/assets";
import { getMonitoringEvents, getTodayFocus } from "@/src/lib/intelligence/monitoring";
import type { MonitoringEvent } from "@/src/lib/intelligence/monitoring";
import { getNotificationDeliveryPreview } from "@/src/lib/intelligence/notifications";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function formatCurrency(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return new Intl.NumberFormat("zh-TW", {
    currency: currency === "MIXED" || currency === "USDT" ? "USD" : currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return `${Math.round(value * 100)}%`;
}

function formatTime(value: string | null | undefined) {
  if (!value) return "待更新";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "待更新";
  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

function relatedEvents(asset: AssetIntelligence | null | undefined, events: MonitoringEvent[]) {
  if (!asset) return [];
  return events.filter((event) => event.assetId === asset.id || event.relatedAssetIds.includes(asset.id));
}

function monitoringLabel(asset: AssetIntelligence | null | undefined, events: MonitoringEvent[]) {
  const eventsForAsset = relatedEvents(asset, events);
  if (!asset) return "等待資料";
  if (eventsForAsset.some((event) => event.severity === "critical")) return "優先查看";
  if (eventsForAsset.some((event) => event.severity === "warning")) return "正在監控";
  return asset.monitoringState.enabled ? "正常監控" : "準備中";
}

function priorityLabel(asset: AssetIntelligence | null | undefined, events: MonitoringEvent[]) {
  const priority = relatedEvents(asset, events).reduce(
    (max, event) => Math.max(max, event.priorityScore),
    0,
  );
  return priority > 0 ? String(priority) : "一般";
}

function themesLabel(asset: AssetIntelligence | null | undefined, events: MonitoringEvent[]) {
  if (!asset) return "待建立";
  const themes = new Set([
    ...asset.themes,
    ...relatedEvents(asset, events).flatMap((event) => event.relatedThemes),
  ]);
  return themes.size > 0 ? Array.from(themes).slice(0, 2).join(", ") : "待建立";
}

export function PortfolioExperienceWorkspace() {
  const { t } = useTranslation("productPolish");
  const [intelligenceGeneratedAt] = useState(() => new Date().toISOString());
  const [valuation, setValuation] = useState<PortfolioValuationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function loadValuation() {
      setIsLoading(true);
      const result = await runWorkspaceSafe(
        "portfolio-experience-valuation",
        getWorkspacePortfolioValuation,
        null,
      );

      if (!mountedRef.current) return;
      setValuation(result.data);
      setIsLoading(false);
    }

    queueMicrotask(() => {
      void loadValuation();
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const summary = valuation?.summary;
  const topAllocation = useMemo(
    () =>
      summary?.assetAllocation
        .filter((item) => item.marketValue > 0)
        .sort((a, b) => b.marketValue - a.marketValue)[0],
    [summary],
  );
  const riskStatus =
    !summary || summary.positionCount === 0
      ? "暫無資料"
      : summary.unpricedPositionCount > 0 || summary.sourceStatus !== "live"
        ? "需要留意"
        : "穩定";
  const intelligenceGeneratedAtValue = summary?.updatedAt ?? intelligenceGeneratedAt;
  const assetIntelligence = useMemo(
    () =>
      getAssetIntelligence({
        generatedAt: intelligenceGeneratedAtValue,
        portfolioPositions: valuation?.positions ?? [],
      }),
    [intelligenceGeneratedAtValue, valuation?.positions],
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
  const notificationPreview = useMemo(
    () =>
      getNotificationDeliveryPreview({
        generatedAt: intelligenceGeneratedAtValue,
        monitoringEvents,
      }),
    [intelligenceGeneratedAtValue, monitoringEvents],
  );
  const assetsBySymbol = useMemo(() => {
    const map = new Map<string, AssetIntelligence>();
    assetIntelligence.forEach((asset) => {
      map.set(asset.symbol, asset);
    });
    return map;
  }, [assetIntelligence]);
  const healthyAssets = assetIntelligence.filter((asset) => asset.health.status === "healthy").length;
  const warningAssets = assetIntelligence.filter((asset) => asset.health.status === "degraded").length;
  const criticalEvents = monitoringEvents.filter((event) => event.severity === "critical").length;
  const relatedNewsCount = assetIntelligence.filter((asset) => asset.newsState.status !== "missing").length;
  const coverageScore = assetIntelligence.length
    ? assetIntelligence.reduce((sum, asset) => sum + asset.coverage.score, 0) / assetIntelligence.length
    : 0;

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/input", icon: PlusCircle, label: "新增資產" },
            { href: "/my-ixai/risk", icon: ShieldAlert, label: "查看風險", variant: "secondary" },
          ]}
          eyebrow="我的資產"
          kpis={[
            {
              description: summary?.positionCount ? "依目前可用資料估算。" : "新增資產後會顯示總資產。",
              icon: WalletCards,
              label: t("portfolioTotalAssets"),
              value: formatCurrency(summary?.totalMarketValue, valuation?.currency),
            },
            {
              description: "目前納入資產頁的持倉數。",
              icon: BriefcaseBusiness,
              label: t("portfolioHoldings"),
              value: String(summary?.positionCount ?? 0),
            },
            {
              description: topAllocation ? "目前占比最高的資產類別。" : "尚未有配置資料。",
              icon: PieChart,
              label: t("portfolioAllocation"),
              value: topAllocation ? `${topAllocation.assetClass.toUpperCase()} ${topAllocation.allocationPercent.toFixed(0)}%` : "暫無資料",
            },
            {
              description: summary?.unpricedPositionCount ? `${summary.unpricedPositionCount} 筆資產需要補資料。` : "目前沒有明顯資料缺口。",
              icon: ShieldAlert,
              label: t("dataStatus"),
              value: riskStatus,
            },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                今日表現
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {formatPercent(summary?.totalUnrealizedPnlPercent)}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {summary?.positionCount
                  ? "這裡先呈現資產總覽與今日可用變化，資料來源細節已移到進階診斷。"
                  : "尚未有完整資產資料。新增資產後，IXAI 會整理總資產、配置與風險。"}
              </p>
            </>
          }
          summary={t("portfolioHeroBody")}
          title={t("portfolioHeroTitle")}
        />

        {!summary?.positionCount ? (
          <WorkspaceEmptyState
            actionHref="/my-ixai/input"
            actionLabel={t("emptyPortfolioAction")}
            body={t("emptyPortfolioBody")}
            icon={PlusCircle}
            title={t("emptyPortfolioTitle")}
          />
        ) : null}

        <WorkspaceProductSection
          action={
            <Link
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
              href="/my-ixai/input"
            >
              新增資產
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          }
          description="用使用者語言整理資產配置、持倉數、已更新價格與待補資料。"
          eyebrow="Portfolio Snapshot"
          title="資產快照"
        >
          <WorkspaceKpiGrid
            items={[
              {
                description: topAllocation ? "目前資產配置中最大的類別。" : "新增資產後會顯示配置。",
                icon: PieChart,
                label: "配置重點",
                value: topAllocation ? `${topAllocation.assetClass.toUpperCase()} ${topAllocation.allocationPercent.toFixed(0)}%` : "暫無資料",
              },
              {
                description: "目前已整理的資產筆數。",
                icon: BarChart3,
                label: "持倉數",
                value: String(summary?.positionCount ?? 0),
              },
              {
                description: "可估價的資產筆數。",
                icon: CandlestickChart,
                label: "已更新價格",
                value: String(summary?.pricedPositionCount ?? 0),
              },
              {
                description: "需要補價格或成本資料的資產。",
                icon: ShieldAlert,
                label: "待補資料",
                tone: summary?.unpricedPositionCount ? "warning" : "default",
                value: String(summary?.unpricedPositionCount ?? 0),
              },
            ]}
          />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="重用 Asset Intelligence、Monitoring Engine 與 Notification Preview，整理投資組合目前被 AI 監控到的狀態。"
          eyebrow="Portfolio Intelligence"
          title="投資組合 Intelligence 摘要"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "目前資料與監控狀態穩定的資產。", icon: ShieldCheck, label: "健康資產", tone: "success", value: String(healthyAssets) },
              { description: "需要補資料或持續留意的資產。", icon: ShieldAlert, label: "需要留意", tone: warningAssets > 0 ? "warning" : "default", value: String(warningAssets) },
              { description: "Monitoring Engine 判定需優先查看的事件。", icon: Bell, label: "優先事件", tone: criticalEvents > 0 ? "critical" : "default", value: String(criticalEvents) },
              { description: "Today Focus 中與投資組合相關的重點。", icon: Sparkles, label: "Today Focus", value: String(todayFocus.length) },
              { description: "具備新聞 / editorial coverage 的資產。", icon: Newspaper, label: "相關資訊", value: String(relatedNewsCount) },
              { description: "整體 coverage foundation 分數。", icon: BarChart3, label: "Coverage", value: formatScore(coverageScore) },
            ]}
          />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="每個 position 只顯示 read-only intelligence 狀態：健康度、監控、coverage、主題、優先級與信心分數。"
          eyebrow="Position Intelligence"
          title="持倉 Intelligence"
        >
          {valuation?.positions.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {valuation.positions.slice(0, 8).map((position) => {
                const asset = assetsBySymbol.get(position.symbol.toUpperCase());
                return (
                  <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={position.id}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-mono text-base font-semibold text-[var(--ixai-forest)]">{position.symbol}</p>
                        <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">{position.name}</p>
                      </div>
                      <WorkspaceStatusBadge variant={asset?.health.status === "healthy" ? "healthy" : asset?.health.status === "degraded" ? "warning" : asset?.health.status === "offline" ? "critical" : "unknown"}>
                        {asset?.health.status === "healthy" ? "Healthy" : asset?.health.status === "degraded" ? "Warning" : asset?.health.status === "offline" ? "Critical" : "Unknown"}
                      </WorkspaceStatusBadge>
                    </div>
                    <div className="mt-4 grid gap-2 text-xs leading-5 text-[var(--ixai-forest-soft)] sm:grid-cols-2">
                      <p>監控狀態：{monitoringLabel(asset, monitoringEvents)}</p>
                      <p>Coverage：{formatScore(asset?.coverage.score)}</p>
                      <p>Related Themes：{themesLabel(asset, monitoringEvents)}</p>
                      <p>Priority：{priorityLabel(asset, monitoringEvents)}</p>
                      <p>Confidence：{formatScore(asset?.quality.confidence)}</p>
                      <p>Last Updated：{formatTime(asset?.lastUpdated)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <WorkspaceEmptyState
              actionHref="/my-ixai/input"
              actionLabel="新增資產"
              body="新增 Portfolio position 後，IXAI 會在這裡顯示 Asset Health、Monitoring Status、Editorial Coverage 與 Priority。"
              icon={Sparkles}
              title="尚未建立持倉 Intelligence"
            />
          )}
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="今日需要注意與最近變化先用友善空狀態呈現，進階資料狀態放在頁尾。"
          eyebrow={t("todaySummary")}
          title="今天需要注意"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <p className="text-sm font-semibold text-[var(--ixai-forest)]">資料完整度</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {summary?.unpricedPositionCount
                  ? `${summary.unpricedPositionCount} 筆資產需要補齊價格、成本或數量，才會讓風險與估值更完整。`
                  : "目前沒有需要立即處理的資料缺口。"}
              </p>
            </article>
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <p className="text-sm font-semibold text-[var(--ixai-forest)]">最近變化</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {isLoading
                  ? "正在整理資產資料。"
                  : "最近新增與輸入紀錄保留在下方，方便回到原始輸入檢查。"}
              </p>
            </article>
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="保留原有 holdings / allocation 入口，但不把 technical source 放在主要區塊前面。"
          eyebrow="Holdings / Allocation"
          title="資產類別"
        >
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { href: "/my-ixai/input/stock", icon: CandlestickChart, label: "股票 / ETF", text: "新增或檢查股票與 ETF 持倉。" },
              { href: "/my-ixai/input/crypto", icon: BarChart3, label: "Crypto", text: "整理 crypto 持倉與觀察標的。" },
              { href: "/my-ixai/input/fcn", icon: ShieldAlert, label: "FCN", text: "新增 FCN 後可在 FCN 風險頁追蹤 KI 與觀察日。" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className="group rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4 transition hover:-translate-y-0.5 hover:bg-white/86"
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
                  <p className="mt-3 text-base font-semibold text-[var(--ixai-forest)]">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.text}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
                    開啟
                    <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </WorkspaceProductSection>

        <RecentInputsPanel />

        {!isLoading && summary?.positionCount && summary.unpricedPositionCount > 0 ? (
          <WorkspaceStateMessage
            body={`${summary.unpricedPositionCount} 筆資產缺少價格或成本資料，Portfolio Intelligence 會先以 limited coverage 顯示。`}
            variant="no-coverage"
          />
        ) : null}

        <WorkspaceDiagnosticsPanel description="資產資料、估值與更新狀態">
          <WorkspaceProductSection
            description="Portfolio Intelligence diagnostics 只顯示 read-only 狀態，不觸發通知或交易。"
            eyebrow="Portfolio Diagnostics"
            title="投資組合 Intelligence 診斷"
          >
            <WorkspaceKpiGrid
              items={[
                { description: "Asset Intelligence 建立的資產數。", icon: WalletCards, label: "Assets", value: String(assetIntelligence.length) },
                { description: "Monitoring Engine 產生的事件數。", icon: Bell, label: "Events", value: String(monitoringEvents.length) },
                { description: "Notification Platform preview 項目。", icon: Sparkles, label: "Preview", value: String(notificationPreview.notifications.length) },
                { description: "整體 coverage。", icon: BarChart3, label: "Coverage", value: formatScore(coverageScore) },
              ]}
            />
          </WorkspaceProductSection>
          <PortfolioTruthSummary />
          <PortfolioPersistenceSummary />
          <PortfolioValuationSummary />
          <LivePortfolioValuationCard />
          <WorkspaceMarketStatus contextLabel="Portfolio Center" />
        </WorkspaceDiagnosticsPanel>

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          IXAI 提供投資監控與風險 awareness，不提供買賣建議、持有建議或目標價。
        </p>
      </section>
    </main>
  );
}

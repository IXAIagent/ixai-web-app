"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CircleAlert,
  Newspaper,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { FcnRiskSummary } from "@/components/fcn/fcn-risk-summary";
import { FcnScheduleSummary } from "@/components/fcn/fcn-schedule-summary";
import { LiveFcnUnderlyingStatusCard } from "@/components/fcn/live-fcn-underlying-status-card";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
  WorkspaceStateMessage,
  WorkspaceStatusBadge,
} from "@/components/workspace/product";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule/fcn-schedule-service";
import type { FcnPortfolioScheduleSummary } from "@/src/lib/fcn/schedule/fcn-schedule-types";
import { getAssetIntelligence } from "@/src/lib/intelligence/assets";
import type { AssetIntelligence } from "@/src/lib/intelligence/assets";
import { getMonitoringEvents, getTodayFocus } from "@/src/lib/intelligence/monitoring";
import type { MonitoringEvent } from "@/src/lib/intelligence/monitoring";
import { getNotificationDeliveryPreview } from "@/src/lib/intelligence/notifications";
import type { PositionValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

type FcnExperienceData = {
  risk: FcnPortfolioRiskSummary | null;
  schedule: FcnPortfolioScheduleSummary | null;
};

function riskState(summary: FcnPortfolioRiskSummary | null) {
  if (!summary || summary.positionCount === 0) return "暫無資料";
  if (summary.criticalRiskCount > 0) return "危險";
  if (summary.highRiskCount > 0 || summary.unavailablePositionCount > 0) return "注意";
  return "安全";
}

function nearestKi(summary: FcnPortfolioRiskSummary | null) {
  const distances = summary?.summaries
    .map((item) => item.nearestKiDistancePercent)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .sort((a, b) => a - b);

  if (!distances?.length) return "暫無資料";
  return `${distances[0].toFixed(1)}%`;
}

function nextObservation(schedule: FcnPortfolioScheduleSummary | null) {
  const event = schedule?.next30DayEvents.find(
    (item) => item.eventType === "observation" || item.eventType === "ko_observation",
  );

  if (!event) return "暫無資料";
  if (typeof event.daysUntilEvent === "number") return `${event.daysUntilEvent} 天`;
  return "待確認";
}

function formatScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return `${Math.round(value * 100)}%`;
}

function relatedEvents(asset: AssetIntelligence | null | undefined, events: MonitoringEvent[]) {
  if (!asset) return [];
  return events.filter((event) => event.assetId === asset.id || event.relatedAssetIds.includes(asset.id));
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

function fcnSummariesToPortfolioPositions(summary: FcnPortfolioRiskSummary | null): PositionValuation[] {
  return (summary?.summaries ?? []).map((item) => ({
    allocationPercent: summary?.positionCount ? 100 / summary.positionCount : 0,
    assetClass: "fcn",
    costBasis: null,
    currency: "USD",
    fcnRiskStatus: item.riskLevel === "unavailable" ? "unavailable" : item.riskLevel === "critical" ? "partial" : "pending",
    id: item.id,
    marketPrice: null,
    marketValue: null,
    name: item.name,
    nearestKiDistancePercent: item.nearestKiDistancePercent,
    quantity: null,
    sourceStatus: item.sourceStatus,
    symbol: item.worstOfSymbol ?? item.name,
    unrealizedPnl: null,
    unrealizedPnlPercent: null,
    warningMessage: item.warnings[0]?.message,
    worstOfSymbol: item.worstOfSymbol,
  }));
}

export function FcnExperienceWorkspace() {
  const [intelligenceGeneratedAt] = useState(() => new Date().toISOString());
  const [data, setData] = useState<FcnExperienceData>({ risk: null, schedule: null });
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function loadFcnExperience() {
      const [riskResult, scheduleResult] = await Promise.all([
        runWorkspaceSafe("fcn-experience-risk", getWorkspaceFcnRiskSummary, null),
        runWorkspaceSafe("fcn-experience-schedule", getWorkspaceFcnScheduleSummary, null),
      ]);

      if (!mountedRef.current) return;
      setData({
        risk: riskResult.data,
        schedule: scheduleResult.data,
      });
    }

    queueMicrotask(() => {
      void loadFcnExperience();
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const state = riskState(data.risk);
  const watchCount = (data.risk?.highRiskCount ?? 0) + (data.risk?.unavailablePositionCount ?? 0);
  const highRiskCount = data.risk?.criticalRiskCount ?? 0;
  const intelligenceGeneratedAtValue = data.risk?.updatedAt ?? intelligenceGeneratedAt;
  const fcnIntelligencePositions = useMemo(
    () => fcnSummariesToPortfolioPositions(data.risk),
    [data.risk],
  );
  const assetIntelligence = useMemo(
    () =>
      getAssetIntelligence({
        generatedAt: intelligenceGeneratedAtValue,
        portfolioPositions: fcnIntelligencePositions,
      }),
    [fcnIntelligencePositions, intelligenceGeneratedAtValue],
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
  const fcnKiEvents = monitoringEvents.filter((event) => event.eventType === "fcn-ki-risk").length;
  const observationEvents = monitoringEvents.filter((event) => event.eventType === "fcn-observation").length;
  const couponEvents = monitoringEvents.filter((event) => event.eventType === "fcn-coupon").length;
  const relatedThemes = new Set(monitoringEvents.flatMap((event) => event.relatedThemes));

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/input/fcn", icon: WalletCards, label: "新增 FCN" },
            { href: "/my-ixai/risk", icon: ShieldAlert, label: "查看整體風險", variant: "secondary" },
          ]}
          eyebrow="FCN Risk Workspace"
          kpis={[
            {
              description: "目前納入 FCN 監控的產品數。",
              icon: WalletCards,
              label: "FCN Count",
              value: String(data.risk?.positionCount ?? 0),
            },
            {
              description: "需要今天留意或資料不足的 FCN。",
              icon: ShieldAlert,
              label: "Watch Count",
              value: String(watchCount),
            },
            {
              description: "距 KI 或資料狀態需要優先查看。",
              icon: CircleAlert,
              label: "High Risk Count",
              value: String(highRiskCount),
            },
            {
              description: "下一個觀察日或 KO observation。",
              icon: CalendarDays,
              label: "Upcoming Observation",
              value: nextObservation(data.schedule),
            },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                FCN 狀態
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{state}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                最接近 KI：{nearestKi(data.risk)}。IXAI 只做監控與提醒，不提供買賣或持有建議。
              </p>
            </>
          }
          summary="先看安全 / 注意 / 危險、距 KI、下一個觀察日與本月配息，再往下看 position details。"
          title="FCN 風險監控：先看需要留意的產品。"
        />

        <WorkspaceProductSection
          description="把 Worst-of、KI、觀察日、配息與相關主題整理成一眼可看的摘要。"
          eyebrow="FCN Summary"
          title="FCN Intelligence 摘要"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "最接近 KI 或資料狀態最需要留意的 Worst-of。", icon: ShieldAlert, label: "Worst-of", tone: highRiskCount > 0 ? "critical" : watchCount > 0 ? "warning" : "default", value: nearestKi(data.risk) },
              { description: "與 KI 距離相關的注意事項。", icon: CircleAlert, label: "KI Events", tone: fcnKiEvents > 0 ? "warning" : "default", value: String(fcnKiEvents) },
              { description: "未來觀察日事項。", icon: CalendarDays, label: "Observation", value: String(observationEvents) },
              { description: "未來配息事項。", icon: WalletCards, label: "Coupon", value: String(couponEvents) },
              { description: "相關市場主題。", icon: Newspaper, label: "Related Themes", value: String(relatedThemes.size) },
              { description: "Today Focus 中與 FCN 相關的重點。", icon: Sparkles, label: "Today Focus", value: String(todayFocus.length) },
            ]}
          />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="每檔 FCN 只顯示需要留意的狀態，不提供買賣、持有或目標價建議。"
          eyebrow="FCN Monitoring"
          title="每檔 FCN 的監控狀態"
        >
          {data.risk?.summaries.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {data.risk.summaries.slice(0, 8).map((item) => {
                const asset = assetsBySymbol.get((item.worstOfSymbol ?? item.name).toUpperCase());
                const eventsForAsset = relatedEvents(asset, monitoringEvents);
                return (
                  <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={item.id}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.name}</p>
                        <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">
                          Worst-of：{item.worstOfSymbol ?? "待確認"}
                        </p>
                      </div>
                      <WorkspaceStatusBadge variant={item.riskLevel === "critical" ? "critical" : item.riskLevel === "high" || item.riskLevel === "medium" ? "warning" : item.riskLevel === "low" ? "healthy" : "unknown"}>
                        {item.riskLevel === "critical" ? "Critical" : item.riskLevel === "high" || item.riskLevel === "medium" ? "Warning" : item.riskLevel === "low" ? "Healthy" : "Unknown"}
                      </WorkspaceStatusBadge>
                    </div>
                    <div className="mt-4 grid gap-2 text-xs leading-5 text-[var(--ixai-forest-soft)] sm:grid-cols-2">
                      <p>KI Risk：{item.nearestKiDistancePercent == null ? "待確認" : `${item.nearestKiDistancePercent.toFixed(1)}%`}</p>
                      <p>Observation：{item.koReady ? "可觀察 KO" : "持續監控"}</p>
                      <p>Coupon：{data.schedule?.monthlyCashflows.length ? "有配息排程" : "待建立"}</p>
                      <p>Market Signals：{eventsForAsset.length}</p>
                      <p>Asset Health：{asset?.health.status === "healthy" ? "穩定" : asset ? "需要留意" : "等待資料"}</p>
                      <p>Priority：{priorityLabel(asset, monitoringEvents)}</p>
                      <p>Related Themes：{themesLabel(asset, monitoringEvents)}</p>
                      <p>Confidence：{formatScore(asset?.quality.confidence)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                新增 FCN 後，IXAI 會在這裡整理 Worst-of、KI 距離、觀察日、配息與相關市場變化。
            </p>
          )}
        </WorkspaceProductSection>

        {data.risk?.unavailablePositionCount ? (
          <WorkspaceStateMessage
            body={`${data.risk.unavailablePositionCount} 檔 FCN 暫時缺少足夠資料，系統會以 limited monitoring 顯示並保留風險提示。`}
            variant="no-data"
          />
        ) : null}

        <WorkspaceProductSection
          description="優先呈現最接近 KI、Worst-of、KO readiness 與資料不足狀態。"
          eyebrow="Risk Summary"
          title="需要留意的 FCN"
        >
          <FcnRiskSummary />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="整理 observation、coupon、maturity 與 next 30 days，讓時間壓力先被看見。"
          eyebrow="Upcoming Schedule"
          title="觀察日、配息與到期"
        >
          <FcnScheduleSummary />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          action={
            <Link
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
              href="/my-ixai/input/fcn"
            >
              新增 FCN
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          }
          description="Positions 先以風險摘要與時間表呈現；更細的資料狀態保留在進階資訊。"
          eyebrow="Positions"
          title="FCN Positions"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "目前可分析的 FCN 產品。", icon: ShieldCheck, label: "已分析", value: String(data.risk?.analyzedPositionCount ?? 0) },
              { description: "距 KI 或資料不足需要注意。", icon: ShieldAlert, label: "需要留意", value: String(watchCount), tone: watchCount > 0 ? "warning" : "default" },
              { description: "未能完整判斷的產品。", icon: CircleAlert, label: "暫無資料", value: String(data.risk?.unavailablePositionCount ?? 0) },
              { description: "未來 30 天事件。", icon: CalendarDays, label: "Next 30 Days", value: String(data.schedule?.next30DayEvents.length ?? 0) },
            ]}
          />
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="FCN 資料狀態與進階檢查">
          <WorkspaceProductSection
            description="整理 FCN 相關資料完整度、提醒預覽與主題覆蓋。"
            eyebrow="FCN Diagnostics"
            title="FCN Intelligence 診斷"
          >
            <WorkspaceKpiGrid
              items={[
                { description: "FCN Asset Intelligence 建立的資產數。", icon: WalletCards, label: "Assets", value: String(assetIntelligence.length) },
                { description: "FCN 相關注意事項。", icon: Bell, label: "Events", value: String(monitoringEvents.length) },
                { description: "提醒預覽項目。", icon: Sparkles, label: "Preview", value: String(notificationPreview.notifications.length) },
                { description: "Related theme count。", icon: BarChart3, label: "Themes", value: String(relatedThemes.size) },
              ]}
            />
          </WorkspaceProductSection>
          <LiveFcnUnderlyingStatusCard />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}

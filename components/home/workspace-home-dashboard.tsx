"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CircleAlert,
  Eye,
  LineChart,
  Newspaper,
  PieChart,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { useIdentity } from "@/components/auth/auth-provider";
import { I18nFoundationStatusCard } from "@/components/i18n/i18n-foundation-status-card";
import { LocalizationPreview } from "@/components/i18n/localization-preview";
import { LiveMarketDataStatus } from "@/components/market/live-market-data-status";
import { WorkspaceHealthSummary } from "@/components/workspace/workspace-health-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceLoadingCard,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import { buildEmptyWorkspaceAlertSummary, getWorkspaceAlertSummary } from "@/src/lib/alerts";
import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import { getWorkspaceIntelligence } from "@/src/lib/intelligence/workspace";
import type { WorkspaceIntelligenceResult } from "@/src/lib/intelligence/workspace";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import type {
  PortfolioValuationResult,
  PositionValuation,
} from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import { getWorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import type { WorkspaceTimelineEvent, WorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

type HomeData = {
  alerts: WorkspaceAlertSummary;
  fcnRisk: FcnPortfolioRiskSummary | null;
  portfolio: PortfolioValuationResult | null;
  timeline: WorkspaceTimelineSummary | null;
};

type TodayPriority = {
  body: string;
  href: string;
  icon: typeof CircleAlert;
  label: string;
  tone: "critical" | "default" | "success" | "warning";
  title: string;
};

const defaultHomeData: HomeData = {
  alerts: buildEmptyWorkspaceAlertSummary(),
  fcnRisk: null,
  portfolio: null,
  timeline: null,
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "full",
  }).format(value);
}

function formatCurrency(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "暫無資料";
  }

  return new Intl.NumberFormat("zh-TW", {
    currency: currency === "MIXED" || currency === "USDT" ? "USD" : currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatSignedCurrency(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "暫無資料";
  }

  const formatted = formatCurrency(Math.abs(value), currency);
  return `${value >= 0 ? "+" : "-"}${formatted}`;
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "暫無資料";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return "待更新";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "待更新";
  }

  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function healthLabel(health: string | null | undefined) {
  switch (health) {
    case "healthy":
      return "穩定";
    case "degraded":
      return "部分資料需留意";
    case "offline":
      return "需處理";
    default:
      return "觀察中";
  }
}

function readinessLabel(level: string | null | undefined) {
  switch (level) {
    case "green":
      return "就緒";
    case "yellow":
      return "需留意";
    case "red":
      return "需處理";
    default:
      return "觀察中";
  }
}

function getAttentionCount(alerts: WorkspaceAlertSummary, fcnRisk: FcnPortfolioRiskSummary | null) {
  return (
    alerts.criticalCount +
    alerts.highCount +
    alerts.warningCount +
    (fcnRisk?.criticalRiskCount ?? 0) +
    (fcnRisk?.highRiskCount ?? 0)
  );
}

function getTodayStatusLabel(attentionCount: number, portfolio: PortfolioValuationResult | null) {
  if (!portfolio?.summary.positionCount) {
    return "今天先建立資產輪廓。";
  }

  if (attentionCount >= 3) {
    return "今天需要優先查看。";
  }

  if (attentionCount > 0) {
    return "今天整體穩定，但有幾件事值得留意。";
  }

  return "今天看起來穩定。";
}

function getRiskCopy(alerts: WorkspaceAlertSummary, fcnRisk: FcnPortfolioRiskSummary | null) {
  const attentionCount = getAttentionCount(alerts, fcnRisk);

  if (attentionCount > 0) {
    return `${attentionCount} 件事值得今天查看。`;
  }

  return "目前沒有需要立即處理的提醒。";
}

function getPortfolioMovement(portfolio: PortfolioValuationResult | null) {
  const value = portfolio?.summary.totalUnrealizedPnl;
  const percent = portfolio?.summary.totalUnrealizedPnlPercent;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "今日損益待整理";
  }

  return `${formatSignedCurrency(value, portfolio?.currency)} (${formatPercent(percent)})`;
}

function getLargestPosition(portfolio: PortfolioValuationResult | null) {
  return [...(portfolio?.positions ?? [])]
    .filter((position) => typeof position.marketValue === "number" && Number.isFinite(position.marketValue))
    .sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0))[0];
}

function getLargestGain(portfolio: PortfolioValuationResult | null) {
  return [...(portfolio?.positions ?? [])]
    .filter((position) => typeof position.unrealizedPnl === "number" && Number.isFinite(position.unrealizedPnl))
    .sort((a, b) => (b.unrealizedPnl ?? 0) - (a.unrealizedPnl ?? 0))[0];
}

function getLargestLoss(portfolio: PortfolioValuationResult | null) {
  return [...(portfolio?.positions ?? [])]
    .filter((position) => typeof position.unrealizedPnl === "number" && Number.isFinite(position.unrealizedPnl))
    .sort((a, b) => (a.unrealizedPnl ?? 0) - (b.unrealizedPnl ?? 0))[0];
}

function getAllocationLabel(portfolio: PortfolioValuationResult | null) {
  const topAllocation = portfolio?.summary.assetAllocation
    .filter((item) => item.marketValue > 0)
    .sort((a, b) => b.marketValue - a.marketValue)[0];

  if (!topAllocation) {
    return "尚未建立配置";
  }

  return `${topAllocation.assetClass.toUpperCase()} ${topAllocation.allocationPercent.toFixed(0)}%`;
}

function describePosition(position: PositionValuation | undefined, currency: string | undefined, mode: "gain" | "loss" | "value") {
  if (!position) {
    return "暫無資料";
  }

  if (mode === "value") {
    return `${position.symbol} · ${formatCurrency(position.marketValue, position.currency ?? currency)}`;
  }

  return `${position.symbol} · ${formatSignedCurrency(position.unrealizedPnl, position.currency ?? currency)}`;
}

function friendlyEventType(type: string) {
  switch (type) {
    case "fcn_coupon":
      return "配息";
    case "fcn_ko_observation":
    case "fcn_observation":
      return "觀察日";
    case "fcn_maturity":
      return "到期";
    case "portfolio":
      return "資產";
    case "watchlist":
      return "市場";
    case "alert":
      return "提醒";
    default:
      return "事件";
  }
}

function getUpcomingEvents(timeline: WorkspaceTimelineSummary | null) {
  if (!timeline) {
    return [];
  }

  return timeline.groups
    .flatMap((group) => group.events)
    .filter((event) => event.eventType !== "system")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
}

function buildTodayPriorities({
  alerts,
  fcnRisk,
  portfolio,
  timeline,
}: {
  alerts: WorkspaceAlertSummary;
  fcnRisk: FcnPortfolioRiskSummary | null;
  portfolio: PortfolioValuationResult | null;
  timeline: WorkspaceTimelineSummary | null;
}) {
  const attentionCount = getAttentionCount(alerts, fcnRisk);
  const largestLoss = getLargestLoss(portfolio);
  const nextEvent = getUpcomingEvents(timeline)[0];
  const priorities: TodayPriority[] = [];

  if (attentionCount > 0) {
    priorities.push({
      body: "它可能影響今天檢查資產、FCN 或提醒的順序。",
      href: "/my-ixai/risk",
      icon: ShieldAlert,
      label: "為什麼重要",
      title: `${attentionCount} 件事值得優先查看。`,
      tone: attentionCount >= 3 ? "critical" : "warning",
    });
  }

  if (largestLoss && typeof largestLoss.unrealizedPnlPercent === "number" && largestLoss.unrealizedPnlPercent < 0) {
    priorities.push({
      body: `${largestLoss.symbol} 是目前最需要留意的資產變化。`,
      href: "/my-ixai/portfolio",
      icon: LineChart,
      label: "為什麼重要",
      title: `${largestLoss.symbol} 目前變動 ${formatPercent(largestLoss.unrealizedPnlPercent)}。`,
      tone: "warning",
    });
  }

  if (nextEvent) {
    priorities.push({
      body: nextEvent.relatedSymbol
        ? `${nextEvent.relatedSymbol} 相關事件可能影響你今天的檢查順序。`
        : "它是時間上最接近的投資事件。",
      href: "/my-ixai/timeline",
      icon: CalendarClock,
      label: "為什麼重要",
      title: `${friendlyEventType(nextEvent.eventType)}：${nextEvent.title}`,
      tone: nextEvent.severity === "critical" ? "critical" : nextEvent.severity === "warning" ? "warning" : "default",
    });
  }

  if (priorities.length === 0) {
    priorities.push({
      body: "目前沒有需要立即處理的事項。你可以先查看 Portfolio 或建立 Watchlist。",
      href: "/my-ixai/portfolio",
      icon: ShieldCheck,
      label: "下一步",
      title: "今天沒有明顯需要優先處理的事件。",
      tone: "success",
    });
  }

  return priorities.slice(0, 3);
}

function TodayStatus({
  alerts,
  fcnRisk,
  portfolio,
  timeline,
  today,
}: {
  alerts: WorkspaceAlertSummary;
  fcnRisk: FcnPortfolioRiskSummary | null;
  portfolio: PortfolioValuationResult | null;
  timeline: WorkspaceTimelineSummary | null;
  today: string;
}) {
  const { mounted, session } = useIdentity();
  const displayName =
    mounted && session.user
      ? session.user.name || session.user.email?.split("@")[0] || "歡迎回來"
      : "歡迎回來";
  const attentionCount = getAttentionCount(alerts, fcnRisk);
  const nextEvent = getUpcomingEvents(timeline)[0];
  const updatedAt = formatTime(portfolio?.summary.updatedAt ?? timeline?.generatedAt);

  return (
    <WorkspaceProductHero
      actions={[
        { href: "/my-ixai/portfolio", icon: BriefcaseBusiness, label: "查看 Portfolio" },
        { href: "/my-ixai/morning-brief", icon: Newspaper, label: "閱讀 Morning Brief", variant: "secondary" },
      ]}
      eyebrow="Today's Status"
      kpis={[
        {
          description: portfolio?.summary.positionCount
            ? `${portfolio.summary.positionCount} 筆資產已納入今日概況。`
            : "新增資產後，這裡會顯示你的今日資產狀態。",
          icon: WalletCards,
          label: "Portfolio today",
          value: formatCurrency(portfolio?.summary.totalMarketValue, portfolio?.currency),
        },
        {
          description: getRiskCopy(alerts, fcnRisk),
          icon: ShieldAlert,
          label: "Risk today",
          value: attentionCount > 0 ? "需要留意" : "穩定",
        },
        {
          description: updatedAt === "待更新" ? "市場摘要等待下一次整理。" : `最近整理於 ${updatedAt}。`,
          icon: LineChart,
          label: "Market today",
          value: updatedAt === "待更新" ? "待整理" : "已整理",
        },
        {
          description: nextEvent ? nextEvent.title : "沒有即將到來的重要事件。",
          icon: CalendarClock,
          label: "Next event",
          value: nextEvent ? friendlyEventType(nextEvent.eventType) : "都已掌握",
        },
      ]}
      side={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            {today}
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">{getTodayStatusLabel(attentionCount, portfolio)}</p>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-white/72">
            <p>Morning Brief 已準備好，適合用 3 分鐘快速掌握市場重點。</p>
            <p>下一步：先看今天需要注意的三件事，再決定要進入 Portfolio、Risk 或 Timeline。</p>
          </div>
        </>
      }
      summary="今天的首頁只回答一件事：你今天需要知道什麼。資產、風險、市場與下一個事件會先整理成人能快速理解的順序。"
      title={`${displayName}，今天先看這裡。`}
    />
  );
}

function TodaysPriorities({
  alerts,
  fcnRisk,
  portfolio,
  timeline,
}: {
  alerts: WorkspaceAlertSummary;
  fcnRisk: FcnPortfolioRiskSummary | null;
  portfolio: PortfolioValuationResult | null;
  timeline: WorkspaceTimelineSummary | null;
}) {
  const priorities = buildTodayPriorities({ alerts, fcnRisk, portfolio, timeline });

  return (
    <WorkspaceProductSection
      description="最多三件事，讓你先知道今天最值得查看的是什麼，以及為什麼重要。"
      eyebrow="Today's Priorities"
      title="今天需要注意"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {priorities.map((priority) => {
          const Icon = priority.icon;

          return (
            <Link
              className="group rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/86"
              href={priority.href}
              key={priority.title}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
                  <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-base font-semibold leading-6">{priority.title}</p>
              <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-white/56 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {priority.label}：{priority.body}
              </p>
            </Link>
          );
        })}
      </div>
    </WorkspaceProductSection>
  );
}

function TodaysPortfolio({ portfolio }: { portfolio: PortfolioValuationResult | null }) {
  const summary = portfolio?.summary;
  const largestPosition = getLargestPosition(portfolio);
  const largestGain = getLargestGain(portfolio);
  const largestLoss = getLargestLoss(portfolio);

  return (
    <WorkspaceProductSection
      action={
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
          href="/my-ixai/portfolio"
        >
          打開 Portfolio
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      }
      description="只保留今日總覽，不放表格；完整資產、分類與明細留在 Portfolio。"
      eyebrow="Today's Portfolio"
      title="我的資產今天如何"
    >
      <WorkspaceKpiGrid
        items={[
          {
            description: summary?.positionCount ? "以目前可用資料估算。" : "新增資產後會顯示總資產。",
            icon: WalletCards,
            label: "Estimated value",
            value: formatCurrency(summary?.totalMarketValue, portfolio?.currency),
          },
          {
            description: "今日可估未實現損益。",
            icon: LineChart,
            label: "Today's P/L",
            value: getPortfolioMovement(portfolio),
          },
          {
            description: "目前占比最高的資產類別。",
            icon: PieChart,
            label: "Allocation",
            value: getAllocationLabel(portfolio),
          },
          {
            description: summary?.positionCount ? `${summary.positionCount} 筆資產。` : "尚未建立資產。",
            icon: BarChart3,
            label: "Holdings",
            value: typeof summary?.positionCount === "number" ? String(summary.positionCount) : "0",
          },
        ]}
      />
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/64 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">Largest position</p>
          <p className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
            {describePosition(largestPosition, portfolio?.currency, "value")}
          </p>
        </article>
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/64 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">Largest gain</p>
          <p className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
            {describePosition(largestGain, portfolio?.currency, "gain")}
          </p>
        </article>
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/64 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">Largest loss</p>
          <p className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
            {describePosition(largestLoss, portfolio?.currency, "loss")}
          </p>
        </article>
      </div>
    </WorkspaceProductSection>
  );
}

function TodaysMarket({
  portfolio,
  updatedAt,
}: {
  portfolio: PortfolioValuationResult | null;
  updatedAt?: string | null;
}) {
  const updatedLabel = formatTime(updatedAt);
  const hasPositions = Boolean(portfolio?.summary.positionCount);

  return (
    <WorkspaceProductSection
      action={
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
          href="/my-ixai/watchlist"
        >
          打開 Markets
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      }
      description="只整理今天可能影響你的市場面向；資料細節留在底部進階區。"
      eyebrow="Today's Market"
      title="今天市場發生什麼"
    >
      <WorkspaceKpiGrid
        items={[
          {
            description: hasPositions ? "依目前資產狀態整理市場影響。" : "新增資產後會顯示更個人化的市場影響。",
            icon: LineChart,
            label: "Market impact",
            value: updatedLabel === "待更新" ? "待整理" : "已整理",
          },
          {
            description: "加入 watchlist 後會顯示今日最值得注意的標的。",
            icon: Eye,
            label: "Watchlist",
            value: "觀察中",
          },
          {
            description: "Morning Brief 會整理今日市場新聞與主題。",
            icon: Newspaper,
            label: "News",
            value: "可閱讀",
          },
          {
            description: "重要日程會放在下一段 What's Next。",
            icon: CalendarClock,
            label: "Calendar",
            value: updatedLabel,
          },
        ]}
      />
    </WorkspaceProductSection>
  );
}

function WhatsNext({ events }: { events: WorkspaceTimelineEvent[] }) {
  return (
    <WorkspaceProductSection
      action={
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
          href="/my-ixai/timeline"
        >
          打開 Timeline
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      }
      description="最多五個 upcoming items，只放投資相關事件，不把資料錯誤當成事件。"
      eyebrow="What's Next"
      title="接下來要看什麼"
    >
      <div className="grid gap-2">
        {events.length > 0 ? (
          events.map((event) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-3" key={event.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--ixai-forest)]">{event.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--ixai-forest-soft)]">{event.description}</p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--ixai-border)] bg-white/72 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                  <CalendarClock className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
                  {friendlyEventType(event.eventType)} · {event.daysUntil}d
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            <p className="font-semibold text-[var(--ixai-forest)]">目前沒有即將到來的重要事件。</p>
            <p className="mt-1">你已掌握今天需要看的重點。新增 FCN、Watchlist 或提醒後，這裡會顯示下一個重要日程。</p>
          </div>
        )}
      </div>
    </WorkspaceProductSection>
  );
}

function WorkspaceIntelligenceDiagnostics({
  intelligence,
}: {
  intelligence: WorkspaceIntelligenceResult;
}) {
  const diagnostics = intelligence.diagnostics;

  return (
    <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
      <p className="text-sm font-semibold text-[var(--ixai-forest)]">Workspace Intelligence Diagnostics</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <p>Assets: {diagnostics.assetDiagnostics.assetCount} total · {diagnostics.assetDiagnostics.warningAssets} warning · {diagnostics.assetDiagnostics.offlineAssets} offline</p>
        <p>Monitoring: {diagnostics.monitoringDiagnostics.eventCount} events · {diagnostics.monitoringDiagnostics.criticalCount} critical · {diagnostics.monitoringDiagnostics.warningCount} warning</p>
        <p>Editorial: coverage {Math.round(diagnostics.editorialDiagnostics.coverageScore * 100)}% · quality {Math.round(diagnostics.editorialDiagnostics.qualityScore * 100)}%</p>
        <p>Notifications: {diagnostics.notificationDiagnostics.notificationCount} preview · {diagnostics.notificationDiagnostics.suppressedCount} suppressed</p>
        <p>Readiness: {readinessLabel(diagnostics.workspaceReadiness.level)}</p>
        <p>Provider: {diagnostics.providerDiagnostics.sourceStatus} · {diagnostics.providerDiagnostics.readiness}</p>
        <p>Overall health: {healthLabel(intelligence.summary.overallHealth)}</p>
      </div>
      {[...diagnostics.workspaceReadiness.blockingIssues, ...diagnostics.workspaceReadiness.warningIssues].length > 0 ? (
        <ul className="mt-3 grid gap-1 border-t border-[var(--ixai-border)] pt-3">
          {[...diagnostics.workspaceReadiness.blockingIssues, ...diagnostics.workspaceReadiness.warningIssues].slice(0, 4).map((issue) => (
            <li key={issue}>· {issue}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function DiagnosticsPanel({ intelligence }: { intelligence: WorkspaceIntelligenceResult }) {
  return (
    <WorkspaceDiagnosticsPanel title="Advanced / 進階診斷" description="資料來源、更新狀態與系統細節">
      <WorkspaceIntelligenceDiagnostics intelligence={intelligence} />
      <LiveMarketDataStatus autoLoad={false} compact />
      <WorkspaceHealthSummary />
      <I18nFoundationStatusCard />
      <LocalizationPreview />
    </WorkspaceDiagnosticsPanel>
  );
}

export function WorkspaceHomeDashboard() {
  const [today] = useState(() => formatDate(new Date()));
  const [workspaceGeneratedAt] = useState(() => new Date().toISOString());
  const [homeData, setHomeData] = useState<HomeData>(defaultHomeData);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function loadHomeData() {
      setIsLoading(true);
      const [portfolioResult, alertsResult, fcnRiskResult, timelineResult] = await Promise.all([
        runWorkspaceSafe("home-portfolio-snapshot", getWorkspacePortfolioValuation, null),
        runWorkspaceSafe("home-alerts", getWorkspaceAlertSummary, buildEmptyWorkspaceAlertSummary()),
        runWorkspaceSafe("home-fcn-risk", getWorkspaceFcnRiskSummary, null),
        runWorkspaceSafe("home-recent-activity", getWorkspaceTimelineSummary, null),
      ]);

      if (!mountedRef.current) return;
      setHomeData({
        alerts: alertsResult.data ?? buildEmptyWorkspaceAlertSummary(),
        fcnRisk: fcnRiskResult.data,
        portfolio: portfolioResult.data,
        timeline: timelineResult.data,
      });
      setIsLoading(false);
    }

    queueMicrotask(() => {
      void loadHomeData();
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const upcomingEvents = useMemo(() => getUpcomingEvents(homeData.timeline), [homeData.timeline]);
  const workspaceIntelligence = useMemo(
    () =>
      getWorkspaceIntelligence({
        generatedAt: homeData.portfolio?.summary.updatedAt ?? homeData.timeline?.generatedAt ?? workspaceGeneratedAt,
        portfolioPositions: homeData.portfolio?.positions ?? [],
      }),
    [homeData.portfolio, homeData.timeline, workspaceGeneratedAt],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <TodayStatus
        alerts={homeData.alerts}
        fcnRisk={homeData.fcnRisk}
        portfolio={homeData.portfolio}
        timeline={homeData.timeline}
        today={today}
      />

      {isLoading ? (
        <WorkspaceLoadingCard
          body="首頁會先顯示可用的今日概況，缺少的部分會用清楚文字說明。"
          title="正在整理今天的狀態"
        />
      ) : null}

      <TodaysPriorities
        alerts={homeData.alerts}
        fcnRisk={homeData.fcnRisk}
        portfolio={homeData.portfolio}
        timeline={homeData.timeline}
      />
      <TodaysPortfolio portfolio={homeData.portfolio} />
      <TodaysMarket
        portfolio={homeData.portfolio}
        updatedAt={homeData.portfolio?.summary.updatedAt ?? homeData.timeline?.generatedAt}
      />
      <WhatsNext events={upcomingEvents} />

      <DiagnosticsPanel intelligence={workspaceIntelligence} />
    </div>
  );
}

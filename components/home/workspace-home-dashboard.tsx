"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CircleAlert,
  Eye,
  LineChart,
  MessageSquareText,
  Newspaper,
  PieChart,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import { buildEmptyWorkspaceAlertSummary, getWorkspaceAlertSummary } from "@/src/lib/alerts";
import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import { getWorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import type { WorkspaceTimelineEvent, WorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

type HomeData = {
  alerts: WorkspaceAlertSummary;
  fcnRisk: FcnPortfolioRiskSummary | null;
  portfolio: PortfolioValuationResult | null;
  timeline: WorkspaceTimelineSummary | null;
};

const defaultHomeData: HomeData = {
  alerts: buildEmptyWorkspaceAlertSummary(),
  fcnRisk: null,
  portfolio: null,
  timeline: null,
};

const quickActions = [
  {
    description: "查看資產總覽與配置",
    href: "/my-ixai/portfolio",
    icon: BriefcaseBusiness,
    label: "我的資產",
  },
  {
    description: "新增股票、Crypto 或 FCN",
    href: "/my-ixai/input",
    icon: Plus,
    label: "新增資產",
  },
  {
    description: "查看 KI、觀察日與配息",
    href: "/my-ixai/fcn",
    icon: ShieldCheck,
    label: "FCN 風險",
  },
  {
    description: "用 explain-only 問題整理今日重點",
    href: "/my-ixai/copilot",
    icon: MessageSquareText,
    label: "問 Copilot",
  },
];

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

function statusLabel(status: string | null | undefined) {
  switch (status) {
    case "critical":
    case "high":
      return "需要留意";
    case "medium":
    case "warning":
    case "partial":
    case "stale":
      return "注意";
    case "low":
    case "live":
    case "ready":
    case "synced":
      return "穩定";
    case "fallback":
      return "使用備用資料";
    case "unavailable":
      return "暫無資料";
    default:
      return "觀察中";
  }
}

function severityTone(severity: string | null | undefined) {
  if (severity === "critical" || severity === "high") {
    return "border-[rgba(153,27,27,0.26)] bg-[rgba(153,27,27,0.07)] text-red-900";
  }

  if (severity === "warning" || severity === "medium" || severity === "partial") {
    return "border-[rgba(176,141,87,0.32)] bg-[rgba(176,141,87,0.10)] text-[var(--ixai-forest)]";
  }

  return "border-[var(--ixai-border)] bg-white/62 text-[var(--ixai-forest-soft)]";
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
      return "活動";
  }
}

function sortTimelineEvents(timeline: WorkspaceTimelineSummary | null) {
  if (!timeline) {
    return [];
  }

  return timeline.groups
    .flatMap((group) => group.events)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
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

function getRiskState(alerts: WorkspaceAlertSummary, fcnRisk: FcnPortfolioRiskSummary | null) {
  const attentionCount = getAttentionCount(alerts, fcnRisk);

  if (!alerts.alertCount && !fcnRisk) {
    return {
      description: "資料整理中，先保留安全 placeholder。",
      label: "今天有哪些風險？",
      value: "待確認",
    };
  }

  if (attentionCount > 0) {
    return {
      description: `${attentionCount} 個提醒值得今天查看。`,
      label: "今天有哪些風險？",
      value: "需要留意",
    };
  }

  return {
    description: "目前沒有需要立即處理的風險提醒。",
    label: "今天有哪些風險？",
    value: "穩定",
  };
}

function HomeHeroSummary({
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
  const riskState = getRiskState(alerts, fcnRisk);
  const portfolioValue = formatCurrency(portfolio?.summary.totalMarketValue, portfolio?.currency);
  const marketUpdatedAt = formatTime(portfolio?.summary.updatedAt ?? timeline?.generatedAt);

  return (
    <WorkspaceProductHero
      actions={[
        { href: "/my-ixai/portfolio", icon: BriefcaseBusiness, label: "查看我的資產" },
        { href: "/my-ixai/copilot", icon: Sparkles, label: "詢問 Copilot", variant: "secondary" },
      ]}
      eyebrow="AI Wealth Workspace"
      kpis={[
        {
          description: portfolio?.summary.positionCount ? `${portfolio.summary.positionCount} 筆持倉納入首頁摘要。` : "新增資產後會顯示總資產與配置。",
          icon: WalletCards,
          label: "今天我的資產如何？",
          value: portfolioValue,
        },
        {
          description: riskState.description,
          icon: ShieldAlert,
          label: riskState.label,
          value: riskState.value,
        },
        {
          description: attentionCount > 0 ? "已整理成需要優先查看與一般留意。" : "目前沒有需要立即處理的提醒。",
          icon: Bell,
          label: "今天需要注意",
          value: `${attentionCount} 項`,
        },
        {
          description: "主卡只顯示市場狀態；資料來源細節放進進階診斷。",
          icon: LineChart,
          label: "今天市場如何？",
          value: marketUpdatedAt === "待更新" ? "待更新" : "已更新",
        },
      ]}
      side={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            今日工作重點
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">{today}</p>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-white/72">
            <p>資產：{portfolio?.summary.positionCount ? "已整理可用資產概況。" : "尚未有完整資產資料。"}</p>
            <p>風險：{riskState.value}。</p>
            <p>市場：{marketUpdatedAt === "待更新" ? "等待下一次更新。" : `最近更新 ${marketUpdatedAt}。`}</p>
            <p>下一步：先處理需要留意的提醒，再進入完整報告。</p>
          </div>
        </>
      }
      summary="首頁先整理今天的工作順序：資產狀態、風險提醒、市場更新與下一步入口。完整每日報告留在 Morning Brief。"
      title={`${displayName}，今天先掌握工作重點。`}
    />
  );
}

function MorningBriefSummaryCard({
  alerts,
  fcnRisk,
  portfolio,
  updatedAt,
}: {
  alerts: WorkspaceAlertSummary;
  fcnRisk: FcnPortfolioRiskSummary | null;
  portfolio: PortfolioValuationResult | null;
  updatedAt?: string | null;
}) {
  const attentionCount = getAttentionCount(alerts, fcnRisk);
  const riskState = getRiskState(alerts, fcnRisk);
  const updatedLabel = formatTime(updatedAt);

  return (
    <WorkspaceProductSection
      action={
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] sm:w-fit"
          href="/my-ixai/morning-brief"
        >
          閱讀完整 Morning Brief
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      }
      description="首頁只保留今日摘要，完整章節、分享與匯出留在 Morning Brief 頁。"
      eyebrow="Morning Brief Summary"
      title="今日摘要"
    >
      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-lg border border-[rgba(176,141,87,0.30)] bg-white/72 p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
              <Newspaper className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-semibold text-[var(--ixai-forest)]">
                今天先看 {attentionCount > 0 ? "需要留意的風險與市場更新" : "資產狀態與市場更新"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {portfolio?.summary.positionCount
                  ? `目前有 ${portfolio.summary.positionCount} 筆持倉納入首頁摘要。`
                  : "新增資產後，Morning Brief 會更完整地整理 Portfolio 與風險脈絡。"}
                {" "}
                風險狀態為「{riskState.value}」，市場資料{updatedLabel === "待更新" ? "等待更新" : `最近於 ${updatedLabel} 更新`}。
              </p>
            </div>
          </div>
        </article>

        <WorkspaceKpiGrid
          items={[
            {
              description: "完整報告會整理 Portfolio、Risk、FCN、Watchlist 與時間線。",
              icon: Newspaper,
              label: "完整報告",
              value: "獨立頁面",
            },
            {
              description: attentionCount > 0 ? "建議先查看今天需要留意的提醒。" : "目前沒有立即處理項目。",
              icon: Bell,
              label: "今日提醒",
              value: `${attentionCount} 項`,
            },
          ]}
        />
      </div>
    </WorkspaceProductSection>
  );
}

function PortfolioSnapshot({ portfolio }: { portfolio: PortfolioValuationResult | null }) {
  const summary = portfolio?.summary;
  const topAllocation = summary?.assetAllocation
    .filter((item) => item.marketValue > 0)
    .sort((a, b) => b.marketValue - a.marketValue)[0];

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
      description="先看總資產、配置、今日表現與持倉數；資料不足時會保留可理解的 placeholder。"
      eyebrow="Portfolio Snapshot"
      title="我的資產概況"
    >
      <WorkspaceKpiGrid
        items={[
          {
            description: summary?.positionCount ? "已依目前可用資料估算。" : "新增資產後會顯示總資產。",
            icon: WalletCards,
            label: "Total Assets",
            value: formatCurrency(summary?.totalMarketValue, portfolio?.currency),
          },
          {
            description: topAllocation ? "目前占比最高的資產類別。" : "尚未有可用配置資料。",
            icon: PieChart,
            label: "Allocation",
            value: topAllocation ? `${topAllocation.assetClass.toUpperCase()} ${topAllocation.allocationPercent.toFixed(0)}%` : "暫無資料",
          },
          {
            description: "若今日行情不足，先顯示目前可估損益。",
            icon: LineChart,
            label: "Today's Performance",
            value: formatPercent(summary?.totalUnrealizedPnlPercent),
          },
          {
            description: summary?.unpricedPositionCount ? `${summary.unpricedPositionCount} 筆仍需補資料。` : "持倉資料可用時會在這裡整理。",
            icon: BarChart3,
            label: "Holdings Count",
            value: typeof summary?.positionCount === "number" ? String(summary.positionCount) : "0",
          },
        ]}
      />
    </WorkspaceProductSection>
  );
}

function TodaysAlerts({ alerts, fcnRisk }: { alerts: WorkspaceAlertSummary; fcnRisk: FcnPortfolioRiskSummary | null }) {
  const urgent = alerts.criticalCount + (fcnRisk?.criticalRiskCount ?? 0);
  const attention = alerts.warningCount + alerts.highCount + (fcnRisk?.highRiskCount ?? 0);
  const note = Math.max(alerts.alertCount - alerts.criticalCount - alerts.warningCount - alerts.highCount, 0);
  const visibleAlerts = alerts.alerts.slice(0, 3);

  return (
    <WorkspaceProductSection
      action={
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
          href="/my-ixai/notifications"
        >
          查看通知
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      }
      description="首頁只整理需要優先查看、今天留意與一般提醒，不直接傾倒全部 alerts。"
      eyebrow="今日提醒"
      title="今天需要留意"
    >
      <WorkspaceKpiGrid
        items={[
          {
            description: "需要優先查看的高風險提醒。",
            icon: CircleAlert,
            label: "需要優先查看",
            tone: urgent > 0 ? "critical" : "default",
            value: String(urgent),
          },
          {
            description: "值得今天留意的風險或資料變化。",
            icon: ShieldAlert,
            label: "今天留意",
            tone: attention > 0 ? "warning" : "default",
            value: String(attention),
          },
          {
            description: "一般資訊或後續可查看的狀態。",
            icon: Bell,
            label: "一般提醒",
            value: String(note),
          },
        ]}
      />

      <div className="mt-4 grid gap-2">
        {visibleAlerts.length > 0 ? (
          visibleAlerts.map((alert) => (
            <article className={`rounded-lg border p-3 ${severityTone(alert.severity)}`} key={alert.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold">{alert.title}</p>
                <span className="inline-flex w-fit rounded-full border border-current/20 bg-white/42 px-2.5 py-1 text-xs font-semibold">
                  {statusLabel(alert.severity)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 opacity-80">{alert.message}</p>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            目前沒有需要立即處理的提醒。你仍可查看 Timeline 了解接下來的觀察日、配息或資產事件。
          </p>
        )}
      </div>
    </WorkspaceProductSection>
  );
}

function MarketSnapshot({ updatedAt }: { updatedAt?: string | null }) {
  const updatedLabel = formatTime(updatedAt);

  return (
    <WorkspaceProductSection
      action={
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
          href="/my-ixai/watchlist"
        >
          查看 Watchlist
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      }
      description="首頁只顯示市場狀態與更新時間；資料來源、cache 與 runtime 細節放在進階診斷。"
      eyebrow="Market Snapshot"
      title="市場狀態"
    >
      <WorkspaceKpiGrid
        items={[
          {
            description: "目前以可用資料整理首頁市場狀態。",
            icon: LineChart,
            label: "市場狀態",
            value: updatedLabel === "待更新" ? "待更新" : "已更新",
          },
          {
            description: "最近一次可用資料時間。",
            icon: CalendarClock,
            label: "更新時間",
            value: updatedLabel,
          },
          {
            description: "加入 watchlist 後會整理今日值得注意的標的。",
            icon: Eye,
            label: "Watchlist",
            value: "觀察中",
          },
        ]}
      />
      <p className="mt-4 text-xs leading-5 text-[var(--ixai-forest-soft)]">
        資料來源、更新狀態、備用資料與 runtime 細節已收納在底部 Advanced / 進階診斷。
      </p>
    </WorkspaceProductSection>
  );
}

function QuickActions() {
  return (
    <WorkspaceProductSection
      description="常用入口整理成 icon + 大按鈕，避免在首頁散落成工程模組。"
      eyebrow="Quick Actions"
      title="下一步可以做什麼"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              className="group flex min-h-32 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/86"
              href={action.href}
              key={action.href}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
                  <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold">{action.label}</span>
                <span className="mt-2 block text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {action.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </WorkspaceProductSection>
  );
}

function RecentActivity({ events }: { events: WorkspaceTimelineEvent[] }) {
  return (
    <WorkspaceProductSection
      action={
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
          href="/my-ixai/timeline"
        >
          查看 Timeline
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      }
      description="Timeline 只在首頁顯示最近重點，完整事件留在 Timeline 頁。"
      eyebrow="Recent Activity"
      title="最近 5 筆活動"
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
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            目前沒有近期活動。新增資產、FCN 或 watchlist 後，這裡會整理最近需要留意的事件。
          </p>
        )}
      </div>
    </WorkspaceProductSection>
  );
}

function DiagnosticsPanel() {
  return (
    <WorkspaceDiagnosticsPanel>
      <LiveMarketDataStatus autoLoad={false} compact />
      <WorkspaceHealthSummary />
      <I18nFoundationStatusCard />
      <LocalizationPreview />
    </WorkspaceDiagnosticsPanel>
  );
}

export function WorkspaceHomeDashboard() {
  const [today] = useState(() => formatDate(new Date()));
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

  const recentEvents = useMemo(() => sortTimelineEvents(homeData.timeline), [homeData.timeline]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <HomeHeroSummary
        alerts={homeData.alerts}
        fcnRisk={homeData.fcnRisk}
        portfolio={homeData.portfolio}
        timeline={homeData.timeline}
        today={today}
      />

      <MorningBriefSummaryCard
        alerts={homeData.alerts}
        fcnRisk={homeData.fcnRisk}
        portfolio={homeData.portfolio}
        updatedAt={homeData.portfolio?.summary.updatedAt ?? homeData.timeline?.generatedAt}
      />

      <PortfolioSnapshot portfolio={homeData.portfolio} />
      <TodaysAlerts alerts={homeData.alerts} fcnRisk={homeData.fcnRisk} />
      <MarketSnapshot updatedAt={homeData.portfolio?.summary.updatedAt ?? homeData.timeline?.generatedAt} />
      <QuickActions />
      <RecentActivity events={recentEvents} />

      {isLoading ? (
        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
          正在整理首頁資料。主要內容會以可用資料優先顯示，缺少的資料會保留安全 placeholder。
        </p>
      ) : null}

      <DiagnosticsPanel />
    </div>
  );
}

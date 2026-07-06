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
  WorkspaceLoadingCard,
  WorkspaceProductHero,
  WorkspaceProductSection,
  WorkspaceStatusBadge,
} from "@/components/workspace/product";
import { buildEmptyWorkspaceAlertSummary, getWorkspaceAlertSummary } from "@/src/lib/alerts";
import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import { useTranslation } from "@/src/lib/i18n";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import { getWorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import type { WorkspaceTimelineEvent, WorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import { getWorkspaceIntelligence } from "@/src/lib/intelligence/workspace";
import type { WorkspaceIntelligenceResult } from "@/src/lib/intelligence/workspace";
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
  const { t } = useTranslation("productPolish");
  const attentionCount = getAttentionCount(alerts, fcnRisk);
  const riskState = getRiskState(alerts, fcnRisk);
  const updatedLabel = formatTime(updatedAt);
  const marketState = updatedLabel === "待更新" ? "等待更新" : `最近於 ${updatedLabel} 更新`;
  const portfolioCopy = portfolio?.summary.positionCount
    ? t("homeSummaryPortfolioReady").replace("{count}", String(portfolio.summary.positionCount))
    : t("homeSummaryPortfolioEmpty");

  return (
    <WorkspaceProductSection
      action={
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] sm:w-fit"
          href="/my-ixai/morning-brief"
        >
          {t("morningBriefReadFull")}
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      }
      description={t("morningBriefSummaryBody")}
      eyebrow="Morning Brief Summary"
      title={t("morningBriefSummaryTitle")}
    >
      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-lg border border-[rgba(176,141,87,0.30)] bg-white/72 p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
              <Newspaper className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-semibold text-[var(--ixai-forest)]">
                {attentionCount > 0 ? t("homeSummaryAttentionTitle") : t("homeSummaryNormalTitle")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {portfolioCopy}
                {" "}
                {t("homeSummaryRiskMarket")
                  .replace("{risk}", riskState.value)
                  .replace("{market}", marketState)}
              </p>
            </div>
          </div>
        </article>

        <WorkspaceKpiGrid
          items={[
            {
              description: "完整報告會整理 Portfolio、Risk、FCN、Watchlist 與時間線。",
              icon: Newspaper,
              label: t("readFullReport"),
              value: t("morningBriefManualMode"),
            },
            {
              description: attentionCount > 0 ? t("homeSummaryReviewAttention") : t("noImmediateAction"),
              icon: Bell,
              label: t("today"),
              value: `${attentionCount} 項`,
            },
          ]}
        />
      </div>
    </WorkspaceProductSection>
  );
}

function WorkspaceIntelligenceSummarySection({
  intelligence,
}: {
  intelligence: WorkspaceIntelligenceResult;
}) {
  const summary = intelligence.summary;

  return (
    <WorkspaceProductSection
      description="V18 先把底層 Intelligence Layer 接成 read-only 摘要，讓首頁知道 Workspace 目前掌握了什麼。"
      eyebrow="Workspace Intelligence"
      title="AI 已整理好的 Workspace 狀態"
    >
      <WorkspaceKpiGrid
        items={[
          {
            description: "綜合資產、監控、通知與資料來源狀態。",
            icon: ShieldCheck,
            label: "Overall Health",
            tone: summary.overallHealth === "healthy" ? "success" : summary.overallHealth === "offline" ? "critical" : "warning",
            value: healthLabel(summary.overallHealth),
          },
          {
            description: summary.overallReadiness.nextActions[0] ?? "維持 read-only preview。",
            icon: Sparkles,
            label: "Readiness",
            tone: summary.overallReadiness.level === "green" ? "success" : summary.overallReadiness.level === "red" ? "critical" : "warning",
            value: readinessLabel(summary.overallReadiness.level),
          },
          {
            description: "Asset Intelligence 目前可整理的資產數。",
            icon: WalletCards,
            label: "Assets",
            value: String(summary.assetSummary.assetCount),
          },
          {
            description: "Monitoring Engine 產生的 read-only 事件數。",
            icon: Bell,
            label: "Monitoring Events",
            value: String(summary.monitoringSummary.events),
          },
        ]}
      />
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
          <WorkspaceStatusBadge variant="beta">Beta Preview</WorkspaceStatusBadge>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">Notification Preview</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
            {summary.notificationSummary.pending}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            pending preview items. No notification is sent from Home.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
          <WorkspaceStatusBadge variant={summary.providerSummary.readiness === "ready" ? "green" : "yellow"}>
            {summary.providerSummary.readiness === "ready" ? "Green" : "Yellow"}
          </WorkspaceStatusBadge>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">Editorial / Provider</p>
          <p className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
            {summary.providerSummary.sourceStatus}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            Provider readiness: {summary.providerSummary.readiness}. Editorial quality: {Math.round(summary.editorialSummary.qualityScore * 100)}%.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
          <WorkspaceStatusBadge variant="healthy">Healthy</WorkspaceStatusBadge>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">Last Updated</p>
          <p className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
            {formatTime(summary.lastUpdated)}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            Coverage {Math.round(summary.coverage * 100)}% · Quality {Math.round(summary.quality * 100)}%
          </p>
        </article>
      </div>
    </WorkspaceProductSection>
  );
}

function WorkspaceTodayFocusSection({
  intelligence,
}: {
  intelligence: WorkspaceIntelligenceResult;
}) {
  const focus = intelligence.todayFocus.slice(0, 3);

  return (
    <WorkspaceProductSection
      description="Today Focus 直接重用 Monitoring Engine，Home 只負責整理成使用者可讀的三件事。"
      eyebrow="Today Focus"
      title="今天 AI 建議先看這些"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {focus.length > 0 ? (
          focus.map((item) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={item.title}>
              <p className="text-sm font-semibold leading-6 text-[var(--ixai-forest)]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.summary}</p>
              <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-white/60 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                為什麼重要：{item.whyItMatters}
              </p>
              <p className="mt-3 text-xs font-semibold text-[var(--ixai-forest)]">
                下一步：{item.nextMonitorAction}
              </p>
              <p className="mt-2 text-xs text-[var(--ixai-forest-soft)]">
                Affected assets: {item.affectedAssets.length}
              </p>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)] lg:col-span-3">
            目前沒有需要排進 Today Focus 的事件。新增資產或資料更新後，Monitoring Engine 會提供 read-only 重點。
          </p>
        )}
      </div>
    </WorkspaceProductSection>
  );
}

function WorkspaceRiskHighlightsSection({
  intelligence,
}: {
  intelligence: WorkspaceIntelligenceResult;
}) {
  const risk = intelligence.riskSummary;

  return (
    <WorkspaceProductSection
      description="Risk Highlights 只整理需要留意的監控事件，不提供買賣或持有建議。"
      eyebrow="Risk Highlights"
      title="Workspace 風險重點"
    >
      <WorkspaceKpiGrid
        items={[
          { description: "需要優先處理的監控事件。", icon: CircleAlert, label: "Critical", tone: risk.critical > 0 ? "critical" : "default", value: String(risk.critical) },
          { description: "今天值得留意的監控事件。", icon: ShieldAlert, label: "Warning", tone: risk.warning > 0 ? "warning" : "default", value: String(risk.warning) },
          { description: "目前資料狀態健康的資產數。", icon: ShieldCheck, label: "Healthy", tone: "success", value: String(risk.healthy) },
          { description: "受影響的資產 / FCN 關聯。", icon: BarChart3, label: "Affected", value: `${risk.affectedAssets.length}/${risk.affectedFcns.length}` },
        ]}
      />
      <div className="mt-4 grid gap-2">
        {risk.topRisks.length > 0 ? (
          risk.topRisks.slice(0, 3).map((event) => (
            <article className={`rounded-lg border p-3 ${severityTone(event.severity)}`} key={event.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold">{event.title}</p>
                <span className="inline-flex w-fit rounded-full border border-current/20 bg-white/42 px-2.5 py-1 text-xs font-semibold">
                  {event.priorityScore}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 opacity-80">{event.whyItMatters}</p>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            目前沒有 critical / warning 監控事件。
          </p>
        )}
      </div>
    </WorkspaceProductSection>
  );
}

function WorkspaceNotificationPreviewSection({
  intelligence,
}: {
  intelligence: WorkspaceIntelligenceResult;
}) {
  const preview = intelligence.notificationPreview;

  return (
    <WorkspaceProductSection
      description="Notification Platform 目前只做 preview 與 routing diagnostics，首頁不會發送 Telegram、LINE、Email 或 Push。"
      eyebrow="Notification Preview"
      title="通知預覽"
    >
      <WorkspaceKpiGrid
        items={[
          { description: "最高優先級 preview。", icon: Bell, label: "Urgent", tone: preview.urgent > 0 ? "critical" : "default", value: String(preview.urgent) },
          { description: "高優先級 preview。", icon: ShieldAlert, label: "High", tone: preview.high > 0 ? "warning" : "default", value: String(preview.high) },
          { description: "一般提醒 preview。", icon: MessageSquareText, label: "Normal", value: String(preview.normal) },
          { description: "被 cooldown 或去重壓制。", icon: Eye, label: "Suppressed / Pending", value: `${preview.suppressed}/${preview.pending}` },
        ]}
      />
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
    <WorkspaceDiagnosticsPanel>
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

  const recentEvents = useMemo(() => sortTimelineEvents(homeData.timeline), [homeData.timeline]);
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

      <WorkspaceIntelligenceSummarySection intelligence={workspaceIntelligence} />
      <WorkspaceTodayFocusSection intelligence={workspaceIntelligence} />
      <WorkspaceRiskHighlightsSection intelligence={workspaceIntelligence} />
      <WorkspaceNotificationPreviewSection intelligence={workspaceIntelligence} />
      <PortfolioSnapshot portfolio={homeData.portfolio} />
      <TodaysAlerts alerts={homeData.alerts} fcnRisk={homeData.fcnRisk} />
      <MarketSnapshot updatedAt={homeData.portfolio?.summary.updatedAt ?? homeData.timeline?.generatedAt} />
      <QuickActions />
      <RecentActivity events={recentEvents} />

      {isLoading ? (
        <WorkspaceLoadingCard
          body="主要內容會以可用資料優先顯示，缺少的資料會保留安全 placeholder。"
          title="正在整理首頁資料"
        />
      ) : null}

      <DiagnosticsPanel intelligence={workspaceIntelligence} />
    </div>
  );
}

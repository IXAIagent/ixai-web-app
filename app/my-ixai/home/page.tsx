import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bitcoin,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  CandlestickChart,
  Database,
  Eye,
  GitBranch,
  HeartPulse,
  Home,
  Lightbulb,
  Newspaper,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { AlertSummary } from "@/components/alerts/alert-summary";
import { WorkspaceCopilotSummary } from "@/components/copilot/workspace-copilot-summary";
import { WorkspaceDailyBrief } from "@/components/daily-brief/workspace-daily-brief";
import { WorkspaceInsightsSummary } from "@/components/insights/workspace-insights-summary";
import { IntelligenceSummary } from "@/components/intelligence/intelligence-summary";
import { MorningBriefStatus } from "@/components/morning-brief/morning-brief-status";
import { NotificationCenterSummary } from "@/components/notifications/notification-center-summary";
import { LegacyRiskEngineStatus } from "@/components/risk/legacy-risk-engine-status";
import { WorkspaceHealthSummary } from "@/components/workspace/workspace-health-summary";
import { WorkspaceDatabaseReadPriorityStatus } from "@/components/workspace/workspace-database-read-priority-status";
import { WorkspacePlatformCutoverStatus } from "@/components/workspace/workspace-platform-cutover-status";
import { WorkspaceTimelineSummary } from "@/components/workspace/workspace-timeline-summary";
import { WorkspaceV11DatabaseActivationStatus } from "@/components/workspace/workspace-v11-database-activation-status";
import { WorkspaceV12DatabaseWriteActivationStatus } from "@/components/workspace/workspace-v12-database-write-activation-status";
import { WorkspaceV13PortfolioDatabaseWriteActivationStatus } from "@/components/workspace/workspace-v13-portfolio-database-write-activation-status";
import { WorkspaceV14FcnDatabaseActivationStatus } from "@/components/workspace/workspace-v14-fcn-database-activation-status";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/home",
  description:
    "IXAI Workspace Home 是登入後主入口，整理 Portfolio、Risk、FCN、Intelligence 與 Settings。",
  title: "Home | 我的 IXAI",
});

const workspaceCards = [
  {
    description: "查看 Portfolio Truth、pending inputs、資產配置、曝險與多資產基礎。",
    href: "/my-ixai/portfolio",
    icon: BriefcaseBusiness,
    label: "Portfolio Center",
  },
  {
    description: "查看 concentration、top exposure、FCN worst-of 與 data quality risk readback。",
    href: "/my-ixai/risk",
    icon: ShieldAlert,
    label: "Risk Center",
  },
  {
    description: "管理 FCN positions、pending inputs、underlyings、Worst-of、KI / KO 與 timeline。",
    href: "/my-ixai/fcn",
    icon: ShieldCheck,
    label: "FCN Center",
  },
  {
    description: "整理 Daily、Weekly、Market、Portfolio、Risk 與 FCN intelligence readback。",
    href: "/my-ixai/intelligence",
    icon: Newspaper,
    label: "Intelligence Center",
  },
  {
    description: "整理 local/fallback watchlist 與 Market Service quote status。",
    href: "/my-ixai/watchlist",
    icon: Eye,
    label: "Watchlist",
  },
  {
    description: "預覽帳號、通知、語言、地區、資料與未來 broker connection 設定。",
    href: "/my-ixai/settings",
    icon: Settings,
    label: "Settings",
  },
];

const dashboardV2Cards = [
  {
    description: "Persisted / local / fallback position readback source status.",
    href: "/my-ixai/portfolio",
    icon: Database,
    label: "Portfolio Persistence",
  },
  {
    description: "Estimated market value, cost basis, P/L, and allocation.",
    href: "/my-ixai/portfolio",
    icon: WalletCards,
    label: "Valuation",
  },
  {
    description: "Risk score, signals, concentration, and data quality.",
    href: "/my-ixai/risk",
    icon: ShieldAlert,
    label: "Risk",
  },
  {
    description: "Worst-of, KI distance, strike distance, and KO readiness.",
    href: "/my-ixai/fcn",
    icon: ShieldCheck,
    label: "FCN Risk",
  },
  {
    description: "Coupon, observation, KO observation, and maturity events.",
    href: "/my-ixai/fcn",
    icon: Newspaper,
    label: "FCN Schedule",
  },
  {
    description: "Local/fallback symbols and quote availability.",
    href: "/my-ixai/watchlist",
    icon: Eye,
    label: "Watchlist",
  },
  {
    description: "UI-only deterministic monitoring alert cards.",
    href: "/my-ixai/home#workspace-alerts",
    icon: Bell,
    label: "Alerts",
  },
  {
    description: "Rule-based daily workspace summary from existing engines.",
    href: "/my-ixai/home#workspace-daily-brief",
    icon: Newspaper,
    label: "Daily Brief",
  },
  {
    description: "Deterministic Intelligence Cards with source-engine attribution.",
    href: "/my-ixai/intelligence",
    icon: Newspaper,
    label: "Intelligence",
  },
  {
    description: "Unified readback across all Workspace modules.",
    href: "/my-ixai/home#workspace-graph",
    icon: GitBranch,
    label: "Workspace Graph",
  },
  {
    description: "Local notification cards converted from alerts.",
    href: "/my-ixai/notifications",
    icon: Bell,
    label: "Notifications",
  },
  {
    description: "0–100 deterministic infrastructure health score.",
    href: "/my-ixai/home#workspace-health",
    icon: HeartPulse,
    label: "Workspace Health",
  },
  {
    description: "FCN schedule and alert events grouped by timing.",
    href: "/my-ixai/timeline",
    icon: CalendarClock,
    label: "Timeline",
  },
  {
    description: "Rule-based attention layer built from Workspace Graph.",
    href: "/my-ixai/home#workspace-insights",
    icon: Lightbulb,
    label: "Insights",
  },
  {
    description: "Delivery readiness: in-app active, external channels planned.",
    href: "/my-ixai/notifications",
    icon: Send,
    label: "Delivery Readiness",
  },
  {
    description: "Explain-only templates for Portfolio, Risk, FCN, Schedule, and Alerts.",
    href: "/my-ixai/copilot",
    icon: Bot,
    label: "Copilot",
  },
];

const assetShortcutCards = [
  {
    description: "從 Asset Input 建立股票 / ETF 資料入口，未來串接 Portfolio 與 Risk readback。",
    href: "/my-ixai/input/stock",
    icon: CandlestickChart,
    label: "新增股票",
  },
  {
    description: "建立 Crypto 資產輸入入口，預留 spot、Grid、Dual 與 exchange sync。",
    href: "/my-ixai/input/crypto",
    icon: Bitcoin,
    label: "新增 Crypto",
  },
  {
    description: "使用 FCN Wizard 建立 FCN 部位，讓資料進入 Workspace 風險流程。",
    href: "/my-ixai/input/fcn",
    icon: ShieldCheck,
    label: "新增 FCN",
  },
];

export default function MyIxaiHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          IXAI Workspace
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-2xl font-semibold leading-8 sm:mt-3 sm:text-5xl sm:leading-snug">
          歡迎回到 IXAI Workspace。
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:leading-7">
          這裡是登入後主入口。Portfolio、Risk、FCN、Intelligence 與 Settings
          已整理成分工清楚的 Workspace 中心；新增資產後可回到各中心查看 readback 狀態。V5 加入 Watchlist、Alerts、Daily Brief 與 Dashboard v2 readback。
          V6 加入 API routes、persistence readiness、insights、delivery readiness 與 explain-only Copilot foundation。V13 開始 Portfolio / Stock / Crypto guarded database writes；V14 加入 FCN guarded database write activation，並保留 local fallback。
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/my-ixai/portfolio"
          >
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            進入 Portfolio Center
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.055] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            href="/"
          >
            返回官網
          </Link>
        </div>
      </section>

      <WorkspaceDatabaseReadPriorityStatus />

      <WorkspacePlatformCutoverStatus />

      <WorkspaceV11DatabaseActivationStatus />

      <WorkspaceV12DatabaseWriteActivationStatus />

      <WorkspaceV13PortfolioDatabaseWriteActivationStatus />

      <WorkspaceV14FcnDatabaseActivationStatus />

      <LegacyRiskEngineStatus compact />

      <MorningBriefStatus compact />

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Workspace Dashboard v2
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Workspace 模組入口
            </h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            Monitoring only
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardV2Cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                className="group flex min-h-32 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/80"
                href={card.href}
                key={card.label}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                    {card.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="mt-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {card.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Asset Onboarding
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              快速新增資產
            </h2>
          </div>
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
            href="/my-ixai/input"
          >
            Asset Input Center
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {assetShortcutCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                className="group flex min-h-36 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/80"
                href={card.href}
                key={card.href}
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                  {card.label}
                </span>
                <span className="mt-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {card.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Workspace Centers
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              從一個入口進入 Workspace 工作中心
            </h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            <Home className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
            Workspace centers
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {workspaceCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                className="group flex min-h-40 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/80"
                href={card.href}
                key={card.href}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                    {card.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="mt-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {card.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div id="workspace-alerts">
        <AlertSummary />
      </div>

      <div id="workspace-health">
        <WorkspaceHealthSummary />
      </div>

      <NotificationCenterSummary />

      <WorkspaceTimelineSummary />

      <div id="workspace-insights">
        <WorkspaceInsightsSummary />
      </div>

      <WorkspaceCopilotSummary />

      <div id="workspace-daily-brief">
        <WorkspaceDailyBrief />
      </div>

      <MorningBriefStatus />

      <IntelligenceSummary />

      <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        本頁僅整理 Workspace 入口與資訊架構，不新增投資功能、不構成投資建議、不提供買賣建議、目標價、報酬承諾或自動交易。
      </p>
    </div>
  );
}

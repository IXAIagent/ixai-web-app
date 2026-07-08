"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CircleAlert,
  Gauge,
  Layers3,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { LegacyRiskEngineStatus } from "@/components/risk/legacy-risk-engine-status";
import { LiveRiskAdapterCard } from "@/components/risk/live-risk-adapter-card";
import { RiskEngineSummary } from "@/components/risk/risk-engine-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceEmptyState,
  WorkspaceProductHero,
  WorkspaceProductSection,
  WorkspaceStateMessage,
} from "@/components/workspace/product";
import { buildEmptyWorkspaceAlertSummary, getWorkspaceAlertSummary } from "@/src/lib/alerts";
import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import { getWorkspacePortfolioRiskSummary } from "@/src/lib/risk/risk-service";
import type { PortfolioRiskResult, RiskSignal } from "@/src/lib/risk/risk-engine-types";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

type RiskExperienceData = {
  alerts: WorkspaceAlertSummary;
  risk: PortfolioRiskResult | null;
};

function riskLabel(level: string | undefined) {
  switch (level) {
    case "critical":
    case "high":
      return "危險";
    case "medium":
      return "注意";
    case "low":
      return "良好";
    default:
      return "暫無資料";
  }
}

function riskTone(level: string | undefined): "critical" | "default" | "success" | "warning" {
  if (level === "critical" || level === "high") return "critical";
  if (level === "medium") return "warning";
  if (level === "low") return "success";
  return "default";
}

function signalLabel(signal: RiskSignal | undefined) {
  if (!signal) return "No elevated risks today.";
  if (signal.category === "concentration") return "Concentration";
  if (signal.category === "crypto_exposure") return "Crypto Exposure";
  if (signal.category === "market_data") return "Market Risk";
  if (signal.category === "fcn_placeholder") return "FCN Risk";
  if (signal.category === "data_quality") return "Data Completeness";
  return signal.title;
}

function signalWhyItMatters(signal: RiskSignal | undefined) {
  if (!signal) {
    return "No elevated risks today. Keep monitoring Portfolio, Markets, and upcoming events.";
  }

  return signal.message;
}

function affectedText(signal: RiskSignal | undefined) {
  if (!signal) return "No affected assets.";
  if (signal.affectedSymbols.length > 0) return signal.affectedSymbols.slice(0, 3).join(", ");
  if (signal.affectedAssetClass) return signal.affectedAssetClass.toUpperCase();
  return "Portfolio";
}

function categorySignals(signals: RiskSignal[], category: RiskSignal["category"]) {
  return signals.filter((signal) => signal.category === category);
}

function categorySummary(signals: RiskSignal[], category: RiskSignal["category"]) {
  const matched = categorySignals(signals, category);
  const highest = matched.find((signal) => signal.severity === "critical" || signal.severity === "high") ?? matched[0];
  return {
    count: matched.length,
    highest,
  };
}

function recentRiskHistory(signals: RiskSignal[]) {
  return [...signals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
}

export function RiskExperienceWorkspace() {
  const [data, setData] = useState<RiskExperienceData>({
    alerts: buildEmptyWorkspaceAlertSummary(),
    risk: null,
  });
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function loadRiskExperience() {
      const [riskResult, alertsResult] = await Promise.all([
        runWorkspaceSafe("risk-experience-summary", getWorkspacePortfolioRiskSummary, null),
        runWorkspaceSafe("risk-experience-alerts", getWorkspaceAlertSummary, buildEmptyWorkspaceAlertSummary()),
      ]);

      if (!mountedRef.current) return;
      setData({
        alerts: alertsResult.data ?? buildEmptyWorkspaceAlertSummary(),
        risk: riskResult.data,
      });
    }

    queueMicrotask(() => {
      void loadRiskExperience();
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const summary = data.risk?.summary;
  const signals = useMemo(() => data.risk?.signals ?? [], [data.risk?.signals]);
  const firstSignal = summary?.topSignals[0];
  const alertCount = data.alerts.criticalCount + data.alerts.highCount + data.alerts.warningCount;
  const concentration = useMemo(() => categorySummary(signals, "concentration"), [signals]);
  const fcnRisk = useMemo(() => categorySummary(signals, "fcn_placeholder"), [signals]);
  const marketRisk = useMemo(() => categorySummary(signals, "market_data"), [signals]);
  const portfolioRisk = useMemo(() => categorySummary(signals, "asset_allocation"), [signals]);
  const dataQuality = useMemo(() => categorySummary(signals, "data_quality"), [signals]);
  const history = useMemo(() => recentRiskHistory(signals), [signals]);

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/portfolio", icon: WalletCards, label: "查看 Portfolio" },
            { href: "/my-ixai/timeline", icon: CalendarClock, label: "查看 Timeline", variant: "secondary" },
          ]}
          eyebrow="Risk Decision Center"
          kpis={[
            {
              description: "今天整體需要注意的程度。",
              icon: Gauge,
              label: "Overall Risk",
              tone: riskTone(summary?.riskLevel),
              value: riskLabel(summary?.riskLevel),
            },
            {
              description: "今天最值得先看的風險來源。",
              icon: Layers3,
              label: "Top Risk",
              value: signalLabel(firstSignal),
            },
            {
              description: "需要優先查看或今天留意的提醒。",
              icon: CircleAlert,
              label: "Needs Attention",
              tone: alertCount > 0 ? "warning" : "default",
              value: String(alertCount),
            },
            {
              description: "受影響的資產或資產類別。",
              icon: BarChart3,
              label: "Affected",
              value: affectedText(firstSignal),
            },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                What deserves my attention?
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{riskLabel(summary?.riskLevel)}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {signalWhyItMatters(firstSignal)}
              </p>
            </>
          }
          summary="Risk is a decision center. It explains what deserves attention, what is affected, and what should be monitored next."
          title="Risk: what deserves your attention."
        />

        {!summary?.signalCount ? (
          <WorkspaceEmptyState
            body="No elevated risks today. Add assets, FCNs, or watchlist items to make risk monitoring more personal."
            icon={ShieldCheck}
            title="No elevated risks today."
          />
        ) : null}

        <WorkspaceProductSection
          description="Top risks answer why this matters, what is affected, and what should be monitored."
          eyebrow="Top Risks"
          title="今天最需要留意"
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {(summary?.topSignals ?? []).slice(0, 3).map((signal) => (
              <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={signal.id}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[var(--ixai-gold)]" aria-hidden="true" />
                  <div>
                    <p className="text-base font-semibold text-[var(--ixai-forest)]">{signalLabel(signal)}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                      Why this matters: {signal.message}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-[var(--ixai-forest)]">
                      Monitor: {affectedText(signal)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
            {!(summary?.topSignals ?? []).length ? (
              <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)] lg:col-span-3">
                No elevated risks today. You are all caught up.
              </p>
            ) : null}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Risk is grouped by user attention area instead of duplicated raw metrics."
          eyebrow="Risk Areas"
          title="風險決策區"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              { icon: Layers3, label: "Concentration", result: concentration, text: "Large exposure to one asset or asset class." },
              { icon: ShieldAlert, label: "FCN Risk", result: fcnRisk, text: "KI, observation, coupon, maturity, or FCN data completeness." },
              { icon: TrendingUp, label: "Market Risk", result: marketRisk, text: "External market conditions that affect confidence." },
              { icon: WalletCards, label: "Portfolio Risk", result: portfolioRisk, text: "Asset allocation and portfolio shape." },
              { icon: BarChart3, label: "Data Completeness", result: dataQuality, text: "Missing data that reduces risk confidence." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={item.label}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.label}</p>
                      <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">{item.result.count ? `${item.result.count} signals` : "No elevated signal"}</p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
                      <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                    Why this matters: {item.result.highest?.message ?? item.text}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[var(--ixai-forest)]">
                    Monitor: {affectedText(item.result.highest)}
                  </p>
                </article>
              );
            })}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Upcoming risk events come from alerts and recent risk signals. Full scheduling belongs to Timeline."
          eyebrow="Upcoming Risk Events"
          title="接下來要留意"
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {data.alerts.alerts.slice(0, 4).map((alert) => (
              <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={alert.id}>
                <p className="text-base font-semibold text-[var(--ixai-forest)]">{alert.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  Why this matters: {alert.message}
                </p>
              </article>
            ))}
            {data.alerts.alerts.length === 0 ? (
              <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)] lg:col-span-2">
                No upcoming risk events. You are all caught up.
              </p>
            ) : null}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Recent risk history is for context only. It is not a trade signal."
          eyebrow="Risk History"
          title="最近風險紀錄"
        >
          <div className="grid gap-2">
            {history.length > 0 ? (
              history.map((signal) => (
                <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-3" key={signal.id}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--ixai-forest)]">{signalLabel(signal)}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--ixai-forest-soft)]">{signal.message}</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/72 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {new Intl.DateTimeFormat("zh-TW", { month: "2-digit", day: "2-digit" }).format(new Date(signal.createdAt))}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                No recent elevated risk history.
              </p>
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceStateMessage
          body="IXAI provides monitoring and risk awareness only. It does not provide buy, sell, hold, target price, or trading instructions."
          variant="no-data"
        />

        <WorkspaceDiagnosticsPanel description="risk data, market availability, legacy diagnostics">
          <RiskEngineSummary />
          <LiveRiskAdapterCard />
          <LegacyRiskEngineStatus />
          <WorkspaceMarketStatus contextLabel="Risk Center" />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}

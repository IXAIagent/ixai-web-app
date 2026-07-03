"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CircleAlert,
  DatabaseZap,
  Gauge,
  Layers3,
  ShieldAlert,
} from "lucide-react";

import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { LegacyRiskEngineStatus } from "@/components/risk/legacy-risk-engine-status";
import { LiveRiskAdapterCard } from "@/components/risk/live-risk-adapter-card";
import { RiskEngineSummary } from "@/components/risk/risk-engine-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import { buildEmptyWorkspaceAlertSummary } from "@/src/lib/alerts";
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

function topDriver(signal: RiskSignal | undefined) {
  if (!signal) return "暫無資料";
  if (signal.category === "concentration") return "集中度";
  if (signal.category === "crypto_exposure") return "Crypto exposure";
  if (signal.category === "market_data") return "市場資料";
  if (signal.category === "fcn_placeholder") return "FCN 資料";
  if (signal.category === "data_quality") return "資料完整度";
  return signal.title;
}

function driverCopy(signal: RiskSignal | undefined) {
  if (!signal) {
    return "目前沒有足夠資料產生主要風險原因。新增或補齊資產後，IXAI 會整理 concentration、FCN、crypto 與市場資料品質。";
  }

  return signal.message;
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
  const firstSignal = summary?.topSignals[0];
  const alertCount = data.alerts.criticalCount + data.alerts.highCount + data.alerts.warningCount;
  const dataConfidence =
    summary?.sourceStatus === "live"
      ? "穩定"
      : summary?.sourceStatus === "partial" || summary?.sourceStatus === "stale"
        ? "部分可用"
        : "暫無資料";

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/portfolio", icon: BarChart3, label: "查看資產" },
            { href: "/my-ixai/fcn", icon: ShieldAlert, label: "查看 FCN", variant: "secondary" },
          ]}
          eyebrow="Today's Risk Workspace"
          kpis={[
            {
              description: "依目前 Portfolio / FCN / market data 可用資料整理。",
              icon: Gauge,
              label: "Overall Risk",
              value: riskLabel(summary?.riskLevel),
            },
            {
              description: "今天最值得先看的風險來源。",
              icon: Layers3,
              label: "Top Driver",
              value: topDriver(firstSignal),
            },
            {
              description: "需要優先查看或今天留意的提醒。",
              icon: CircleAlert,
              label: "Alerts",
              value: String(alertCount),
            },
            {
              description: "資料完整度影響風險判斷。",
              icon: DatabaseZap,
              label: "Data Confidence",
              value: dataConfidence,
            },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                今日風險
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{riskLabel(summary?.riskLevel)}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {firstSignal ? driverCopy(firstSignal) : "目前資料不足，先顯示安全 placeholder。"}
              </p>
            </>
          }
          summary="先用自然語言回答今天風險如何、主要原因是什麼，再往下看 exposure、concentration 與進階診斷。"
          title="今日風險：先看原因，再看細節。"
        />

        <WorkspaceProductSection
          description="先解釋為什麼這些風險值得今天留意，再讓使用者查看完整訊號。"
          eyebrow="Why it matters"
          title="主要原因"
        >
          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
                <div>
                  <p className="text-base font-semibold text-[var(--ixai-forest)]">
                    {topDriver(firstSignal)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                    {driverCopy(firstSignal)}
                  </p>
                </div>
              </div>
            </article>
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <p className="text-base font-semibold text-[var(--ixai-forest)]">下一步</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                先檢查高集中度、FCN KI 距離、Crypto exposure 與資料完整度。IXAI 僅提供監控與提醒，不提供交易建議。
              </p>
            </article>
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="保留既有風險資料，但放在主要原因之後。"
          eyebrow="Top Risk Drivers"
          title="風險訊號"
        >
          <RiskEngineSummary />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="曝險與集中度沿用現有風險輸出，未新增任何風險計算。"
          eyebrow="Exposure / Concentration"
          title="Exposure 與集中度"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "全部風險訊號數。", icon: BarChart3, label: "Signals", value: String(summary?.signalCount ?? 0) },
              { description: "需要高度留意的訊號。", icon: ShieldAlert, label: "High", value: String(summary?.highSignalCount ?? 0), tone: summary?.highSignalCount ? "warning" : "default" },
              { description: "critical risk signals。", icon: CircleAlert, label: "Critical", value: String(summary?.criticalSignalCount ?? 0), tone: summary?.criticalSignalCount ? "critical" : "default" },
              { description: "目前可用風險分數。", icon: Gauge, label: "Risk Score", value: typeof summary?.riskScore === "number" ? `${Math.round(summary.riskScore)}/100` : "暫無資料" },
            ]}
          />
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="風險資料、更新狀態與安全邊界">
          <LiveRiskAdapterCard />
          <LegacyRiskEngineStatus />
          <WorkspaceMarketStatus contextLabel="Risk Center" />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}

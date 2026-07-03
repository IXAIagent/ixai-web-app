"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  ShieldAlert,
  ShieldCheck,
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
} from "@/components/workspace/product";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule/fcn-schedule-service";
import type { FcnPortfolioScheduleSummary } from "@/src/lib/fcn/schedule/fcn-schedule-types";
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

export function FcnExperienceWorkspace() {
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
          description="優先呈現最接近 KI、Worst-of、KO readiness 與資料不足狀態。"
          eyebrow="Risk Summary"
          title="需要留意的 FCN"
        >
          <FcnRiskSummary />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="整理 observation、coupon、maturity 與 next 30 days，讓時間壓力比 source details 更早被看見。"
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
          description="Positions 先以風險摘要與 schedule cards 呈現；raw source/readback/provider 保留在進階診斷。"
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

        <WorkspaceDiagnosticsPanel description="FCN risk source、schedule source、live underlying source、manual overlay source">
          <LiveFcnUnderlyingStatusCard />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}

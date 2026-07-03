"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Newspaper,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { IntelligenceSummary } from "@/components/intelligence/intelligence-summary";
import { IntelligenceV2Summary } from "@/components/intelligence/intelligence-v2-summary";
import { WorkspaceIntelligenceV14Summary } from "@/components/workspace/workspace-intelligence-v14-summary";
import { WorkspaceMorningBriefV14Card } from "@/components/workspace/workspace-morning-brief-v14-card";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import { getWorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-service";
import type {
  WorkspaceIntelligenceCard,
  WorkspaceIntelligenceReport,
} from "@/src/lib/intelligence/engine/intelligence-types";
import {
  getWorkspaceIntelligenceV2Report,
  type IntelligenceV2Report,
} from "@/src/lib/intelligence/v2";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function formatCount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "0";
}

function severityLabel(severity: string | undefined) {
  if (severity === "critical") return "需要留意";
  if (severity === "warning") return "注意";
  return "資訊";
}

function cardTone(severity: string | undefined) {
  if (severity === "critical") return "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)]";
  if (severity === "warning") return "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_9%,white)]";
  return "border-[var(--ixai-border)] bg-white/68";
}

function EmptyCard({ children }: { children: string }) {
  return (
    <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
      {children}
    </p>
  );
}

function MarketThemeCards({ cards }: { cards: WorkspaceIntelligenceCard[] }) {
  if (cards.length === 0) {
    return <EmptyCard>目前沒有新的市場主題。資料整理完成後，這裡會顯示今日最值得閱讀的重點。</EmptyCard>;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {cards.slice(0, 3).map((card) => (
        <article className={`rounded-lg border p-4 ${cardTone(card.severity)}`} key={card.id}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-base font-semibold text-[var(--ixai-forest)]">{card.title}</p>
            <span className="rounded-full border border-current/20 bg-white/48 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
              {severityLabel(card.severity)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">{card.summary}</p>
        </article>
      ))}
    </div>
  );
}

export function IntelligenceExperienceWorkspace() {
  const [report, setReport] = useState<WorkspaceIntelligenceReport | null>(null);
  const [v2Report, setV2Report] = useState<IntelligenceV2Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      setIsLoading(true);
      const result = await runWorkspaceSafe(
        "intelligence-experience-load",
        async () => Promise.all([getWorkspaceIntelligenceReport(), getWorkspaceIntelligenceV2Report()]),
        [null, null] as [WorkspaceIntelligenceReport | null, IntelligenceV2Report | null],
      );

      if (!mountedRef.current) return;
      setReport(result.data[0]);
      setV2Report(result.data[1]);
      setIsLoading(false);
    }

    queueMicrotask(() => void load());

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const marketCards = useMemo(
    () => report?.cards.filter((card) => card.category === "portfolio" || card.category === "risk") ?? [],
    [report],
  );
  const riskCards = useMemo(
    () => report?.cards.filter((card) => card.severity === "critical" || card.severity === "warning") ?? [],
    [report],
  );
  const summaryText =
    v2Report?.marketContext ??
    marketCards[0]?.summary ??
    "今日市場摘要正在整理中；IXAI 會先顯示可用的市場、風險與投資組合脈絡。";

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/copilot", icon: Sparkles, label: "詢問 Copilot" },
            { href: "/my-ixai/watchlist", icon: Newspaper, label: "查看市場追蹤", variant: "secondary" },
          ]}
          eyebrow="AI / Information Workspace"
          kpis={[
            { description: "今日整理出的市場與持倉脈絡。", icon: Newspaper, label: "Market Themes", value: formatCount(report?.cardCount) },
            { description: "市場與我的資產關聯摘要。", icon: BarChart3, label: "Portfolio Impact", value: v2Report?.portfolioContext ? "已整理" : "待整理" },
            { description: "需要今天留意的市場或風險訊號。", icon: ShieldAlert, label: "Risk Signals", value: formatCount((report?.criticalCount ?? 0) + (report?.warningCount ?? 0)) },
            { description: "Morning Brief 與資訊摘要可用狀態。", icon: Brain, label: "Brief Readiness", value: v2Report?.morningBriefContext ? "可閱讀" : "準備中" },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                今日最重要
              </p>
              <p className="mt-3 text-lg font-semibold leading-7 text-white">{summaryText}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                IXAI 只做 explain-only 市場與風險整理，不提供買賣建議、目標價或交易指令。
              </p>
            </>
          }
          summary="把市場、Morning Brief、持倉影響與需要注意的訊號整理成一頁，不再把 source/readiness 放在第一眼。"
          title="今日市場：先看重點，再看對我的影響。"
        />

        <WorkspaceProductSection
          description="用卡片呈現今日市場與資產脈絡，不把 Intelligence 當文件中心。"
          eyebrow="Today's Market"
          title="今天市場在說什麼"
        >
          <MarketThemeCards cards={marketCards.length > 0 ? marketCards : report?.cards ?? []} />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="用使用者語言說明市場、風險與持倉的關係；資料不足時保留安全 placeholder。"
          eyebrow="Portfolio Impact"
          title="和我的資產有什麼關係"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "今日資訊卡總數。", icon: Newspaper, label: "市場主題", value: formatCount(report?.cardCount) },
              { description: "需要今天留意的資訊。", icon: ShieldAlert, label: "需要留意", tone: riskCards.length > 0 ? "warning" : "default", value: String(riskCards.length) },
              { description: "投資組合脈絡可用狀態。", icon: BarChart3, label: "資產影響", value: v2Report?.portfolioContext ? "已整理" : "待整理" },
              { description: "Explain-only 安全邊界。", icon: Brain, label: "模式", value: "監控" },
            ]}
          />
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4 lg:col-span-2">
              <p className="text-base font-semibold text-[var(--ixai-forest)]">投資組合影響</p>
              <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {v2Report?.portfolioContext ?? "尚未有足夠持倉脈絡。新增資產後，這裡會整理市場與 Portfolio 的關聯。"}
              </p>
            </article>
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <p className="text-base font-semibold text-[var(--ixai-forest)]">今天要留意</p>
              <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {riskCards[0]?.summary ?? "目前沒有需要優先處理的市場風險訊號。"}
              </p>
            </article>
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Explain-only 摘要，不做買賣建議、不呼叫外部 AI provider。"
          eyebrow="AI Summary"
          title="IXAI 摘要"
        >
          <WorkspaceIntelligenceV14Summary autoLoad />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="保留 Morning Brief 與可閱讀資訊，但以產品卡片呈現。"
          eyebrow="News / Watchlist"
          title="延伸閱讀與關注"
          action={
            <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]" href="/my-ixai/watchlist">
              市場追蹤
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          }
        >
          <WorkspaceMorningBriefV14Card autoLoad compact />
        </WorkspaceProductSection>

        {isLoading ? (
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            正在整理今日市場摘要。可用資料會先顯示，缺少資料會保留 placeholder。
          </p>
        ) : null}

        <WorkspaceDiagnosticsPanel description="source readiness、provider status、intelligence status">
          <IntelligenceSummary />
          <IntelligenceV2Summary />
          <WorkspaceMarketStatus contextLabel="Intelligence" />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}

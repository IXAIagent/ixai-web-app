"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Brain,
  CalendarClock,
  Coins,
  Landmark,
  LineChart,
  Newspaper,
  ShieldAlert,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { IntelligenceSummary } from "@/components/intelligence/intelligence-summary";
import { IntelligenceV2Summary } from "@/components/intelligence/intelligence-v2-summary";
import { WorkspaceIntelligenceV14Summary } from "@/components/workspace/workspace-intelligence-v14-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import { getWorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-service";
import type { WorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-types";
import {
  getWorkspaceIntelligenceV2Report,
  type IntelligenceV2Report,
} from "@/src/lib/intelligence/v2";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

type PortfolioImpactItem = {
  confidence: string;
  icon: typeof WalletCards;
  impact: string;
  label: string;
  why: string;
};

function formatCount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "0";
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

function keyInsights(report: WorkspaceIntelligenceReport | null, v2Report: IntelligenceV2Report | null) {
  const cards = report?.cards ?? [];
  const insights = [
    v2Report?.marketContext,
    v2Report?.portfolioContext,
    v2Report?.morningBriefContext,
    ...cards.map((card) => card.summary),
  ].filter(Boolean) as string[];

  return insights.length > 0
    ? insights.slice(0, 5)
    : [
        "Market context is still being organized.",
        "Portfolio impact will improve after assets are added.",
        "Watch upcoming macro and earnings events.",
      ];
}

function buildPortfolioImpact(report: WorkspaceIntelligenceReport | null, v2Report: IntelligenceV2Report | null): PortfolioImpactItem[] {
  const cards = report?.cards ?? [];
  const riskCard = cards.find((card) => card.severity === "critical" || card.severity === "warning");
  const marketCard = cards.find((card) => card.category === "portfolio" || card.category === "risk") ?? cards[0];

  return [
    {
      confidence: v2Report?.portfolioContext ? "Medium" : "Limited",
      icon: WalletCards,
      impact: v2Report?.portfolioContext ? "Portfolio context available" : "Waiting for assets",
      label: "Affected Assets",
      why: v2Report?.portfolioContext ?? "Add assets so IXAI can connect market movement to your portfolio.",
    },
    {
      confidence: riskCard ? "Medium" : "Limited",
      icon: ShieldAlert,
      impact: riskCard ? "Risk context available" : "No elevated FCN impact",
      label: "FCN",
      why: riskCard?.summary ?? "FCN impact will appear when FCN positions and related market events are available.",
    },
    {
      confidence: marketCard ? "Medium" : "Limited",
      icon: LineChart,
      impact: marketCard ? "Market relationship available" : "Market impact limited",
      label: "Stocks / ETF",
      why: marketCard?.summary ?? "Stock and ETF impact will improve as watchlist and portfolio data become more complete.",
    },
    {
      confidence: "Limited",
      icon: Coins,
      impact: "Crypto monitoring available when assets exist",
      label: "Crypto",
      why: "Crypto impact appears when crypto holdings or watched symbols are available.",
    },
    {
      confidence: "Limited",
      icon: Landmark,
      impact: "Cash impact is informational",
      label: "Cash",
      why: "Cash context is kept separate from market movement unless allocation changes matter.",
    },
  ];
}

function opportunities(report: WorkspaceIntelligenceReport | null) {
  const cards = report?.cards ?? [];
  const fromCards = cards.slice(0, 3).map((card) => ({
    body: card.summary,
    title: card.title,
  }));

  return fromCards.length > 0
    ? fromCards
    : [
        { title: "Things worth monitoring", body: "Watch large portfolio movers, upcoming FCN events, and major macro data." },
        { title: "Upcoming events", body: "Check Timeline for observation, coupon, earnings, and macro calendar events." },
        { title: "Sector rotation", body: "Markets page will become the place for sector and watchlist shifts." },
      ];
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

  const insights = useMemo(() => keyInsights(report, v2Report), [report, v2Report]);
  const portfolioImpact = useMemo(() => buildPortfolioImpact(report, v2Report), [report, v2Report]);
  const monitoringItems = useMemo(() => opportunities(report), [report]);
  const riskCards = useMemo(
    () => report?.cards.filter((card) => card.severity === "critical" || card.severity === "warning") ?? [],
    [report],
  );

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/copilot", icon: Sparkles, label: "Ask Copilot" },
            { href: "/my-ixai/portfolio", icon: WalletCards, label: "Open Portfolio", variant: "secondary" },
          ]}
          eyebrow="Intelligence"
          kpis={[
            { description: "Market points translated into user-facing context.", icon: Newspaper, label: "Key Insights", value: String(insights.length) },
            { description: "Asset groups with an impact explanation.", icon: WalletCards, label: "Portfolio Impact", value: String(portfolioImpact.length) },
            { description: "Items worth monitoring, not buy recommendations.", icon: CalendarClock, label: "Watch Next", value: String(monitoringItems.length) },
            { description: "Market or risk items requiring attention.", icon: ShieldAlert, label: "Attention", value: String(riskCards.length) },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                What does today&apos;s market mean for my portfolio?
              </p>
              <p className="mt-3 text-lg font-semibold leading-7 text-white">{insights[0]}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Intelligence explains market meaning and portfolio impact. Engine, provider, and raw readback details stay in Advanced.
              </p>
            </>
          }
          summary="Intelligence turns market movement into portfolio context. It does not expose engine cards or provider details in the first layer."
          title="Today’s market, translated for your portfolio."
        />

        <WorkspaceProductSection
          description="Three to five plain-language insights before any details."
          eyebrow="Today's Market"
          title="今天市場代表什麼"
        >
          <ul className="grid gap-3">
            {insights.map((insight) => (
              <li className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]" key={insight}>
                <span className="mr-2 text-[var(--ixai-gold)]">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Impact is grouped by assets. It explains impact, why it matters, and confidence."
          eyebrow="Portfolio Impact"
          title="對我的投資有什麼影響"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {portfolioImpact.map((item) => {
              const Icon = item.icon;
              return (
                <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={item.label}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.label}</p>
                      <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">{item.impact}</p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
                      <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">Why: {item.why}</p>
                  <p className="mt-3 text-xs font-semibold text-[var(--ixai-forest)]">Confidence: {item.confidence}</p>
                </article>
              );
            })}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="These are things worth monitoring, not investment recommendations."
          eyebrow="Today's Opportunities"
          title="值得接下來觀察"
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {monitoringItems.map((item) => (
              <article className={`rounded-lg border p-4 ${cardTone(report?.cards.find((card) => card.title === item.title)?.severity)}`} key={item.title}>
                <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.body}</p>
              </article>
            ))}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="A short explain-only summary remains available without turning this page into diagnostics."
          eyebrow="Summary"
          title="IXAI 摘要"
        >
          <WorkspaceIntelligenceV14Summary autoLoad />
        </WorkspaceProductSection>

        {isLoading ? (
          <EmptyCard>正在整理今日市場與投資組合脈絡。可用資料會先顯示，缺少資料會以清楚文字說明。</EmptyCard>
        ) : null}

        <WorkspaceDiagnosticsPanel description="engine cards, raw readback, provider and diagnostics">
          <IntelligenceSummary />
          <IntelligenceV2Summary />
          <WorkspaceMarketStatus contextLabel="Intelligence" />
          <WorkspaceKpiGrid
            items={[
              { description: "Raw card count.", icon: Brain, label: "Raw Cards", value: formatCount(report?.cardCount) },
              { description: "Critical or warning raw cards.", icon: ShieldAlert, label: "Raw Attention", value: String(riskCards.length) },
              { description: "Report source details remain advanced.", icon: BarChart3, label: "Readback", value: report ? "Available" : "Limited" },
            ]}
          />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}

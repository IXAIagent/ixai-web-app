"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CandlestickChart,
  Coins,
  Landmark,
  LineChart,
  PieChart,
  PlusCircle,
  Radar,
  ShieldAlert,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { LivePortfolioValuationCard } from "@/components/portfolio/live-portfolio-valuation-card";
import { PortfolioPersistenceSummary } from "@/components/portfolio/portfolio-persistence-summary";
import { PortfolioTruthSummary } from "@/components/portfolio/portfolio-truth-summary";
import { PortfolioValuationSummary } from "@/components/portfolio/portfolio-valuation-summary";
import { RecentInputsPanel } from "@/components/portfolio/recent-inputs-panel";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceEmptyState,
  WorkspaceInsightCard,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
  WorkspaceStateMessage,
} from "@/components/workspace/product";
import {
  getIntelligenceAlertSnapshot,
  type IntelligenceAlert,
  type IntelligenceAlertSnapshot,
} from "@/src/lib/intelligence/alerts";
import {
  buildIntelligencePlatformContext,
  getIntelligencePlatformSnapshot,
  type IntelligenceHealth,
  type IntelligenceItem,
} from "@/src/lib/intelligence/platform";
import type {
  AssetClassValuation,
  PortfolioValuationResult,
  PositionValuation,
} from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

type PortfolioAssetClassCard = {
  allocation: string;
  icon: typeof WalletCards;
  key: string;
  label: string;
  marketValue: string;
  positionCount: string;
  unrealized: string;
};

const portfolioAssetClasses = [
  { icon: WalletCards, key: "all", label: "All Assets" },
  { icon: ShieldAlert, key: "fcn", label: "FCN" },
  { icon: CandlestickChart, key: "stock", label: "Stocks" },
  { icon: PieChart, key: "etf", label: "ETF" },
  { icon: Coins, key: "crypto", label: "Crypto" },
  { icon: Landmark, key: "cash", label: "Cash" },
];

function formatCurrency(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return new Intl.NumberFormat("zh-TW", {
    currency: currency === "MIXED" || currency === "USDT" ? "USD" : currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatSignedCurrency(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return `${value >= 0 ? "+" : "-"}${formatCurrency(Math.abs(value), currency)}`;
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暫無資料";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function getLargestPosition(positions: PositionValuation[]) {
  return positions
    .filter((position) => typeof position.marketValue === "number" && Number.isFinite(position.marketValue))
    .sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0))[0];
}

function getLargestGain(positions: PositionValuation[]) {
  return positions
    .filter((position) => typeof position.unrealizedPnl === "number" && Number.isFinite(position.unrealizedPnl))
    .sort((a, b) => (b.unrealizedPnl ?? 0) - (a.unrealizedPnl ?? 0))[0];
}

function getLargestLoss(positions: PositionValuation[]) {
  return positions
    .filter((position) => typeof position.unrealizedPnl === "number" && Number.isFinite(position.unrealizedPnl))
    .sort((a, b) => (a.unrealizedPnl ?? 0) - (b.unrealizedPnl ?? 0))[0];
}

function describePosition(position: PositionValuation | undefined, mode: "gain" | "loss" | "value") {
  if (!position) return "暫無資料";
  if (mode === "value") return `${position.symbol} · ${formatCurrency(position.marketValue, position.currency)}`;
  return `${position.symbol} · ${formatSignedCurrency(position.unrealizedPnl, position.currency)}`;
}

function assetClassLabel(assetClass: string) {
  switch (assetClass) {
    case "cash":
      return "Cash";
    case "crypto":
      return "Crypto";
    case "fcn":
      return "FCN";
    case "stock":
      return "Stocks";
    default:
      return "Other";
  }
}

function buildAssetClassCards(valuation: PortfolioValuationResult | null): PortfolioAssetClassCard[] {
  const summary = valuation?.summary;
  const allocationByClass = new Map<string, AssetClassValuation>();
  summary?.assetAllocation.forEach((item) => allocationByClass.set(item.assetClass, item));

  return portfolioAssetClasses.map((assetClass) => {
    if (assetClass.key === "all") {
      return {
        allocation: summary?.positionCount ? "100%" : "暫無資料",
        icon: assetClass.icon,
        key: assetClass.key,
        label: assetClass.label,
        marketValue: formatCurrency(summary?.totalMarketValue, valuation?.currency),
        positionCount: String(summary?.positionCount ?? 0),
        unrealized: formatSignedCurrency(summary?.totalUnrealizedPnl, valuation?.currency),
      };
    }

    const allocation = allocationByClass.get(assetClass.key);

    return {
      allocation: allocation ? `${allocation.allocationPercent.toFixed(0)}%` : "0%",
      icon: assetClass.icon,
      key: assetClass.key,
      label: assetClass.label,
      marketValue: formatCurrency(allocation?.marketValue, valuation?.currency),
      positionCount: String(allocation?.positionCount ?? 0),
      unrealized: formatSignedCurrency(allocation?.unrealizedPnl, valuation?.currency),
    };
  });
}

function buildInsights(valuation: PortfolioValuationResult | null) {
  const summary = valuation?.summary;
  const positions = valuation?.positions ?? [];
  const insights: string[] = [];
  const topAllocation = summary?.assetAllocation
    .filter((item) => item.marketValue > 0)
    .sort((a, b) => b.allocationPercent - a.allocationPercent)[0];
  const largestPosition = getLargestPosition(positions);
  const cryptoAllocation = summary?.assetAllocation.find((item) => item.assetClass === "crypto");
  const fcnAllocation = summary?.assetAllocation.find((item) => item.assetClass === "fcn");

  if (fcnAllocation && fcnAllocation.allocationPercent >= 30) {
    insights.push(`FCN allocation is high at ${fcnAllocation.allocationPercent.toFixed(0)}%.`);
  }

  if (largestPosition) {
    insights.push(`${largestPosition.symbol} contributes the largest exposure.`);
  }

  if (cryptoAllocation && cryptoAllocation.allocationPercent > 0) {
    insights.push(`Crypto represents ${cryptoAllocation.allocationPercent.toFixed(0)}% of assets.`);
  }

  if (topAllocation && insights.length < 3) {
    insights.push(`${assetClassLabel(topAllocation.assetClass)} is currently the largest asset class.`);
  }

  if (summary?.unpricedPositionCount) {
    insights.push(`${summary.unpricedPositionCount} holdings need more data before valuation is complete.`);
  }

  return insights.length > 0 ? insights.slice(0, 4) : ["No assets yet. Add your first position to see portfolio insights."];
}

function intelligenceTone(health: IntelligenceHealth | undefined) {
  if (health === "critical") return "critical" as const;
  if (health === "elevated" || health === "watch") return "warning" as const;
  if (health === "healthy") return "success" as const;
  return "default" as const;
}

function intelligenceBadge(item: IntelligenceItem) {
  if (item.priority === "urgent") return "Urgent";
  if (item.priority === "high") return "High";
  if (item.health === "critical") return "Critical";
  if (item.health === "watch" || item.health === "elevated") return "Watch";
  return "Info";
}

function alertTone(alert: IntelligenceAlert) {
  if (alert.severity === "critical" || alert.notificationPriority === "urgent") return "critical" as const;
  if (alert.severity === "warning" || alert.notificationPriority === "high") return "warning" as const;
  return "default" as const;
}

export function PortfolioExperienceWorkspace() {
  const [valuation, setValuation] = useState<PortfolioValuationResult | null>(null);
  const [alertSnapshot, setAlertSnapshot] = useState<IntelligenceAlertSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function loadValuation() {
      setIsLoading(true);
      const result = await runWorkspaceSafe(
        "portfolio-experience-intelligence-context",
        async () => {
          const context = await buildIntelligencePlatformContext();
          const platformSnapshot = await getIntelligencePlatformSnapshot({ context });
          const alertSnapshot = await getIntelligenceAlertSnapshot({ platformSnapshot });

          return {
            alertSnapshot,
            valuation: context.portfolioValuation,
          };
        },
        { alertSnapshot: null, valuation: null } as {
          alertSnapshot: IntelligenceAlertSnapshot | null;
          valuation: PortfolioValuationResult | null;
        },
      );

      if (!mountedRef.current) return;
      setValuation(result.data.valuation);
      setAlertSnapshot(result.data.alertSnapshot);
      setIsLoading(false);
    }

    queueMicrotask(() => {
      void loadValuation();
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const summary = valuation?.summary;
  const positions = useMemo(() => valuation?.positions ?? [], [valuation?.positions]);
  const largestPosition = useMemo(() => getLargestPosition(positions), [positions]);
  const largestGain = useMemo(() => getLargestGain(positions), [positions]);
  const largestLoss = useMemo(() => getLargestLoss(positions), [positions]);
  const assetClassCards = useMemo(() => buildAssetClassCards(valuation), [valuation]);
  const insights = useMemo(() => buildInsights(valuation), [valuation]);
  const platformPortfolio = alertSnapshot?.platformSnapshot.portfolio;
  const platformRisk = alertSnapshot?.platformSnapshot.risk;
  const portfolioAlerts = useMemo(
    () => (alertSnapshot?.alerts ?? []).filter((alert) => alert.ruleFamily === "portfolio" || alert.ruleFamily === "risk").slice(0, 3),
    [alertSnapshot?.alerts],
  );
  const positionHealth = platformPortfolio?.items.slice(0, 4) ?? [];

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/input", icon: PlusCircle, label: "新增資產" },
            { href: "/my-ixai/risk", icon: ShieldAlert, label: "查看風險", variant: "secondary" },
          ]}
          eyebrow="Portfolio"
          kpis={[
            {
              description: summary?.positionCount ? "以目前可用資料估算。" : "新增資產後會顯示總資產。",
              icon: WalletCards,
              label: "Estimated Portfolio Value",
              value: formatCurrency(summary?.totalMarketValue, valuation?.currency),
            },
            {
              description: "今日可估未實現變化。",
              icon: LineChart,
              label: "Today's P/L",
              value: `${formatSignedCurrency(summary?.totalUnrealizedPnl, valuation?.currency)} · ${formatPercent(summary?.totalUnrealizedPnlPercent)}`,
            },
            {
              description: "目前最大的資產部位。",
              icon: BriefcaseBusiness,
              label: "Largest Position",
              value: describePosition(largestPosition, "value"),
            },
            {
              description: "持倉中的最大正向與負向變化。",
              icon: TrendingUp,
              label: "Largest Gain / Loss",
              value: `${largestGain?.symbol ?? "暫無"} / ${largestLoss?.symbol ?? "暫無"}`,
            },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                How is my money performing?
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {summary?.positionCount ? `${summary.positionCount} holdings · ${formatPercent(summary.totalUnrealizedPnlPercent)}` : "No assets yet."}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Portfolio is about your assets: value, allocation, gains, losses, and holdings. Market events and risk decisions live on their own pages.
              </p>
            </>
          }
          summary="Portfolio answers how your money is performing. It does not duplicate market news or risk decision center content."
          title="Portfolio: your assets in one view."
        />

        {!summary?.positionCount ? (
          <WorkspaceEmptyState
            actionHref="/my-ixai/input"
            actionLabel="新增第一筆資產"
            body="No assets yet. Import or add your first portfolio position to see value, allocation, gains, losses, and asset-class summaries."
            icon={PlusCircle}
            title="No assets yet."
          />
        ) : null}

        <WorkspaceProductSection
          description="All Assets, FCN, Stocks, ETF, Crypto, and Cash stay inside Portfolio as asset classes."
          eyebrow="Asset Classes"
          title="資產類別"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {assetClassCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={card.key}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-[var(--ixai-forest)]">{card.label}</p>
                      <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">{card.positionCount} positions</p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
                      <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                    <p>Allocation: <span className="font-semibold text-[var(--ixai-forest)]">{card.allocation}</span></p>
                    <p>Market value: <span className="font-semibold text-[var(--ixai-forest)]">{card.marketValue}</span></p>
                    <p>Unrealized P/L: <span className="font-semibold text-[var(--ixai-forest)]">{card.unrealized}</span></p>
                  </div>
                </article>
              );
            })}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Position health reuses the shared V20A/V20B intelligence layer. It explains what happened, why it matters, and where to inspect."
          eyebrow="Position Health"
          title="持倉健康狀態"
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {positionHealth.length > 0 ? (
              positionHealth.map((item) => (
                <WorkspaceInsightCard
                  actionHref="/my-ixai/portfolio"
                  actionLabel="Inspect"
                  badge={intelligenceBadge(item)}
                  badgeVariant={item.priority}
                  icon={Radar}
                  key={item.id}
                  summary={item.summary}
                  title={item.title}
                  tone={intelligenceTone(item.health)}
                  why={item.whyItMatters}
                />
              ))
            ) : (
              <WorkspaceEmptyState
                actionHref="/my-ixai/input"
                actionLabel="新增資產"
                body="No position health signals yet. Add holdings so IXAI can connect value, allocation, and risk context."
                icon={Radar}
                title="Position health is waiting for assets."
              />
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Insights explain the portfolio shape without becoming market news or risk alerts."
          eyebrow="Insights"
          title="Portfolio insights"
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {insights.map((insight) => (
              <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={insight}>
                <p className="text-sm font-semibold text-[var(--ixai-forest)]">{insight}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  Why this matters: it changes how concentrated, diversified, or complete your asset picture is.
                </p>
              </article>
            ))}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Risk summary stays concise here. The full decision center remains on Risk."
          eyebrow="Risk Summary"
          title="資產相關風險"
        >
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <WorkspaceKpiGrid
              items={[
                {
                  description: "Portfolio-related critical items.",
                  icon: ShieldAlert,
                  label: "Critical",
                  tone: (platformRisk?.criticalCount ?? 0) > 0 ? "critical" : "default",
                  value: String(platformRisk?.criticalCount ?? 0),
                },
                {
                  description: "Items worth monitoring.",
                  icon: TrendingUp,
                  label: "Warnings",
                  tone: (platformRisk?.elevatedCount ?? 0) > 0 ? "warning" : "default",
                  value: String(platformRisk?.elevatedCount ?? 0),
                },
                {
                  description: "Symbols currently driving the risk picture.",
                  icon: BriefcaseBusiness,
                  label: "Top Symbols",
                  value: platformRisk?.topRiskSymbols.slice(0, 3).join(", ") || "暫無",
                },
              ]}
            />
            <div className="grid gap-3">
              {portfolioAlerts.length > 0 ? (
                portfolioAlerts.map((alert) => (
                  <WorkspaceInsightCard
                    actionHref="/my-ixai/risk"
                    actionLabel="Inspect Risk"
                    badge={alert.notificationPriority}
                    badgeVariant={alert.notificationPriority}
                    icon={ShieldAlert}
                    key={alert.id}
                    summary={alert.summary}
                    title={alert.title}
                    tone={alertTone(alert)}
                    why={alert.whyItMatters}
                  />
                ))
              ) : (
                <WorkspaceEmptyState
                  body="No elevated portfolio risk today. Risk items will appear here when they affect your assets."
                  icon={ShieldAlert}
                  title="No elevated portfolio risk."
                />
              )}
            </div>
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="A lightweight allocation view before the detailed holdings list."
          eyebrow="Allocation"
          title="配置視覺化"
        >
          <div className="grid gap-3">
            {(summary?.assetAllocation ?? []).length > 0 ? (
              summary?.assetAllocation.map((item) => (
                <div className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={item.assetClass}>
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[var(--ixai-forest)]">
                    <span>{assetClassLabel(item.assetClass)}</span>
                    <span>{item.allocationPercent.toFixed(1)}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[rgba(9,41,31,0.08)]">
                    <div
                      className="h-full rounded-full bg-[var(--ixai-gold)]"
                      style={{ width: `${Math.min(Math.max(item.allocationPercent, 0), 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[var(--ixai-forest-soft)]">
                    {formatCurrency(item.marketValue, valuation?.currency)} · {item.positionCount} positions
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                No allocation yet. Add assets to see how your portfolio is distributed.
              </p>
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Detailed holdings stay on Portfolio. They should not appear on Markets or Risk."
          eyebrow="Holdings"
          title="Detailed holdings"
        >
          {positions.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-[var(--ixai-border)] bg-white/68">
              <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] gap-3 border-b border-[var(--ixai-border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)] md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]">
                <span>Asset</span>
                <span>Class</span>
                <span>Value</span>
                <span className="hidden md:block">Unrealized</span>
                <span className="hidden md:block">Allocation</span>
              </div>
              {positions.slice(0, 12).map((position) => (
                <article className="grid grid-cols-[1.2fr_0.8fr_0.8fr] gap-3 border-b border-[var(--ixai-border)] px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]" key={position.id}>
                  <span>
                    <span className="block font-semibold text-[var(--ixai-forest)]">{position.symbol}</span>
                    <span className="block text-xs text-[var(--ixai-forest-soft)]">{position.name}</span>
                  </span>
                  <span className="text-[var(--ixai-forest-soft)]">{assetClassLabel(position.assetClass)}</span>
                  <span className="font-semibold text-[var(--ixai-forest)]">{formatCurrency(position.marketValue, position.currency)}</span>
                  <span className="hidden text-[var(--ixai-forest-soft)] md:block">{formatSignedCurrency(position.unrealizedPnl, position.currency)}</span>
                  <span className="hidden text-[var(--ixai-forest-soft)] md:block">{position.allocationPercent.toFixed(1)}%</span>
                </article>
              ))}
            </div>
          ) : (
            <WorkspaceEmptyState
              actionHref="/my-ixai/input"
              actionLabel="新增資產"
              body="No holdings yet. Add a stock, ETF, crypto, FCN, or cash position to start building your asset dashboard."
              icon={PlusCircle}
              title="No holdings yet."
            />
          )}
        </WorkspaceProductSection>

        {isLoading ? (
          <WorkspaceStateMessage
            body="Portfolio is organizing your assets. Missing pieces will appear as clear empty states."
            variant="no-data"
          />
        ) : null}

        {!isLoading && summary?.positionCount && summary.unpricedPositionCount > 0 ? (
          <WorkspaceStateMessage
            body={`${summary.unpricedPositionCount} holdings need more price, cost, or quantity data before Portfolio is complete.`}
            variant="no-coverage"
          />
        ) : null}

        <WorkspaceDiagnosticsPanel description="asset data completeness and advanced checks">
          <PortfolioTruthSummary />
          <PortfolioPersistenceSummary />
          <PortfolioValuationSummary />
          <LivePortfolioValuationCard />
          <WorkspaceMarketStatus contextLabel="Portfolio Center" />
          <RecentInputsPanel />
        </WorkspaceDiagnosticsPanel>

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          IXAI provides monitoring and awareness. It does not provide buy, sell, hold, target price, or trading instructions.
        </p>
      </section>
    </main>
  );
}

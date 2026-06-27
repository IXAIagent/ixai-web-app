import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import type { WorkspaceLiveMarketSnapshot } from "@/src/lib/market-data";
import type { LegacyLiveRiskAdapterSnapshot } from "@/src/lib/risk/legacy-risk-engine/live-risk-adapter";
import type {
  FcnLiveUnderlyingSnapshot,
  PortfolioLiveValuationSnapshot,
} from "@/src/lib/valuation";
import type { WorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-types";

export type MorningBriefV1SectionStatus =
  | "partial"
  | "placeholder"
  | "ready"
  | "unavailable";

export type MorningBriefV1Section = {
  detail: string;
  label: string;
  source: string;
  status: MorningBriefV1SectionStatus;
  value: string;
};

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function mapDataQuality(value: string | null | undefined): MorningBriefV1SectionStatus {
  if (value === "live" || value === "ready") return "ready";
  if (value === "unavailable") return "unavailable";
  if (value === "placeholder") return "placeholder";
  return "partial";
}

export function buildMorningBriefV1Sections(input: {
  alerts: WorkspaceAlertSummary | null;
  fcn: FcnLiveUnderlyingSnapshot;
  liveMarket: WorkspaceLiveMarketSnapshot;
  portfolio: PortfolioLiveValuationSnapshot;
  risk: LegacyLiveRiskAdapterSnapshot;
  watchlist: WorkspaceWatchlistSummary | null;
}): MorningBriefV1Section[] {
  const worstUnderlying = input.fcn.topWorstOf?.underlyings.find((underlying) => underlying.isWorstOf);

  return [
    {
      detail: `${input.portfolio.positionCount} priced or fallback position(s). Missing quotes: ${input.portfolio.missingQuoteSymbols.length}.`,
      label: "Portfolio",
      source: "Portfolio Truth + Live Market Service",
      status: mapDataQuality(input.portfolio.dataQuality),
      value: formatMoney(input.portfolio.currentValue),
    },
    {
      detail: `P/L ${formatMoney(input.portfolio.unrealizedPnl)} · ${formatPercent(input.portfolio.unrealizedPnlPercent)}.`,
      label: "Live Valuation",
      source: "Yahoo quote snapshot",
      status: mapDataQuality(input.liveMarket.dataQuality),
      value: input.liveMarket.provider.toUpperCase(),
    },
    {
      detail: `Worst-of ${worstUnderlying?.symbol ?? "Unavailable"} · KI distance ${formatPercent(worstUnderlying?.distanceToKiPercent)}.`,
      label: "FCN",
      source: "FCN readback + live underlying status",
      status: mapDataQuality(input.fcn.dataQuality),
      value: input.fcn.topWorstOf?.name ?? "No analyzable FCN",
    },
    {
      detail: `${input.risk.liveWarningCount} live quote warning(s). Missing quotes: ${input.risk.missingQuoteSymbols.length}.`,
      label: "Risk",
      source: "V15 Legacy Risk Engine + live adapter",
      status: mapDataQuality(input.risk.dataQuality),
      value: input.risk.riskLevel,
    },
    {
      detail: `Missing ${input.liveMarket.missingSymbols.length}; stale ${input.liveMarket.staleSymbols.length}; cache ${input.liveMarket.cacheStatus}.`,
      label: "Quote Diagnostics",
      source: "Workspace Live Market Service",
      status: mapDataQuality(input.liveMarket.dataQuality),
      value: input.liveMarket.marketState,
    },
    {
      detail: `${input.alerts?.criticalCount ?? 0} critical, ${input.alerts?.highCount ?? 0} high, ${input.alerts?.warningCount ?? 0} warning.`,
      label: "Alerts",
      source: "Alert Engine",
      status: input.alerts ? "ready" : "unavailable",
      value: `${input.alerts?.alertCount ?? 0} alert(s)`,
    },
    {
      detail: `${input.watchlist?.quotedItemCount ?? 0} quoted, ${input.watchlist?.unquotedItemCount ?? 0} unavailable.`,
      label: "Watchlist",
      source: "Watchlist + Live Market Service",
      status: input.watchlist ? mapDataQuality(input.watchlist.sourceStatus) : "unavailable",
      value: `${input.watchlist?.itemCount ?? 0} item(s)`,
    },
    {
      detail: "News provider is not configured in this release. No synthetic news is generated.",
      label: "News",
      source: "Placeholder",
      status: "placeholder",
      value: "Placeholder only",
    },
  ];
}

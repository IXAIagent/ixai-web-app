import type { YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo";
import type { LegacyRiskEngineSnapshot, LegacyRiskLevel } from "@/src/lib/risk/legacy-risk-engine";
import type {
  FcnLiveUnderlyingSnapshot,
  PortfolioLiveValuationSnapshot,
} from "@/src/lib/valuation";

export type LegacyLiveRiskAdapterSnapshot = {
  dataQuality: "live" | "partial" | "stale" | "unavailable";
  fcnWorstOfSymbol: string | null;
  generatedAt: string;
  marketAsOf: string | null;
  liveWarningCount: number;
  missingQuoteSymbols: string[];
  portfolioCurrentValue: number | null;
  readOnly: true;
  recommendationLogicEnabled: false;
  riskLevel: LegacyRiskLevel;
  source: "yahoo_live_preview";
  staleQuoteSymbols: string[];
  tradingActionEnabled: false;
  warnings: string[];
};

function inferDataQuality(input: {
  fcn: FcnLiveUnderlyingSnapshot | null;
  portfolio: PortfolioLiveValuationSnapshot | null;
  quoteSnapshot: YahooQuoteSnapshot | null;
}): LegacyLiveRiskAdapterSnapshot["dataQuality"] {
  if (!input.quoteSnapshot) return "unavailable";
  if (
    input.quoteSnapshot.dataQuality === "unavailable" ||
    input.portfolio?.dataQuality === "unavailable" ||
    input.fcn?.dataQuality === "unavailable"
  ) {
    return "partial";
  }
  if (
    input.quoteSnapshot.dataQuality === "stale" ||
    input.portfolio?.dataQuality === "stale" ||
    input.fcn?.dataQuality === "stale"
  ) {
    return "stale";
  }
  if (
    input.quoteSnapshot.dataQuality === "partial" ||
    input.portfolio?.dataQuality === "partial" ||
    input.fcn?.dataQuality === "partial"
  ) {
    return "partial";
  }
  return "live";
}

export function buildLegacyLiveRiskAdapterSnapshot(input: {
  fcn: FcnLiveUnderlyingSnapshot | null;
  legacyRiskSnapshot: LegacyRiskEngineSnapshot | null;
  portfolio: PortfolioLiveValuationSnapshot | null;
  quoteSnapshot: YahooQuoteSnapshot | null;
}): LegacyLiveRiskAdapterSnapshot {
  const missingQuoteSymbols = Array.from(
    new Set([
      ...(input.quoteSnapshot?.missingQuoteSymbols ?? []),
      ...(input.portfolio?.missingQuoteSymbols ?? []),
      ...(input.fcn?.missingQuoteSymbols ?? []),
    ]),
  );
  const staleQuoteSymbols = Array.from(
    new Set([
      ...(input.quoteSnapshot?.staleQuoteSymbols ?? []),
      ...(input.portfolio?.staleQuoteSymbols ?? []),
      ...(input.fcn?.staleQuoteSymbols ?? []),
    ]),
  );
  const warnings = [
    ...missingQuoteSymbols.map((symbol) => `Missing Yahoo quote for ${symbol}.`),
    ...staleQuoteSymbols.map((symbol) => `Using stale Yahoo quote for ${symbol}.`),
    ...(input.fcn?.topWorstOf
      ? [
          `FCN worst-of live preview: ${input.fcn.topWorstOf.worstOfSymbol ?? "unknown"} at ${
            input.fcn.topWorstOf.worstOfPerformancePercent?.toFixed(2) ?? "unknown"
          }%.`,
        ]
      : []),
  ];

  return {
    dataQuality: inferDataQuality(input),
    fcnWorstOfSymbol: input.fcn?.topWorstOf?.worstOfSymbol ?? null,
    generatedAt: new Date().toISOString(),
    marketAsOf: input.quoteSnapshot?.generatedAt ?? null,
    liveWarningCount: warnings.length,
    missingQuoteSymbols,
    portfolioCurrentValue: input.portfolio?.currentValue ?? null,
    readOnly: true,
    recommendationLogicEnabled: false,
    riskLevel: input.legacyRiskSnapshot?.portfolioRisk.riskLevel ?? "insufficient_data",
    source: "yahoo_live_preview",
    staleQuoteSymbols,
    tradingActionEnabled: false,
    warnings,
  };
}

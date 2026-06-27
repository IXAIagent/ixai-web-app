import type { MorningBriefLivePreviewSummary, MorningBriefSourceStatus } from "@/src/lib/morning-brief/brief-types";
import type { LegacyLiveRiskAdapterSnapshot } from "@/src/lib/risk/legacy-risk-engine/live-risk-adapter";
import type {
  FcnLiveUnderlyingSnapshot,
  PortfolioLiveValuationSnapshot,
} from "@/src/lib/valuation";

function mapLiveStatus(status: string | null | undefined): MorningBriefSourceStatus {
  if (status === "live") return "ready";
  if (status === "manual_fallback" || status === "partial" || status === "stale") {
    return "partial";
  }
  return "unavailable";
}

export function buildMorningLivePreviewSummary(input: {
  fcnSnapshot?: FcnLiveUnderlyingSnapshot | null;
  portfolioValuation?: PortfolioLiveValuationSnapshot | null;
  riskAdapterSnapshot?: LegacyLiveRiskAdapterSnapshot | null;
}): MorningBriefLivePreviewSummary | null {
  if (!input.portfolioValuation && !input.fcnSnapshot && !input.riskAdapterSnapshot) {
    return null;
  }

  const missingQuoteSymbols = Array.from(
    new Set([
      ...(input.portfolioValuation?.missingQuoteSymbols ?? []),
      ...(input.fcnSnapshot?.missingQuoteSymbols ?? []),
      ...(input.riskAdapterSnapshot?.missingQuoteSymbols ?? []),
    ]),
  );
  const staleQuoteSymbols = Array.from(
    new Set([
      ...(input.portfolioValuation?.staleQuoteSymbols ?? []),
      ...(input.fcnSnapshot?.staleQuoteSymbols ?? []),
      ...(input.riskAdapterSnapshot?.staleQuoteSymbols ?? []),
    ]),
  );
  const sourceStatus =
    missingQuoteSymbols.length > 0 || staleQuoteSymbols.length > 0
      ? "partial"
      : mapLiveStatus(input.riskAdapterSnapshot?.dataQuality ?? input.portfolioValuation?.dataQuality);

  return {
    dataQuality: sourceStatus,
    fcnWorstOfSymbol:
      input.riskAdapterSnapshot?.fcnWorstOfSymbol ?? input.fcnSnapshot?.topWorstOf?.worstOfSymbol ?? null,
    generatedAt: new Date().toISOString(),
    missingQuoteSymbols,
    portfolioCurrentValue: input.portfolioValuation?.currentValue ?? null,
    quoteSource: "yahoo",
    readOnly: true,
    riskLevel: input.riskAdapterSnapshot?.riskLevel ?? "insufficient_data",
    sourceStatus,
    staleQuoteSymbols,
  };
}

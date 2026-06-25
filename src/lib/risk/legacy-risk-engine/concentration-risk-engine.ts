import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type {
  LegacyConcentrationRiskSummary,
  LegacyRiskSymbolExposure,
  LegacyRiskWarning,
} from "@/src/lib/risk/legacy-risk-engine/risk-engine-types";
import { normalizeSymbol, roundMetric } from "@/src/lib/risk/legacy-risk-engine/risk-engine-utils";

function buildSymbolExposureFromTruth(truth: PortfolioTruthReadback): LegacyRiskSymbolExposure[] {
  const totalPositions = Math.max(truth.counts.totalAssets + truth.counts.totalPendingInputs, 1);

  return truth.symbols.topExposures.map((exposure) => ({
    occurrenceCount: exposure.occurrenceCount,
    percentOfPositions: roundMetric((exposure.occurrenceCount / totalPositions) * 100, 1),
    sources: exposure.sources,
    symbol: normalizeSymbol(exposure.symbol),
  }));
}

function buildRepeatedFcnUnderlyings(truth: PortfolioTruthReadback): LegacyRiskSymbolExposure[] {
  const buckets = new Map<string, { count: number; sources: Set<string> }>();

  truth.positions.fcn.forEach((position) => {
    position.underlyings.forEach((underlying) => {
      const symbol = normalizeSymbol(underlying.symbol);
      if (!symbol) return;
      const current = buckets.get(symbol) ?? { count: 0, sources: new Set<string>() };
      current.count += 1;
      current.sources.add(position.name);
      buckets.set(symbol, current);
    });
  });

  const totalFcnUnderlyings = Array.from(buckets.values()).reduce((sum, bucket) => sum + bucket.count, 0);

  return Array.from(buckets.entries())
    .map(([symbol, bucket]) => ({
      occurrenceCount: bucket.count,
      percentOfPositions:
        totalFcnUnderlyings > 0 ? roundMetric((bucket.count / totalFcnUnderlyings) * 100, 1) : null,
      sources: Array.from(bucket.sources).sort((a, b) => a.localeCompare(b)),
      symbol,
    }))
    .filter((exposure) => exposure.occurrenceCount > 1)
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount || a.symbol.localeCompare(b.symbol));
}

export function buildLegacyConcentrationRiskSummary(
  truth: PortfolioTruthReadback | null,
): LegacyConcentrationRiskSummary {
  const generatedAt = new Date().toISOString();

  if (!truth) {
    return {
      fcnRepeatedUnderlyings: [],
      generatedAt,
      riskLevel: "insufficient_data",
      sourceStatus: "unavailable",
      topExposures: [],
      warnings: [
        {
          code: "truth-unavailable",
          message: "Portfolio Truth Layer is unavailable for concentration analysis.",
          severity: "warning",
        },
      ],
    };
  }

  const topExposures = buildSymbolExposureFromTruth(truth);
  const fcnRepeatedUnderlyings = buildRepeatedFcnUnderlyings(truth);
  const warnings: LegacyRiskWarning[] = [];
  const topExposure = topExposures[0];

  if (topExposure?.percentOfPositions !== null && topExposure?.percentOfPositions !== undefined) {
    if (topExposure.percentOfPositions >= 60) {
      warnings.push({
        code: "single-name-critical",
        message: `${topExposure.symbol} appears in ${topExposure.percentOfPositions}% of available positions.`,
        severity: "critical",
      });
    } else if (topExposure.percentOfPositions >= 40) {
      warnings.push({
        code: "single-name-high",
        message: `${topExposure.symbol} concentration is elevated across available positions.`,
        severity: "high",
      });
    }
  }

  fcnRepeatedUnderlyings.slice(0, 3).forEach((exposure) => {
    warnings.push({
      code: `repeated-fcn-underlying-${exposure.symbol}`,
      message: `${exposure.symbol} appears across ${exposure.occurrenceCount} FCN underlying entries.`,
      severity: exposure.occurrenceCount >= 3 ? "high" : "warning",
    });
  });

  const hasCritical = warnings.some((warning) => warning.severity === "critical");
  const hasHigh = warnings.some((warning) => warning.severity === "high");

  return {
    fcnRepeatedUnderlyings,
    generatedAt,
    riskLevel: hasCritical ? "critical" : hasHigh ? "high" : warnings.length > 0 ? "elevated" : "low",
    sourceStatus: truth.counts.totalAssets > 0 || truth.counts.totalPendingInputs > 0 ? "ready" : "insufficient_data",
    topExposures,
    warnings,
  };
}

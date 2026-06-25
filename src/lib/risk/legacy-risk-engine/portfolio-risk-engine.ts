import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type {
  LegacyPortfolioRiskSummary,
  LegacyRiskCurrencyExposure,
  LegacyRiskExposureBucket,
  LegacyRiskSymbolExposure,
  LegacyRiskWarning,
} from "@/src/lib/risk/legacy-risk-engine/risk-engine-types";
import { normalizeSymbol, percentOf, roundMetric, scoreToLevel } from "@/src/lib/risk/legacy-risk-engine/risk-engine-utils";

function buildCurrencyExposure(truth: PortfolioTruthReadback): LegacyRiskCurrencyExposure[] {
  const buckets = new Map<string, { notional: number; positionCount: number }>();

  const add = (currency: string | null | undefined, notional: number | null | undefined) => {
    const key = (currency ?? "UNKNOWN").toUpperCase();
    const current = buckets.get(key) ?? { notional: 0, positionCount: 0 };
    current.positionCount += 1;
    if (typeof notional === "number" && Number.isFinite(notional)) {
      current.notional += notional;
    }
    buckets.set(key, current);
  };

  truth.positions.stock.forEach((position) => {
    const notional =
      typeof position.quantity === "number" && typeof position.averageCost === "number"
        ? position.quantity * position.averageCost
        : null;
    add(position.currency, notional);
  });
  truth.positions.crypto.forEach((position) => {
    const notional =
      typeof position.quantity === "number" && typeof position.averageCost === "number"
        ? position.quantity * position.averageCost
        : null;
    add(position.currency, notional);
  });
  truth.positions.fcn.forEach((position) => add(position.currency, position.notionalAmount));

  const total = Array.from(buckets.values()).reduce((sum, bucket) => sum + bucket.notional, 0);

  return Array.from(buckets.entries())
    .map(([currency, bucket]) => ({
      currency,
      notional: bucket.notional > 0 ? roundMetric(bucket.notional, 2) : null,
      percent: total > 0 ? roundMetric(percentOf(bucket.notional, total), 1) : null,
      positionCount: bucket.positionCount,
    }))
    .sort((a, b) => b.positionCount - a.positionCount || (b.notional ?? 0) - (a.notional ?? 0));
}

function buildAssetClassExposure(truth: PortfolioTruthReadback): LegacyRiskExposureBucket[] {
  const total = truth.amounts.totalKnownNotional > 0 ? truth.amounts.totalKnownNotional : null;
  const buckets: LegacyRiskExposureBucket[] = [
    {
      label: "FCN",
      notional: truth.amounts.fcnNotional > 0 ? roundMetric(truth.amounts.fcnNotional, 2) : null,
      percent: roundMetric(percentOf(truth.amounts.fcnNotional, total), 1),
      positionCount: truth.counts.totalFcnPositions,
      sourceStatus: truth.counts.totalFcnPositions > 0 ? "ready" : "insufficient_data",
    },
    {
      label: "Stock",
      notional:
        truth.amounts.stockNotionalKnown > 0 ? roundMetric(truth.amounts.stockNotionalKnown, 2) : null,
      percent: roundMetric(percentOf(truth.amounts.stockNotionalKnown, total), 1),
      positionCount: truth.counts.totalStockPositions,
      sourceStatus: truth.counts.totalStockPositions > 0 ? "ready" : "insufficient_data",
    },
    {
      label: "Crypto",
      notional:
        truth.amounts.cryptoNotionalKnown > 0 ? roundMetric(truth.amounts.cryptoNotionalKnown, 2) : null,
      percent: roundMetric(percentOf(truth.amounts.cryptoNotionalKnown, total), 1),
      positionCount: truth.counts.totalCryptoPositions,
      sourceStatus: truth.counts.totalCryptoPositions > 0 ? "ready" : "insufficient_data",
    },
    {
      label: "Pending / Local",
      notional:
        truth.amounts.pendingKnownNotional > 0 ? roundMetric(truth.amounts.pendingKnownNotional, 2) : null,
      percent: roundMetric(percentOf(truth.amounts.pendingKnownNotional, total), 1),
      positionCount: truth.counts.totalPendingInputs,
      sourceStatus: truth.counts.totalPendingInputs > 0 ? "fallback" : "insufficient_data",
    },
  ];

  return buckets;
}

function buildSingleNameConcentration(truth: PortfolioTruthReadback): LegacyRiskSymbolExposure | null {
  const top = truth.symbols.topExposures[0];
  if (!top) return null;

  const totalPositions = Math.max(truth.counts.totalAssets, 1);

  return {
    occurrenceCount: top.occurrenceCount,
    percentOfPositions: roundMetric((top.occurrenceCount / totalPositions) * 100, 1),
    sources: top.sources,
    symbol: normalizeSymbol(top.symbol),
  };
}

function buildWarnings(truth: PortfolioTruthReadback, exposure: LegacyRiskExposureBucket[]) {
  const warnings: LegacyRiskWarning[] = truth.missingDataWarnings.map((message, index) => ({
    code: `truth-warning-${index + 1}`,
    message,
    severity: "warning",
  }));

  const largestClass = exposure
    .filter((bucket) => bucket.percent !== null)
    .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0))[0];

  if (largestClass?.percent !== null && largestClass.percent >= 70) {
    warnings.push({
      code: "asset-class-concentration",
      message: `${largestClass.label} concentration is ${largestClass.percent}%.`,
      severity: largestClass.percent >= 85 ? "high" : "warning",
    });
  }

  if (truth.readinessLevel === "unauthenticated" || truth.readinessLevel === "unavailable") {
    warnings.push({
      code: "truth-readiness",
      message: `Portfolio Truth readiness is ${truth.readinessLevel}.`,
      severity: "warning",
    });
  }

  return warnings;
}

export function buildLegacyPortfolioRiskSummary(
  truth: PortfolioTruthReadback | null,
): LegacyPortfolioRiskSummary {
  const generatedAt = new Date().toISOString();

  if (!truth) {
    return {
      assetClassExposure: [],
      criticalDrivers: ["Portfolio Truth Layer is unavailable."],
      currencyExposure: [],
      dataQuality: { sourceStatus: "insufficient_data", warningCount: 1 },
      generatedAt,
      positionCount: 0,
      riskLevel: "insufficient_data",
      riskScore: null,
      singleNameConcentration: null,
      sourceStatus: "unavailable",
      totalKnownNotional: null,
      warnings: [
        {
          code: "truth-unavailable",
          message: "Portfolio Truth Layer could not be read.",
          severity: "warning",
        },
      ],
    };
  }

  const assetClassExposure = buildAssetClassExposure(truth);
  const singleNameConcentration = buildSingleNameConcentration(truth);
  const currencyExposure = buildCurrencyExposure(truth);
  const warnings = buildWarnings(truth, assetClassExposure);
  const concentrationImpact = singleNameConcentration?.percentOfPositions
    ? Math.min(35, singleNameConcentration.percentOfPositions * 0.5)
    : 0;
  const assetClassImpact = Math.max(
    0,
    ...assetClassExposure.map((bucket) => (bucket.percent !== null && bucket.percent >= 50 ? bucket.percent * 0.35 : 0)),
  );
  const dataQualityImpact =
    truth.readinessLevel === "ready" ? 0 : truth.readinessLevel === "partial" ? 12 : 22;
  const warningImpact = Math.min(18, warnings.length * 5);
  const hasUsableData = truth.counts.totalAssets > 0 || truth.counts.totalPendingInputs > 0;
  const riskScore = hasUsableData
    ? Math.min(100, Math.round(concentrationImpact + assetClassImpact + dataQualityImpact + warningImpact))
    : null;
  const criticalDrivers = [
    singleNameConcentration
      ? `Top symbol ${singleNameConcentration.symbol} appears ${singleNameConcentration.occurrenceCount} time(s).`
      : null,
    ...warnings.slice(0, 3).map((warning) => warning.message),
  ].filter((item): item is string => Boolean(item));

  return {
    assetClassExposure,
    criticalDrivers,
    currencyExposure,
    dataQuality: {
      sourceStatus: truth.readinessLevel === "ready" ? "complete" : truth.readinessLevel === "partial" ? "partial" : "insufficient_data",
      warningCount: warnings.length,
    },
    generatedAt,
    positionCount: truth.counts.totalAssets + truth.counts.totalPendingInputs,
    riskLevel: scoreToLevel(riskScore),
    riskScore,
    singleNameConcentration,
    sourceStatus:
      truth.readinessLevel === "ready"
        ? "ready"
        : truth.readinessLevel === "partial"
          ? "partial"
          : truth.readinessLevel === "unauthenticated"
            ? "fallback"
            : "insufficient_data",
    totalKnownNotional:
      truth.amounts.totalKnownNotional > 0 ? roundMetric(truth.amounts.totalKnownNotional, 2) : null,
    warnings,
  };
}

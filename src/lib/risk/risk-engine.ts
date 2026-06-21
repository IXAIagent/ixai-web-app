import type {
  PortfolioValuationResult,
  ValuationSourceStatus,
} from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import type {
  PortfolioRiskResult,
  RiskCategory,
  RiskLevel,
  RiskScoreBreakdown,
  RiskSignal,
  RiskSignalSeverity,
} from "@/src/lib/risk/risk-engine-types";

const DISCLAIMER =
  "Risk Engine v1 is informational and monitoring-only. It does not provide investment recommendations, buy/sell instructions, order execution, auto trading, target prices, or return promises.";

const SEVERITY_ORDER: Record<RiskSignalSeverity, number> = {
  critical: 4,
  high: 3,
  warning: 2,
  info: 1,
};

function isUsefulValuation(valuation: PortfolioValuationResult) {
  return valuation.summary.positionCount > 0 && valuation.positions.length > 0;
}

function createSignal(input: {
  affectedAssetClass?: RiskSignal["affectedAssetClass"];
  affectedSymbols?: string[];
  category: RiskCategory;
  id: string;
  message: string;
  scoreImpact: number;
  severity: RiskSignalSeverity;
  sourceStatus?: ValuationSourceStatus;
  title: string;
}): RiskSignal {
  const signal: RiskSignal = {
    affectedSymbols: input.affectedSymbols ?? [],
    category: input.category,
    createdAt: new Date().toISOString(),
    id: input.id,
    message: input.message,
    scoreImpact: input.scoreImpact,
    severity: input.severity,
    sourceStatus: input.sourceStatus ?? "partial",
    title: input.title,
  };

  if (input.affectedAssetClass) {
    signal.affectedAssetClass = input.affectedAssetClass;
  }

  return signal;
}

export function calculateRiskLevel(score: number | null): RiskLevel {
  if (score === null) {
    return "unavailable";
  }

  if (score >= 75) {
    return "critical";
  }

  if (score >= 50) {
    return "high";
  }

  if (score >= 25) {
    return "medium";
  }

  return "low";
}

export function detectConcentrationRisk(
  valuation: PortfolioValuationResult,
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const topPosition = valuation.positions
    .filter((position) => position.allocationPercent > 0)
    .toSorted((left, right) => right.allocationPercent - left.allocationPercent)[0];

  if (topPosition && topPosition.allocationPercent >= 60) {
    signals.push(
      createSignal({
        affectedAssetClass: topPosition.assetClass,
        affectedSymbols: [topPosition.symbol],
        category: "concentration",
        id: `concentration-position-critical-${topPosition.id}`,
        message: `${topPosition.symbol} represents ${topPosition.allocationPercent.toFixed(1)}% of estimated portfolio value.`,
        scoreImpact: 35,
        severity: "critical",
        sourceStatus: topPosition.sourceStatus,
        title: "Single position concentration is critical",
      }),
    );
  } else if (topPosition && topPosition.allocationPercent >= 40) {
    signals.push(
      createSignal({
        affectedAssetClass: topPosition.assetClass,
        affectedSymbols: [topPosition.symbol],
        category: "concentration",
        id: `concentration-position-high-${topPosition.id}`,
        message: `${topPosition.symbol} represents ${topPosition.allocationPercent.toFixed(1)}% of estimated portfolio value.`,
        scoreImpact: 25,
        severity: "high",
        sourceStatus: topPosition.sourceStatus,
        title: "Single position concentration is high",
      }),
    );
  }

  return signals;
}

export function detectAssetAllocationRisk(
  valuation: PortfolioValuationResult,
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const topAssetClass = valuation.summary.assetAllocation
    .filter((item) => item.allocationPercent > 0)
    .toSorted((left, right) => right.allocationPercent - left.allocationPercent)[0];

  if (!topAssetClass) {
    return signals;
  }

  if (topAssetClass.allocationPercent >= 70) {
    signals.push(
      createSignal({
        affectedAssetClass: topAssetClass.assetClass,
        category: "asset_allocation",
        id: `allocation-high-${topAssetClass.assetClass}`,
        message: `${topAssetClass.assetClass} represents ${topAssetClass.allocationPercent.toFixed(1)}% of estimated portfolio value.`,
        scoreImpact: 20,
        severity: "high",
        sourceStatus: topAssetClass.sourceStatus,
        title: "Asset class allocation is highly concentrated",
      }),
    );
  } else if (topAssetClass.allocationPercent >= 50) {
    signals.push(
      createSignal({
        affectedAssetClass: topAssetClass.assetClass,
        category: "asset_allocation",
        id: `allocation-warning-${topAssetClass.assetClass}`,
        message: `${topAssetClass.assetClass} represents ${topAssetClass.allocationPercent.toFixed(1)}% of estimated portfolio value.`,
        scoreImpact: 12,
        severity: "warning",
        sourceStatus: topAssetClass.sourceStatus,
        title: "Asset class allocation is concentrated",
      }),
    );
  }

  return signals;
}

export function detectCryptoExposureRisk(
  valuation: PortfolioValuationResult,
): RiskSignal[] {
  const crypto = valuation.summary.assetAllocation.find(
    (item) => item.assetClass === "crypto",
  );

  if (!crypto || crypto.allocationPercent < 25) {
    return [];
  }

  if (crypto.allocationPercent >= 60) {
    return [
      createSignal({
        affectedAssetClass: "crypto",
        category: "crypto_exposure",
        id: "crypto-exposure-critical",
        message: `Crypto represents ${crypto.allocationPercent.toFixed(1)}% of estimated portfolio value.`,
        scoreImpact: 30,
        severity: "critical",
        sourceStatus: crypto.sourceStatus,
        title: "Crypto exposure is critical",
      }),
    ];
  }

  if (crypto.allocationPercent >= 40) {
    return [
      createSignal({
        affectedAssetClass: "crypto",
        category: "crypto_exposure",
        id: "crypto-exposure-high",
        message: `Crypto represents ${crypto.allocationPercent.toFixed(1)}% of estimated portfolio value.`,
        scoreImpact: 22,
        severity: "high",
        sourceStatus: crypto.sourceStatus,
        title: "Crypto exposure is high",
      }),
    ];
  }

  return [
    createSignal({
      affectedAssetClass: "crypto",
      category: "crypto_exposure",
      id: "crypto-exposure-warning",
      message: `Crypto represents ${crypto.allocationPercent.toFixed(1)}% of estimated portfolio value.`,
      scoreImpact: 12,
      severity: "warning",
      sourceStatus: crypto.sourceStatus,
      title: "Crypto exposure should be monitored",
    }),
  ];
}

export function detectMarketDataRisk(
  valuation: PortfolioValuationResult,
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const { pricedPositionCount, sourceStatus, unpricedPositionCount } = valuation.summary;

  if (sourceStatus === "unavailable") {
    signals.push(
      createSignal({
        category: "data_quality",
        id: "valuation-source-unavailable",
        message: "Portfolio valuation source status is unavailable.",
        scoreImpact: 30,
        severity: "critical",
        sourceStatus: "unavailable",
        title: "Valuation source unavailable",
      }),
    );
  }

  if (unpricedPositionCount > 0) {
    signals.push(
      createSignal({
        affectedSymbols: valuation.positions
          .filter((position) => position.sourceStatus === "unavailable")
          .map((position) => position.symbol),
        category: "market_data",
        id:
          unpricedPositionCount >= pricedPositionCount
            ? "unpriced-positions-high"
            : "unpriced-positions-warning",
        message: `${unpricedPositionCount} position(s) are unpriced in the current valuation readback.`,
        scoreImpact: unpricedPositionCount >= pricedPositionCount ? 20 : 10,
        severity: unpricedPositionCount >= pricedPositionCount ? "high" : "warning",
        sourceStatus: sourceStatus === "unavailable" ? "unavailable" : "partial",
        title:
          unpricedPositionCount >= pricedPositionCount
            ? "Most valuation inputs are unpriced"
            : "Some positions are unpriced",
      }),
    );
  }

  return signals;
}

export function detectFcnPlaceholderRisk(
  valuation: PortfolioValuationResult,
): RiskSignal[] {
  const fcnAllocation = valuation.summary.assetAllocation.find(
    (item) => item.assetClass === "fcn",
  );
  const fcnPositions = valuation.positions.filter(
    (position) => position.assetClass === "fcn",
  );

  if (fcnPositions.length === 0) {
    return [];
  }

  return [
    createSignal({
      affectedAssetClass: "fcn",
      affectedSymbols: fcnPositions.map((position) => position.symbol),
      category: "fcn_placeholder",
      id: "fcn-placeholder-valuation",
      message:
        "FCN positions currently use notional placeholder valuation. FCN pricing engine and live underlying KI/KO monitoring are not implemented in v4.40.",
      scoreImpact: (fcnAllocation?.allocationPercent ?? 0) >= 40 ? 10 : 4,
      severity: (fcnAllocation?.allocationPercent ?? 0) >= 40 ? "warning" : "info",
      sourceStatus: fcnAllocation?.sourceStatus ?? "fallback",
      title: "FCN valuation is placeholder-based",
    }),
  ];
}

const CATEGORY_LABEL: Record<RiskCategory, string> = {
  asset_allocation: "Asset Allocation",
  concentration: "Concentration",
  crypto_exposure: "Crypto Exposure",
  data_quality: "Data Quality",
  fcn_placeholder: "FCN Placeholder",
  market_data: "Market Data",
  unknown: "Unknown",
};

export function buildScoreBreakdown(signals: RiskSignal[]): RiskScoreBreakdown[] {
  const groups = new Map<RiskCategory, RiskSignal[]>();

  signals.forEach((signal) => {
    const current = groups.get(signal.category) ?? [];
    current.push(signal);
    groups.set(signal.category, current);
  });

  return Array.from(groups.entries())
    .map(([category, group]) => ({
      category,
      label: CATEGORY_LABEL[category],
      scoreImpact: group.reduce((total, signal) => total + signal.scoreImpact, 0),
      signalCount: group.length,
    }))
    .sort((left, right) => {
      if (right.scoreImpact !== left.scoreImpact) {
        return right.scoreImpact - left.scoreImpact;
      }

      return left.label.localeCompare(right.label);
    });
}

function getTopSignals(signals: RiskSignal[]) {
  return signals
    .toSorted((left, right) => {
      const severityDiff = SEVERITY_ORDER[right.severity] - SEVERITY_ORDER[left.severity];

      if (severityDiff !== 0) {
        return severityDiff;
      }

      if (right.scoreImpact !== left.scoreImpact) {
        return right.scoreImpact - left.scoreImpact;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, 5);
}

function combineSourceStatus(
  valuation: PortfolioValuationResult,
  signals: RiskSignal[],
): ValuationSourceStatus {
  if (signals.some((signal) => signal.sourceStatus === "unavailable")) {
    return "partial";
  }

  return valuation.summary.sourceStatus;
}

export function buildPortfolioRiskSummary(
  valuation: PortfolioValuationResult,
): PortfolioRiskResult {
  if (!isUsefulValuation(valuation)) {
    const signal = createSignal({
      category: "data_quality",
      id: "risk-engine-no-valuation-data",
      message: "No useful portfolio valuation data is available for Risk Engine v1.",
      scoreImpact: 0,
      severity: "info",
      sourceStatus: "unavailable",
      title: "Risk readback unavailable",
    });

    return {
      signals: [signal],
      summary: {
        criticalSignalCount: 0,
        highSignalCount: 0,
        informationalOnlyDisclaimer: DISCLAIMER,
        riskLevel: "unavailable",
        riskScore: null,
        scoreBreakdown: buildScoreBreakdown([signal]),
        signalCount: 1,
        sourceStatus: "unavailable",
        topSignals: [signal],
        updatedAt: new Date().toISOString(),
        warningSignalCount: 0,
      },
    };
  }

  const signals = [
    ...detectConcentrationRisk(valuation),
    ...detectAssetAllocationRisk(valuation),
    ...detectCryptoExposureRisk(valuation),
    ...detectMarketDataRisk(valuation),
    ...detectFcnPlaceholderRisk(valuation),
  ];
  const riskScore = Math.min(
    100,
    signals.reduce((total, signal) => total + signal.scoreImpact, 0),
  );

  return {
    signals,
    summary: {
      criticalSignalCount: signals.filter((signal) => signal.severity === "critical").length,
      highSignalCount: signals.filter((signal) => signal.severity === "high").length,
      informationalOnlyDisclaimer: DISCLAIMER,
      riskLevel: calculateRiskLevel(riskScore),
      riskScore,
      scoreBreakdown: buildScoreBreakdown(signals),
      signalCount: signals.length,
      sourceStatus: combineSourceStatus(valuation, signals),
      topSignals: getTopSignals(signals),
      updatedAt: new Date().toISOString(),
      warningSignalCount: signals.filter((signal) => signal.severity === "warning").length,
    },
  };
}

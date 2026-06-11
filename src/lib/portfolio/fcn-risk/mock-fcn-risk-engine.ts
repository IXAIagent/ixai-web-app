import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioFCNRiskEngine } from "@/src/lib/portfolio/fcn-risk/fcn-risk-engine";
import type {
  PortfolioFCNRiskAlert,
  PortfolioFCNRiskInput,
  PortfolioFCNRiskLevel,
  PortfolioFCNRiskPosition,
  PortfolioFCNRiskReport,
} from "@/src/lib/portfolio/fcn-risk/fcn-risk-types";

const GENERATED_AT = "2026-06-11T00:00:00.000Z";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function riskLevelFromScore(score: number): PortfolioFCNRiskLevel {
  if (score >= 80) {
    return "CRITICAL";
  }

  if (score >= 60) {
    return "HIGH";
  }

  if (score >= 35) {
    return "MEDIUM";
  }

  return "LOW";
}

function normalizeSymbol(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9.-]/gu, "");
}

function readUnderlyingSymbols(asset: PortfolioAsset) {
  const underlyings = asset.metadata?.underlyings;

  if (!Array.isArray(underlyings)) {
    return [];
  }

  return underlyings
    .map((underlying) => (typeof underlying === "string" ? normalizeSymbol(underlying) : ""))
    .filter(Boolean);
}

function isFcnAsset(asset: PortfolioAsset) {
  return asset.category === "FCN" || readUnderlyingSymbols(asset).length > 0;
}

function buildFcnPosition(asset: PortfolioAsset): PortfolioFCNRiskPosition {
  const underlyings = readUnderlyingSymbols(asset);

  return {
    assetId: asset.id,
    currency: asset.currency,
    name: asset.name,
    region: asset.region,
    symbol: asset.symbol,
    underlyingCount: underlyings.length,
    underlyings,
  };
}

function countRepeatedUnderlyings(positions: PortfolioFCNRiskPosition[]) {
  const counts = new Map<string, number>();

  for (const position of positions) {
    for (const underlying of position.underlyings) {
      counts.set(underlying, (counts.get(underlying) ?? 0) + 1);
    }
  }

  return Array.from(counts.values()).filter((count) => count > 1).length;
}

function countCorrelatedUnderlyings(input: {
  correlationReport: PortfolioFCNRiskInput["correlationReport"];
  underlyings: Set<string>;
}) {
  const correlated = new Set<string>();

  for (const pair of input.correlationReport.topCorrelationPairs) {
    if (pair.level !== "HIGH" && pair.level !== "CRITICAL") {
      continue;
    }

    const left = normalizeSymbol(pair.leftSymbol);
    const right = normalizeSymbol(pair.rightSymbol);

    if (input.underlyings.has(left)) {
      correlated.add(left);
    }

    if (input.underlyings.has(right)) {
      correlated.add(right);
    }
  }

  return correlated.size;
}

function findFcnExposurePct(exposureReport: PortfolioFCNRiskInput["exposureReport"]) {
  return exposureReport.assetTypeExposure.find((item) => item.key === "FCN")?.percentage ?? 0;
}

function findWorstUnderlyingConcentrationPct(
  concentrationReport: PortfolioFCNRiskInput["concentrationReport"],
) {
  return concentrationReport.topFcnUnderlying?.percentage ?? 0;
}

function findStressTestSensitivityPct(stressTestReport: PortfolioFCNRiskInput["stressTestReport"]) {
  const fcnStress = stressTestReport.results.find(
    (result) => result.stressTest.type === "FCN_WORST_OF_SHOCK",
  );

  if (fcnStress) {
    return Math.abs(fcnStress.estimatedImpactPct);
  }

  return Math.abs(stressTestReport.worstStressTest?.estimatedImpactPct ?? 0);
}

function buildRiskScore(input: {
  correlatedUnderlyingCount: number;
  fcnCount: number;
  fcnExposurePct: number;
  providerCount: number;
  regionCount: number;
  repeatedUnderlyingCount: number;
  stressTestSensitivityPct: number;
  underlyingCount: number;
  worstUnderlyingConcentrationPct: number;
}) {
  const fcnCountRisk = Math.min(input.fcnCount * 8, 24);
  const exposureRisk = Math.min(input.fcnExposurePct * 0.55, 28);
  const repeatedRisk = Math.min(input.repeatedUnderlyingCount * 10, 22);
  const concentrationRisk = Math.min(input.worstUnderlyingConcentrationPct * 0.45, 22);
  const correlationRisk = Math.min(input.correlatedUnderlyingCount * 7, 21);
  const stressRisk = Math.min(input.stressTestSensitivityPct * 0.8, 24);
  const regionDiversificationCredit = Math.min(Math.max(input.regionCount - 1, 0) * 4, 12);
  const providerDiversificationCredit = Math.min(Math.max(input.providerCount - 1, 0) * 3, 9);
  const underlyingDiversificationCredit = Math.min(Math.max(input.underlyingCount - 3, 0) * 2, 10);

  return clampScore(
    fcnCountRisk +
      exposureRisk +
      repeatedRisk +
      concentrationRisk +
      correlationRisk +
      stressRisk -
      regionDiversificationCredit -
      providerDiversificationCredit -
      underlyingDiversificationCredit,
  );
}

function buildAlerts(input: {
  correlatedUnderlyingCount: number;
  fcnExposurePct: number;
  fcnRiskLevel: PortfolioFCNRiskLevel;
  repeatedUnderlyingCount: number;
  stressTestSensitivityPct: number;
  worstUnderlyingConcentrationPct: number;
}) {
  const alerts: PortfolioFCNRiskAlert[] = [];

  if (input.fcnExposurePct >= 35) {
    alerts.push({
      description: "FCN exposure is a meaningful share of the deterministic mock portfolio.",
      id: "high-fcn-exposure",
      level: input.fcnRiskLevel,
      title: "High FCN Exposure",
    });
  }

  if (input.repeatedUnderlyingCount > 0) {
    alerts.push({
      description: "One or more FCN underlyings appear across multiple structured-product positions.",
      id: "repeated-underlying-exposure",
      level: input.repeatedUnderlyingCount >= 3 ? "HIGH" : "MEDIUM",
      title: "Repeated Underlying Exposure",
    });
  }

  if (input.worstUnderlyingConcentrationPct >= 20) {
    alerts.push({
      description: "The largest FCN underlying concentration is elevated in the current mock exposure report.",
      id: "fcn-concentration-risk",
      level: input.worstUnderlyingConcentrationPct >= 35 ? "HIGH" : "MEDIUM",
      title: "FCN Concentration Risk",
    });
  }

  if (input.correlatedUnderlyingCount > 0) {
    alerts.push({
      description: "FCN underlyings overlap with high-correlation pairs in the deterministic correlation report.",
      id: "fcn-correlation-risk",
      level: input.correlatedUnderlyingCount >= 3 ? "HIGH" : "MEDIUM",
      title: "FCN Correlation Risk",
    });
  }

  if (input.stressTestSensitivityPct >= 10) {
    alerts.push({
      description: "FCN stress-test sensitivity is elevated under the deterministic mock stress-test library.",
      id: "fcn-stress-test-sensitivity",
      level: input.stressTestSensitivityPct >= 20 ? "HIGH" : "MEDIUM",
      title: "FCN Stress-Test Sensitivity",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      description: "No elevated FCN-specific concentration, correlation, or stress-test alert is generated.",
      id: "fcn-risk-stable",
      level: "LOW",
      title: "FCN Risk Stable",
    });
  }

  return alerts;
}

function buildSummary(input: {
  fcnCount: number;
  fcnRiskLevel: PortfolioFCNRiskLevel;
  fcnRiskScore: number;
  repeatedUnderlyingCount: number;
  stressTestSensitivityPct: number;
  underlyingCount: number;
}) {
  if (input.fcnCount === 0) {
    return "Portfolio FCN Risk Engine is enabled, but no FCN assets are currently identified. Monitoring and risk-awareness only.";
  }

  return `Portfolio FCN risk level is ${input.fcnRiskLevel} with score ${input.fcnRiskScore}. ${input.underlyingCount} unique underlyings are monitored, ${input.repeatedUnderlyingCount} repeated underlyings are detected, and FCN stress-test sensitivity is ${input.stressTestSensitivityPct.toFixed(
    1,
  )}%. Monitoring and risk-awareness only.`;
}

export const mockPortfolioFCNRiskEngine: PortfolioFCNRiskEngine = {
  async generateFCNRisk(input: PortfolioFCNRiskInput): Promise<PortfolioFCNRiskReport> {
    const positions = input.assets.filter(isFcnAsset).map(buildFcnPosition);
    const underlyings = new Set(positions.flatMap((position) => position.underlyings));
    const regionCount = new Set(positions.map((position) => position.region).filter(Boolean)).size;
    const providerCount = input.exposureReport.providerExposure.length;
    const fcnCount = positions.length;
    const fcnExposurePct = findFcnExposurePct(input.exposureReport);
    const underlyingCount = underlyings.size;
    const repeatedUnderlyingCount = countRepeatedUnderlyings(positions);
    const correlatedUnderlyingCount = countCorrelatedUnderlyings({
      correlationReport: input.correlationReport,
      underlyings,
    });
    const worstUnderlyingConcentrationPct = findWorstUnderlyingConcentrationPct(
      input.concentrationReport,
    );
    const stressTestSensitivityPct = findStressTestSensitivityPct(input.stressTestReport);
    const fcnRiskScore = buildRiskScore({
      correlatedUnderlyingCount,
      fcnCount,
      fcnExposurePct,
      providerCount,
      regionCount,
      repeatedUnderlyingCount,
      stressTestSensitivityPct,
      underlyingCount,
      worstUnderlyingConcentrationPct,
    });
    const fcnRiskLevel = riskLevelFromScore(fcnRiskScore);
    const alerts = buildAlerts({
      correlatedUnderlyingCount,
      fcnExposurePct,
      fcnRiskLevel,
      repeatedUnderlyingCount,
      stressTestSensitivityPct,
      worstUnderlyingConcentrationPct,
    });

    return {
      alerts,
      correlatedUnderlyingCount,
      fcnCount,
      fcnExposurePct,
      fcnRiskLevel,
      fcnRiskScore,
      generatedAt: GENERATED_AT,
      id: "mock-portfolio-fcn-risk-report-v2-10",
      positions,
      repeatedUnderlyingCount,
      stressTestSensitivityPct,
      summary: buildSummary({
        fcnCount,
        fcnRiskLevel,
        fcnRiskScore,
        repeatedUnderlyingCount,
        stressTestSensitivityPct,
        underlyingCount,
      }),
      underlyingCount,
      worstUnderlyingConcentrationPct,
    };
  },
};

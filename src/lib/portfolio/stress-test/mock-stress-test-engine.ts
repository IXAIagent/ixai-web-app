import type { PortfolioCorrelationPair } from "@/src/lib/portfolio/correlation/correlation-types";
import type { PortfolioExposureItem } from "@/src/lib/portfolio/exposure/exposure-types";
import type { PortfolioStressTestEngine } from "@/src/lib/portfolio/stress-test/stress-test-engine";
import type {
  PortfolioStressTestCase,
  PortfolioStressTestInput,
  PortfolioStressTestLevel,
  PortfolioStressTestReport,
  PortfolioStressTestResult,
} from "@/src/lib/portfolio/stress-test/stress-test-types";

const GENERATED_AT = "2026-06-11T00:00:00.000Z";

const STRESS_TESTS: PortfolioStressTestCase[] = [
  {
    assumption: "Equity exposures -30%",
    id: "global-equity-shock",
    name: "Global Equity Shock",
    shockPercent: -30,
    type: "GLOBAL_EQUITY_SHOCK",
  },
  {
    assumption: "Crypto / Grid / Dual exposures -50%",
    id: "crypto-crash",
    name: "Crypto Crash",
    shockPercent: -50,
    type: "CRYPTO_CRASH",
  },
  {
    assumption: "FCN underlyings -35%",
    id: "fcn-worst-of-shock",
    name: "FCN Worst-of Shock",
    shockPercent: -35,
    type: "FCN_WORST_OF_SHOCK",
  },
  {
    assumption: "Highly correlated exposure pairs -25%",
    id: "high-correlation-shock",
    name: "High Correlation Shock",
    shockPercent: -25,
    type: "HIGH_CORRELATION_SHOCK",
  },
  {
    assumption: "Largest symbol exposure -40%",
    id: "concentration-breakdown",
    name: "Concentration Breakdown",
    shockPercent: -40,
    type: "CONCENTRATION_BREAKDOWN",
  },
  {
    assumption: "Largest region exposure -35%",
    id: "regional-crisis",
    name: "Regional Crisis",
    shockPercent: -35,
    type: "REGIONAL_CRISIS",
  },
];

function stressLevelFromImpact(impactPct: number): PortfolioStressTestLevel {
  const absoluteImpact = Math.abs(impactPct);

  if (absoluteImpact >= 25) {
    return "CRITICAL";
  }

  if (absoluteImpact >= 15) {
    return "HIGH";
  }

  if (absoluteImpact >= 7) {
    return "MEDIUM";
  }

  return "LOW";
}

function stressLevelScore(level: PortfolioStressTestLevel) {
  return {
    CRITICAL: 4,
    HIGH: 3,
    LOW: 1,
    MEDIUM: 2,
  }[level];
}

function highestStressLevel(levels: PortfolioStressTestLevel[]) {
  return levels.reduce<PortfolioStressTestLevel>(
    (highest, level) => (stressLevelScore(level) > stressLevelScore(highest) ? level : highest),
    "LOW",
  );
}

function normalizeSymbol(value: string) {
  return value.trim().toUpperCase();
}

function sortByExposure(items: PortfolioExposureItem[]) {
  return [...items].sort(
    (left, right) => right.percentage - left.percentage || left.label.localeCompare(right.label),
  );
}

function uniqueExposureItems(items: PortfolioExposureItem[]) {
  const seen = new Set<string>();
  const unique: PortfolioExposureItem[] = [];

  for (const item of items) {
    const key = `${item.category}:${item.key}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(item);
  }

  return unique;
}

function exposureLabels(items: PortfolioExposureItem[]) {
  return Array.from(new Set(items.map((item) => item.label).filter(Boolean)));
}

function stressImpact(input: {
  affectedItems: PortfolioExposureItem[];
  stressTest: PortfolioStressTestCase;
  totalMarketValue: number;
}) {
  const affectedMarketValue = input.affectedItems.reduce(
    (total, item) => total + Math.max(0, item.marketValue),
    0,
  );
  const estimatedImpactValue = affectedMarketValue * (input.stressTest.shockPercent / 100);
  const estimatedImpactPct =
    input.totalMarketValue > 0 ? (estimatedImpactValue / input.totalMarketValue) * 100 : 0;
  const level = stressLevelFromImpact(estimatedImpactPct);

  return {
    estimatedImpactPct,
    estimatedImpactValue,
    level,
  };
}

function buildResult(input: {
  affectedItems: PortfolioExposureItem[];
  stressTest: PortfolioStressTestCase;
  target: string;
  totalMarketValue: number;
}): PortfolioStressTestResult {
  const impact = stressImpact({
    affectedItems: input.affectedItems,
    stressTest: input.stressTest,
    totalMarketValue: input.totalMarketValue,
  });

  return {
    affectedExposure: exposureLabels(input.affectedItems),
    estimatedImpactPct: impact.estimatedImpactPct,
    estimatedImpactValue: impact.estimatedImpactValue,
    level: impact.level,
    stressTest: input.stressTest,
    summary: `${input.stressTest.name} applies ${input.stressTest.assumption} to ${input.target}. Estimated mock stress impact is ${impact.estimatedImpactPct.toFixed(
      1,
    )}% of portfolio value. Monitoring and risk-awareness only.`,
  };
}

function findGlobalEquityExposure(input: PortfolioStressTestInput) {
  const equitySymbols = input.exposureReport.symbolExposure.filter(
    (item) => item.category === "asset_type",
  );
  const equityAssetTypes = input.exposureReport.assetTypeExposure.filter((item) =>
    ["STOCK", "FCN"].includes(item.key),
  );

  return equitySymbols.length > 0 ? equitySymbols : equityAssetTypes;
}

function findCryptoExposure(input: PortfolioStressTestInput) {
  const cryptoSymbols = input.exposureReport.symbolExposure.filter(
    (item) => item.category === "crypto",
  );
  const cryptoAssetTypes = input.exposureReport.assetTypeExposure.filter((item) =>
    ["CRYPTO", "DUAL", "GRID"].includes(item.key),
  );

  return cryptoSymbols.length > 0 ? cryptoSymbols : cryptoAssetTypes;
}

function findFcnUnderlyingExposure(input: PortfolioStressTestInput) {
  const fcnUnderlyings = input.exposureReport.symbolExposure.filter(
    (item) => item.category === "fcn_underlying",
  );

  if (fcnUnderlyings.length > 0) {
    return fcnUnderlyings;
  }

  return input.exposureReport.assetTypeExposure.filter((item) => item.key === "FCN");
}

function findPairExposure(input: {
  pair: PortfolioCorrelationPair;
  symbolExposure: PortfolioExposureItem[];
}) {
  const symbols = new Set([
    normalizeSymbol(input.pair.leftSymbol),
    normalizeSymbol(input.pair.rightSymbol),
  ]);

  return input.symbolExposure.filter((item) => symbols.has(normalizeSymbol(item.key || item.label)));
}

function findHighCorrelationExposure(input: PortfolioStressTestInput) {
  const highPairs = input.correlationReport.topCorrelationPairs.filter(
    (pair) => pair.level === "HIGH" || pair.level === "CRITICAL",
  );
  const items = highPairs.flatMap((pair) =>
    findPairExposure({
      pair,
      symbolExposure: input.exposureReport.symbolExposure,
    }),
  );

  return uniqueExposureItems(items);
}

function findLargestSymbolExposure(input: PortfolioStressTestInput) {
  const topSymbol = input.concentrationReport.topSymbol;

  if (topSymbol) {
    return input.exposureReport.symbolExposure.filter((item) => item.key === topSymbol.key);
  }

  return sortByExposure(input.exposureReport.symbolExposure).slice(0, 1);
}

function findLargestRegionExposure(input: PortfolioStressTestInput) {
  return sortByExposure(input.exposureReport.regionExposure).slice(0, 1);
}

function affectedItemsForStressTest(input: {
  reportInput: PortfolioStressTestInput;
  stressTest: PortfolioStressTestCase;
}) {
  switch (input.stressTest.type) {
    case "GLOBAL_EQUITY_SHOCK":
      return {
        items: findGlobalEquityExposure(input.reportInput),
        target: "global equity-linked exposures",
      };
    case "CRYPTO_CRASH":
      return {
        items: findCryptoExposure(input.reportInput),
        target: "crypto, grid, and dual exposures",
      };
    case "FCN_WORST_OF_SHOCK":
      return {
        items: findFcnUnderlyingExposure(input.reportInput),
        target: "FCN underlyings and structured-product exposure",
      };
    case "HIGH_CORRELATION_SHOCK":
      return {
        items: findHighCorrelationExposure(input.reportInput),
        target: "high-correlation exposure pairs",
      };
    case "CONCENTRATION_BREAKDOWN": {
      const items = findLargestSymbolExposure(input.reportInput);
      return {
        items,
        target: items[0]?.label ?? "largest symbol exposure",
      };
    }
    case "REGIONAL_CRISIS": {
      const items = findLargestRegionExposure(input.reportInput);
      return {
        items,
        target: items[0]?.label ?? "largest region exposure",
      };
    }
  }
}

function buildCapitalPreservationWarning(input: {
  stressRiskLevel: PortfolioStressTestLevel;
  worstStressTest: PortfolioStressTestResult | null;
}) {
  if (!input.worstStressTest) {
    return "No stress-test warning is generated by the deterministic mock engine.";
  }

  if (input.stressRiskLevel === "CRITICAL" || input.stressRiskLevel === "HIGH") {
    return `${input.worstStressTest.stressTest.name} indicates elevated capital-preservation pressure in the deterministic mock stress test.`;
  }

  return "Capital-preservation warning remains low in the deterministic mock stress test.";
}

function buildAlerts(input: {
  scenarioRiskLevel: string;
  stressRiskLevel: PortfolioStressTestLevel;
  worstStressTest: PortfolioStressTestResult | null;
}) {
  const alerts: string[] = [];

  if (input.stressRiskLevel === "HIGH" || input.stressRiskLevel === "CRITICAL") {
    alerts.push(
      `Stress risk level is ${input.stressRiskLevel.toLowerCase()} in the deterministic mock engine.`,
    );
  }

  if (input.worstStressTest) {
    alerts.push(`${input.worstStressTest.stressTest.name} is the largest mock stress impact.`);
  }

  if (input.scenarioRiskLevel === "HIGH" || input.scenarioRiskLevel === "CRITICAL") {
    alerts.push("Scenario context is elevated and should be reviewed with stress-test output.");
  }

  return alerts;
}

function buildSummary(input: {
  stressRiskLevel: PortfolioStressTestLevel;
  worstStressTest: PortfolioStressTestResult | null;
}) {
  if (!input.worstStressTest) {
    return "Portfolio Stress Test Engine is enabled, but no stress-test result is currently available.";
  }

  return `Stress risk level is ${input.stressRiskLevel}. Worst mock stress test is ${input.worstStressTest.stressTest.name} with estimated impact ${input.worstStressTest.estimatedImpactPct.toFixed(
    1,
  )}%. Monitoring and risk-awareness only.`;
}

export const mockPortfolioStressTestEngine: PortfolioStressTestEngine = {
  async runStressTest(input: PortfolioStressTestInput): Promise<PortfolioStressTestReport> {
    const totalMarketValue = input.valuationReport.valuation.totalMarketValue;
    const results = STRESS_TESTS.map((stressTest) => {
      const affected = affectedItemsForStressTest({
        reportInput: input,
        stressTest,
      });

      return buildResult({
        affectedItems: affected.items,
        stressTest,
        target: affected.target,
        totalMarketValue,
      });
    }).sort(
      (left, right) =>
        Math.abs(right.estimatedImpactPct) - Math.abs(left.estimatedImpactPct) ||
        left.stressTest.name.localeCompare(right.stressTest.name),
    );
    const levels = results.map((result) => result.level);
    const stressRiskLevel = highestStressLevel(levels);
    const averageStressImpactPct =
      results.length > 0
        ? results.reduce((total, result) => total + result.estimatedImpactPct, 0) /
          results.length
        : 0;
    const worstStressTest = results[0] ?? null;
    const capitalPreservationWarning = buildCapitalPreservationWarning({
      stressRiskLevel,
      worstStressTest,
    });
    const alerts = buildAlerts({
      scenarioRiskLevel: input.scenarioReport.scenarioRiskLevel,
      stressRiskLevel,
      worstStressTest,
    });

    return {
      alerts,
      averageStressImpactPct,
      capitalPreservationWarning,
      generatedAt: GENERATED_AT,
      id: "mock-portfolio-stress-test-report-v2-09",
      results,
      stressRiskLevel,
      summary: buildSummary({
        stressRiskLevel,
        worstStressTest,
      }),
      totalStressTests: results.length,
      worstStressTest,
    };
  },
};

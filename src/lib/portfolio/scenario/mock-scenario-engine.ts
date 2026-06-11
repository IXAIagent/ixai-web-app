import type { PortfolioExposureItem } from "@/src/lib/portfolio/exposure/exposure-types";
import type { PortfolioScenarioEngine } from "@/src/lib/portfolio/scenario/scenario-engine";
import type {
  PortfolioScenario,
  PortfolioScenarioInput,
  PortfolioScenarioLevel,
  PortfolioScenarioReport,
  PortfolioScenarioResult,
} from "@/src/lib/portfolio/scenario/scenario-types";

const GENERATED_AT = "2026-06-11T00:00:00.000Z";
const TECHNOLOGY_SYMBOLS = new Set([
  "005930",
  "2330",
  "AAPL",
  "ADBE",
  "AMD",
  "ASML",
  "AVGO",
  "GOOGL",
  "META",
  "MDB",
  "MSFT",
  "NVDA",
  "ORCL",
  "PLTR",
  "TSLA",
  "TSM",
]);

const SCENARIOS: PortfolioScenario[] = [
  {
    assumption: "Technology Assets -20%",
    id: "technology-selloff",
    name: "Technology Selloff",
    shockPercent: -20,
    type: "TECHNOLOGY_SELLOFF",
  },
  {
    assumption: "Crypto Assets -30%",
    id: "crypto-correction",
    name: "Crypto Correction",
    shockPercent: -30,
    type: "CRYPTO_CORRECTION",
  },
  {
    assumption: "FCN Underlyings -15%",
    id: "fcn-underlying-stress",
    name: "FCN Underlying Stress",
    shockPercent: -15,
    type: "FCN_UNDERLYING_STRESS",
  },
  {
    assumption: "Largest Region Exposure -20%",
    id: "regional-shock",
    name: "Regional Shock",
    shockPercent: -20,
    type: "REGIONAL_SHOCK",
  },
  {
    assumption: "Largest Symbol Exposure -25%",
    id: "concentration-shock",
    name: "Concentration Shock",
    shockPercent: -25,
    type: "CONCENTRATION_SHOCK",
  },
];

function scenarioLevelFromImpact(impactPct: number): PortfolioScenarioLevel {
  const absoluteImpact = Math.abs(impactPct);

  if (absoluteImpact >= 20) {
    return "CRITICAL";
  }

  if (absoluteImpact >= 10) {
    return "HIGH";
  }

  if (absoluteImpact >= 5) {
    return "MEDIUM";
  }

  return "LOW";
}

function scenarioLevelScore(level: PortfolioScenarioLevel) {
  return {
    CRITICAL: 4,
    HIGH: 3,
    LOW: 1,
    MEDIUM: 2,
  }[level];
}

function highestScenarioLevel(levels: PortfolioScenarioLevel[]) {
  return levels.reduce<PortfolioScenarioLevel>(
    (highest, level) => (scenarioLevelScore(level) > scenarioLevelScore(highest) ? level : highest),
    "LOW",
  );
}

function sortByExposure(items: PortfolioExposureItem[]) {
  return [...items].sort(
    (left, right) => right.percentage - left.percentage || left.label.localeCompare(right.label),
  );
}

function normalizeSymbol(value: string) {
  return value.trim().toUpperCase();
}

function uniqueLabels(items: PortfolioExposureItem[]) {
  return Array.from(new Set(items.map((item) => item.label).filter(Boolean)));
}

function scenarioImpact(input: {
  affectedItems: PortfolioExposureItem[];
  scenario: PortfolioScenario;
  totalMarketValue: number;
}) {
  const affectedMarketValue = input.affectedItems.reduce(
    (total, item) => total + Math.max(0, item.marketValue),
    0,
  );
  const estimatedImpactValue = affectedMarketValue * (input.scenario.shockPercent / 100);
  const estimatedImpactPct =
    input.totalMarketValue > 0 ? (estimatedImpactValue / input.totalMarketValue) * 100 : 0;
  const level = scenarioLevelFromImpact(estimatedImpactPct);

  return {
    estimatedImpactPct,
    estimatedImpactValue,
    level,
  };
}

function buildResult(input: {
  affectedItems: PortfolioExposureItem[];
  scenario: PortfolioScenario;
  summaryTarget: string;
  totalMarketValue: number;
}): PortfolioScenarioResult {
  const impact = scenarioImpact({
    affectedItems: input.affectedItems,
    scenario: input.scenario,
    totalMarketValue: input.totalMarketValue,
  });

  return {
    affectedAssets: uniqueLabels(input.affectedItems),
    estimatedImpactPct: impact.estimatedImpactPct,
    estimatedImpactValue: impact.estimatedImpactValue,
    level: impact.level,
    scenario: input.scenario,
    summary: `${input.scenario.name} applies ${input.scenario.assumption} to ${input.summaryTarget}. Estimated mock impact is ${impact.estimatedImpactPct.toFixed(
      1,
    )}% of portfolio value. Monitoring and risk-awareness only.`,
  };
}

function findTechnologyItems(input: PortfolioScenarioInput) {
  return input.exposureReport.symbolExposure.filter((item) =>
    TECHNOLOGY_SYMBOLS.has(normalizeSymbol(item.key || item.label)),
  );
}

function findCryptoItems(input: PortfolioScenarioInput) {
  const cryptoSymbols = input.exposureReport.symbolExposure.filter(
    (item) => item.category === "crypto",
  );
  const cryptoAssetTypes = input.exposureReport.assetTypeExposure.filter((item) =>
    ["CRYPTO", "DUAL", "GRID"].includes(item.key),
  );

  return cryptoSymbols.length > 0 ? cryptoSymbols : cryptoAssetTypes;
}

function findFcnUnderlyingItems(input: PortfolioScenarioInput) {
  const fcnUnderlyings = input.exposureReport.symbolExposure.filter(
    (item) => item.category === "fcn_underlying",
  );

  if (fcnUnderlyings.length > 0) {
    return fcnUnderlyings;
  }

  return input.exposureReport.assetTypeExposure.filter((item) => item.key === "FCN");
}

function findLargestRegionItem(input: PortfolioScenarioInput) {
  return sortByExposure(input.exposureReport.regionExposure).slice(0, 1);
}

function findLargestSymbolItem(input: PortfolioScenarioInput) {
  const topSymbol = input.concentrationReport.topSymbol;

  if (topSymbol) {
    return input.exposureReport.symbolExposure.filter((item) => item.key === topSymbol.key);
  }

  return sortByExposure(input.exposureReport.symbolExposure).slice(0, 1);
}

function affectedItemsForScenario(input: {
  reportInput: PortfolioScenarioInput;
  scenario: PortfolioScenario;
}) {
  switch (input.scenario.type) {
    case "TECHNOLOGY_SELLOFF":
      return {
        items: findTechnologyItems(input.reportInput),
        target: "global technology-linked symbols",
      };
    case "CRYPTO_CORRECTION":
      return {
        items: findCryptoItems(input.reportInput),
        target: "crypto-linked assets",
      };
    case "FCN_UNDERLYING_STRESS":
      return {
        items: findFcnUnderlyingItems(input.reportInput),
        target: "FCN underlyings",
      };
    case "REGIONAL_SHOCK": {
      const items = findLargestRegionItem(input.reportInput);
      return {
        items,
        target: items[0]?.label ?? "largest region exposure",
      };
    }
    case "CONCENTRATION_SHOCK": {
      const items = findLargestSymbolItem(input.reportInput);
      return {
        items,
        target: items[0]?.label ?? "largest symbol exposure",
      };
    }
  }
}

function buildAlerts(input: {
  correlationLevel: string;
  results: PortfolioScenarioResult[];
  scenarioRiskLevel: PortfolioScenarioLevel;
}) {
  const alerts: string[] = [];
  const worstScenario = input.results[0];

  if (input.scenarioRiskLevel === "HIGH" || input.scenarioRiskLevel === "CRITICAL") {
    alerts.push(
      `Scenario risk level is ${input.scenarioRiskLevel.toLowerCase()} in the deterministic mock engine.`,
    );
  }

  if (worstScenario) {
    alerts.push(
      `${worstScenario.scenario.name} is currently the largest mock scenario impact.`,
    );
  }

  if (input.correlationLevel === "HIGH" || input.correlationLevel === "CRITICAL") {
    alerts.push("Correlation context is elevated and should be reviewed with scenario output.");
  }

  return alerts;
}

function buildSummary(input: {
  scenarioRiskLevel: PortfolioScenarioLevel;
  worstScenario: PortfolioScenarioResult | null;
}) {
  if (!input.worstScenario) {
    return "Portfolio Scenario Engine is enabled, but no scenario result is currently available.";
  }

  return `Scenario risk level is ${input.scenarioRiskLevel}. Worst mock scenario is ${input.worstScenario.scenario.name} with estimated impact ${input.worstScenario.estimatedImpactPct.toFixed(
    1,
  )}%. Monitoring and risk-awareness only.`;
}

export const mockPortfolioScenarioEngine: PortfolioScenarioEngine = {
  async runScenario(input: PortfolioScenarioInput): Promise<PortfolioScenarioReport> {
    const totalMarketValue = input.valuationReport.valuation.totalMarketValue;
    const results = SCENARIOS.map((scenario) => {
      const affected = affectedItemsForScenario({
        reportInput: input,
        scenario,
      });

      return buildResult({
        affectedItems: affected.items,
        scenario,
        summaryTarget: affected.target,
        totalMarketValue,
      });
    }).sort(
      (left, right) =>
        Math.abs(right.estimatedImpactPct) - Math.abs(left.estimatedImpactPct) ||
        left.scenario.name.localeCompare(right.scenario.name),
    );
    const levels = results.map((result) => result.level);
    const scenarioRiskLevel = highestScenarioLevel(levels);
    const averageImpactPct =
      results.length > 0
        ? results.reduce((total, result) => total + result.estimatedImpactPct, 0) /
          results.length
        : 0;
    const worstScenario = results[0] ?? null;
    const alerts = buildAlerts({
      correlationLevel: input.correlationReport.level,
      results,
      scenarioRiskLevel,
    });

    return {
      alerts,
      averageImpactPct,
      generatedAt: GENERATED_AT,
      id: "mock-portfolio-scenario-report-v2-08",
      results,
      scenarioRiskLevel,
      summary: buildSummary({
        scenarioRiskLevel,
        worstScenario,
      }),
      totalScenarios: results.length,
      worstScenario,
    };
  },
};

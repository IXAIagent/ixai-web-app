import type { PortfolioCorrelationEngine } from "@/src/lib/portfolio/correlation/correlation-engine";
import type {
  PortfolioCorrelationInput,
  PortfolioCorrelationLevel,
  PortfolioCorrelationPair,
  PortfolioCorrelationReport,
} from "@/src/lib/portfolio/correlation/correlation-types";

const GENERATED_AT = "2026-06-11T00:00:00.000Z";

const HIGH_CORRELATION_PAIRS = [
  ["TSLA", "NVDA"],
  ["TSLA", "PLTR"],
  ["NVDA", "AVGO"],
  ["MDB", "PLTR"],
  ["BTC", "ETH"],
] as const;

const MEDIUM_CORRELATION_PAIRS = [
  ["AAPL", "MSFT"],
  ["ORCL", "MSFT"],
  ["GOOGL", "META"],
] as const;

function normalizeSymbol(value: string) {
  return value.trim().toUpperCase();
}

function correlationLevelScore(level: PortfolioCorrelationLevel) {
  return {
    CRITICAL: 4,
    HIGH: 3,
    LOW: 1,
    MEDIUM: 2,
  }[level];
}

function levelFromScore(score: number): PortfolioCorrelationLevel {
  if (score >= 80) {
    return "CRITICAL";
  }

  if (score >= 50) {
    return "HIGH";
  }

  if (score >= 20) {
    return "MEDIUM";
  }

  return "LOW";
}

function makePair(input: {
  left: string;
  level: PortfolioCorrelationLevel;
  rationale: string;
  right: string;
  score: number;
}): PortfolioCorrelationPair {
  return {
    leftLabel: input.left,
    leftSymbol: input.left,
    level: input.level,
    rationale: input.rationale,
    rightLabel: input.right,
    rightSymbol: input.right,
    score: input.score,
  };
}

function pairKey(left: string, right: string) {
  return [normalizeSymbol(left), normalizeSymbol(right)].sort().join("::");
}

function addPair(
  pairs: PortfolioCorrelationPair[],
  seenPairs: Set<string>,
  pair: PortfolioCorrelationPair,
) {
  const key = pairKey(pair.leftSymbol, pair.rightSymbol);

  if (seenPairs.has(key)) {
    return;
  }

  seenPairs.add(key);
  pairs.push(pair);
}

function buildKnownPairs(symbols: Set<string>) {
  const pairs: PortfolioCorrelationPair[] = [];
  const seenPairs = new Set<string>();

  for (const [left, right] of HIGH_CORRELATION_PAIRS) {
    if (symbols.has(left) && symbols.has(right)) {
      addPair(
        pairs,
        seenPairs,
        makePair({
          left,
          level: "HIGH",
          rationale: "Mock engine treats this as a high shared market-factor pair.",
          right,
          score: 82,
        }),
      );
    }
  }

  for (const [left, right] of MEDIUM_CORRELATION_PAIRS) {
    if (symbols.has(left) && symbols.has(right)) {
      addPair(
        pairs,
        seenPairs,
        makePair({
          left,
          level: "MEDIUM",
          rationale: "Mock engine treats this as a medium shared market-factor pair.",
          right,
          score: 52,
        }),
      );
    }
  }

  return { pairs, seenPairs };
}

function addLowCorrelationPairs(input: PortfolioCorrelationInput, state: {
  pairs: PortfolioCorrelationPair[];
  seenPairs: Set<string>;
}) {
  const topSymbol = input.exposureReport.symbolExposure[0]?.label;
  const hasCash = input.exposureReport.assetTypeExposure.some((item) => item.key === "CASH");

  if (hasCash && topSymbol) {
    addPair(
      state.pairs,
      state.seenPairs,
      makePair({
        left: "CASH",
        level: "LOW",
        rationale: "Cash exposure is treated as low correlation versus market-linked assets.",
        right: topSymbol,
        score: 12,
      }),
    );
  }

  const sortedRegions = [...input.exposureReport.regionExposure].sort(
    (left, right) => right.percentage - left.percentage || left.label.localeCompare(right.label),
  );

  if (sortedRegions.length >= 2) {
    addPair(
      state.pairs,
      state.seenPairs,
      makePair({
        left: sortedRegions[0].label,
        level: "LOW",
        rationale: "Region-diversified exposure is treated as lower mock correlation.",
        right: sortedRegions[1].label,
        score: 18,
      }),
    );
  }
}

function buildCorrelationScore(input: {
  concentrationScore: number;
  highCorrelationCount: number;
  lowCorrelationCount: number;
  mediumCorrelationCount: number;
}) {
  return Math.min(
    100,
    Math.round(
      input.highCorrelationCount * 24 +
        input.mediumCorrelationCount * 10 +
        input.lowCorrelationCount * 2 +
        input.concentrationScore * 0.25,
    ),
  );
}

function buildAlerts(input: {
  highCorrelationCount: number;
  level: PortfolioCorrelationLevel;
  topCorrelationPairs: PortfolioCorrelationPair[];
}) {
  const alerts: string[] = [];

  if (input.level === "HIGH" || input.level === "CRITICAL") {
    alerts.push(
      `Portfolio correlation level is ${input.level.toLowerCase()} in the deterministic mock engine.`,
    );
  }

  if (input.highCorrelationCount > 0) {
    const topPair = input.topCorrelationPairs[0];

    alerts.push(
      topPair
        ? `${topPair.leftLabel} and ${topPair.rightLabel} are flagged as a high-correlation pair.`
        : `${input.highCorrelationCount} high-correlation pair is currently flagged.`,
    );
  }

  return alerts;
}

function buildSummary(input: {
  highCorrelationCount: number;
  level: PortfolioCorrelationLevel;
  topCorrelationPairs: PortfolioCorrelationPair[];
}) {
  const topPair = input.topCorrelationPairs[0];

  if (!topPair) {
    return "Portfolio Correlation Engine is enabled, but no mock correlation pair is currently detected.";
  }

  return `Correlation level is ${input.level}. Top pair is ${topPair.leftLabel} and ${topPair.rightLabel} with ${topPair.level.toLowerCase()} mock correlation. Monitoring and risk-awareness only.`;
}

export const mockPortfolioCorrelationEngine: PortfolioCorrelationEngine = {
  async generateCorrelation(input: PortfolioCorrelationInput): Promise<PortfolioCorrelationReport> {
    const symbols = new Set(
      input.exposureReport.symbolExposure
        .map((item) => normalizeSymbol(item.key || item.label))
        .filter(Boolean),
    );
    const state = buildKnownPairs(symbols);

    addLowCorrelationPairs(input, state);

    const pairs = state.pairs.sort(
      (left, right) =>
        correlationLevelScore(right.level) - correlationLevelScore(left.level) ||
        right.score - left.score ||
        left.leftLabel.localeCompare(right.leftLabel),
    );
    const highCorrelationCount = pairs.filter((pair) => pair.level === "HIGH").length;
    const mediumCorrelationCount = pairs.filter((pair) => pair.level === "MEDIUM").length;
    const lowCorrelationCount = pairs.filter((pair) => pair.level === "LOW").length;
    const correlationScore = buildCorrelationScore({
      concentrationScore: input.concentrationReport.concentrationScore,
      highCorrelationCount,
      lowCorrelationCount,
      mediumCorrelationCount,
    });
    const level = levelFromScore(correlationScore);
    const topCorrelationPairs = pairs.slice(0, 5);
    const alerts = buildAlerts({
      highCorrelationCount,
      level,
      topCorrelationPairs,
    });

    return {
      alerts,
      correlationScore,
      generatedAt: GENERATED_AT,
      highCorrelationCount,
      id: "mock-portfolio-correlation-report-v2-07",
      level,
      lowCorrelationCount,
      mediumCorrelationCount,
      pairs,
      summary: buildSummary({
        highCorrelationCount,
        level,
        topCorrelationPairs,
      }),
      topCorrelationPairs,
    };
  },
};

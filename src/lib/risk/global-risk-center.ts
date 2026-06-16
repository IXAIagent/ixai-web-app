import {
  buildFcnIntelligenceCenterReadback,
  type FCNManualPriceOverrides,
  type FCNPositionRiskReadback,
  type FCNTimelineEvent,
} from "@/src/lib/fcn/intelligence-center";
import type {
  GlobalRiskCenterReadback,
  GlobalRiskDataStatus,
  GlobalRiskFcnWorstOfSummary,
  GlobalRiskIntelligenceReadback,
  GlobalRiskScore,
} from "@/src/lib/risk/global-risk-types";
import type {
  PortfolioTruthReadback,
  PortfolioTruthRiskSummary,
  PortfolioTruthSymbolExposure,
} from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { FCNPosition } from "@/src/types/fcn-position";
import type { StockPosition } from "@/src/types/stock-position";

const MAX_UPCOMING_EVENTS = 8;

function isGridPosition(position: CryptoPosition) {
  return position.positionType === "grid" || position.strategyType === "grid" || position.strategyType === "futures_grid";
}

function isDualPosition(position: CryptoPosition) {
  return position.positionType === "dual" || position.strategyType === "dual";
}

function sourceStatus(input: {
  count: number;
  error: boolean;
  unauthenticated: boolean;
}): GlobalRiskDataStatus {
  if (input.unauthenticated) return "unauthenticated";
  if (input.error) return "error";
  return input.count > 0 ? "ready" : "placeholder";
}

function buildFoundationScore(input: {
  highRiskCount: number;
  totalCount: number;
  unknownRiskCount: number;
  watchCount: number;
}): GlobalRiskScore {
  if (input.totalCount === 0) {
    return {
      label: "Foundation Score" as const,
      level: "UNKNOWN" as const,
      score: null,
      summary: "Global Risk Center is enabled, but no FCN risk data is available yet.",
    };
  }

  const score = Math.min(
    100,
    Math.round(input.highRiskCount * 30 + input.watchCount * 15 + input.unknownRiskCount * 8),
  );
  const level =
    score >= 70 ? "ELEVATED" : score >= 35 ? "MODERATE" : "LOW";

  return {
    label: "Foundation Score" as const,
    level,
    score,
    summary:
      "Foundation score is deterministic and currently weighted by FCN RED, YELLOW, and UNKNOWN readback only.",
  };
}

function buildUpcomingEvents(events: FCNTimelineEvent[]) {
  return events
    .filter((event) => event.status === "today" || event.status === "upcoming")
    .slice(0, MAX_UPCOMING_EVENTS);
}

const FALLBACK_TRUTH_RISK: PortfolioTruthRiskSummary = {
  concentrationRisk: {
    level: "UNKNOWN",
    repeatedSymbolCount: 0,
    score: null,
    summary: "Portfolio Truth Layer is not available for concentration readback.",
    topExposure: null,
    topExposureSharePct: null,
    totalSymbolOccurrences: 0,
  },
  dataQualityRisk: {
    level: "UNKNOWN",
    partialSourceCount: 0,
    score: null,
    summary: "Portfolio Truth Layer is not available for data quality readback.",
    unavailableSourceCount: 0,
    warningCount: 0,
  },
};

function compareRiskPosition(a: FCNPositionRiskReadback, b: FCNPositionRiskReadback) {
  const statusWeight = {
    GREEN: 1,
    UNKNOWN: 2,
    YELLOW: 3,
    RED: 4,
  } satisfies Record<FCNPositionRiskReadback["riskStatus"], number>;
  const statusDiff = statusWeight[b.riskStatus] - statusWeight[a.riskStatus];

  if (statusDiff !== 0) {
    return statusDiff;
  }

  const aDistance = a.worstKiDistancePct ?? Number.POSITIVE_INFINITY;
  const bDistance = b.worstKiDistancePct ?? Number.POSITIVE_INFINITY;

  return aDistance - bDistance || a.positionId.localeCompare(b.positionId);
}

function buildFcnWorstOfSummary(positionRisks: FCNPositionRiskReadback[]): GlobalRiskFcnWorstOfSummary {
  const missingPriceCount = positionRisks.reduce(
    (total, risk) => total + risk.missingPriceCount,
    0,
  );
  const worstPosition = positionRisks.toSorted(compareRiskPosition)[0] ?? null;
  const highRiskCount = positionRisks.filter((risk) => risk.riskStatus === "RED").length;
  const watchCount = positionRisks.filter((risk) => risk.riskStatus === "YELLOW").length;
  const unknownRiskCount = positionRisks.filter((risk) => risk.riskStatus === "UNKNOWN").length;

  return {
    highRiskCount,
    missingPriceCount,
    summary: worstPosition
      ? `Worst-of readback is ${worstPosition.riskStatus} across stored FCN underlyings.`
      : "No FCN position risk readback is available yet.",
    unknownRiskCount,
    watchCount,
    worstPosition,
  };
}

function buildRiskIntelligence(input: {
  fcnPositionRisks: FCNPositionRiskReadback[];
  portfolioTruth: PortfolioTruthReadback | null | undefined;
}): GlobalRiskIntelligenceReadback {
  const topExposures: PortfolioTruthSymbolExposure[] =
    input.portfolioTruth?.symbols.topExposures ?? [];
  const truthRisk = input.portfolioTruth?.risk ?? FALLBACK_TRUTH_RISK;

  return {
    concentrationRisk: truthRisk.concentrationRisk,
    dataQualityRisk: truthRisk.dataQualityRisk,
    fcnWorstOfRisk: buildFcnWorstOfSummary(input.fcnPositionRisks),
    topExposures,
  };
}

export function buildGlobalRiskCenterReadback(input: {
  cryptoError?: boolean;
  cryptoPositions: CryptoPosition[];
  fcnError?: boolean;
  fcnPositions: FCNPosition[];
  manualPrices?: FCNManualPriceOverrides;
  portfolioTruth?: PortfolioTruthReadback | null;
  stockError?: boolean;
  stockPositions: StockPosition[];
  unauthenticated?: boolean;
}): GlobalRiskCenterReadback {
  const fcn = buildFcnIntelligenceCenterReadback(input.fcnPositions, input.manualPrices ?? {});
  const fcnPositionRisks = Array.from(fcn.positionRisks.values());
  const gridCount = input.cryptoPositions.filter(isGridPosition).length;
  const dualCount = input.cryptoPositions.filter(isDualPosition).length;
  const unauthenticated = input.unauthenticated ?? false;

  return {
    assetReadiness: [
      {
        count: input.fcnPositions.length,
        label: "FCN",
        note: "Reads existing Supabase FCN positions and v3.20 risk helper output.",
        source: "/api/fcn",
        status: sourceStatus({
          count: input.fcnPositions.length,
          error: input.fcnError ?? false,
          unauthenticated,
        }),
        type: "FCN",
      },
      {
        count: input.stockPositions.length,
        label: "Stock",
        note: "Stock API exists; Workspace stock input is still not fully persisted.",
        source: "/api/stocks",
        status: sourceStatus({
          count: input.stockPositions.length,
          error: input.stockError ?? false,
          unauthenticated,
        }),
        type: "STOCK",
      },
      {
        count: input.cryptoPositions.length,
        label: "Crypto",
        note: "Crypto API exists; Workspace crypto input is still not fully persisted.",
        source: "/api/crypto",
        status: sourceStatus({
          count: input.cryptoPositions.length,
          error: input.cryptoError ?? false,
          unauthenticated,
        }),
        type: "CRYPTO",
      },
      {
        count: gridCount,
        label: "Grid",
        note: "Derived from crypto position type or strategy type.",
        source: "/api/crypto",
        status: sourceStatus({
          count: gridCount,
          error: input.cryptoError ?? false,
          unauthenticated,
        }),
        type: "GRID",
      },
      {
        count: dualCount,
        label: "Dual",
        note: "Derived from crypto position type or strategy type.",
        source: "/api/crypto",
        status: sourceStatus({
          count: dualCount,
          error: input.cryptoError ?? false,
          unauthenticated,
        }),
        type: "DUAL",
      },
    ],
    dataSources: [
      {
        label: "Portfolio Truth Layer",
        note: input.portfolioTruth
          ? "Shared v4.01 readback used by Portfolio, Risk, and Intelligence Center."
          : "Shared Portfolio Truth Layer is not attached to this readback.",
        status: input.portfolioTruth?.readinessLevel ?? "placeholder",
      },
      {
        label: "FCN API",
        note: "Existing /api/fcn readback path.",
        status: sourceStatus({
          count: input.fcnPositions.length,
          error: input.fcnError ?? false,
          unauthenticated,
        }),
      },
      {
        label: "Stock API",
        note: "Existing /api/stocks readback path.",
        status: sourceStatus({
          count: input.stockPositions.length,
          error: input.stockError ?? false,
          unauthenticated,
        }),
      },
      {
        label: "Crypto API",
        note: "Existing /api/crypto readback path.",
        status: sourceStatus({
          count: input.cryptoPositions.length,
          error: input.cryptoError ?? false,
          unauthenticated,
        }),
      },
      {
        label: "Manual Price Overlay",
        note: "Uses v3.20 browser-local manual price overlay for FCN KI-distance readback.",
        status: "ready",
      },
      {
        label: "Live Market Data",
        note: "Not enabled in v3.30 Sprint 1.",
        status: "placeholder",
      },
    ],
    fcn,
    fcnRiskBreakdown: {
      GREEN: Array.from(fcn.positionRisks.values()).filter((risk) => risk.riskStatus === "GREEN").length,
      RED: fcn.summary.highRiskCount,
      UNKNOWN: fcn.summary.unknownRiskCount,
      YELLOW: fcn.summary.watchCount,
    },
    generatedAt: new Date().toISOString(),
    portfolioTruth: input.portfolioTruth ?? null,
    riskIntelligence: buildRiskIntelligence({
      fcnPositionRisks,
      portfolioTruth: input.portfolioTruth,
    }),
    riskScore: buildFoundationScore({
      highRiskCount: fcn.summary.highRiskCount,
      totalCount: fcn.summary.totalCount,
      unknownRiskCount: fcn.summary.unknownRiskCount,
      watchCount: fcn.summary.watchCount,
    }),
    upcomingEvents: buildUpcomingEvents(fcn.timeline),
  };
}

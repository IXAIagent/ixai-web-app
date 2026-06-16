import {
  buildFcnIntelligenceCenterReadback,
  type FCNManualPriceOverrides,
} from "@/src/lib/fcn/intelligence-center";
import type {
  IntelligenceCenterEntry,
  IntelligenceCenterReadback,
  IntelligenceCenterSourceStatus,
  IntelligenceCenterStatus,
  IntelligenceExposureSummary,
  IntelligenceReadbackSummary,
  IntelligenceReadinessWarningSummary,
} from "@/src/lib/intelligence/intelligence-center-types";
import type {
  PortfolioTruthReadback,
  PortfolioTruthSourceStatus,
} from "@/src/lib/portfolio/truth/portfolio-truth-types";
import { buildGlobalRiskCenterReadback } from "@/src/lib/risk/global-risk-center";
import type { GlobalRiskCenterReadback } from "@/src/lib/risk/global-risk-types";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { FCNPosition } from "@/src/types/fcn-position";
import type { StockPosition } from "@/src/types/stock-position";

function statusFromCount(input: {
  count: number;
  error?: boolean;
  unauthenticated?: boolean;
}): IntelligenceCenterStatus {
  if (input.unauthenticated) return "unauthenticated";
  if (input.error) return "error";
  return input.count > 0 ? "ready" : "placeholder";
}

function statusFromTruthStatus(
  status: PortfolioTruthSourceStatus,
): IntelligenceCenterStatus {
  if (status === "unavailable") {
    return "unavailable";
  }

  return status;
}

function source(label: string, status: IntelligenceCenterStatus, note: string): IntelligenceCenterSourceStatus {
  return {
    label,
    note,
    status,
  };
}

function buildEntries(): IntelligenceCenterEntry[] {
  return [
    {
      description: "每日市場情報入口，保持 public route，不在 v3.40 改寫內容流程。",
      href: "/daily-brief",
      label: "Daily Brief",
      status: "ready",
    },
    {
      description: "每週情報入口，承接較長週期的市場整理與下週觀察。",
      href: "/weekly-brief",
      label: "Weekly Intelligence",
      status: "ready",
    },
    {
      description: "公開 Market Overview 可作為 Workspace intelligence 的市場背景來源。",
      href: "/market",
      label: "Market Overview",
      status: "ready",
    },
  ];
}

function buildHighlights(input: {
  cryptoCount: number;
  fcnCount: number;
  highRiskCount: number;
  portfolioCount: number;
  stockCount: number;
  upcomingEventsCount: number;
  watchCount: number;
}) {
  const highlights: string[] = [];

  if (input.fcnCount > 0) {
    highlights.push(
      `${input.fcnCount} FCN positions are available for workspace intelligence readback.`,
    );
  } else {
    highlights.push("FCN intelligence is ready, but no FCN positions are available yet.");
  }

  if (input.highRiskCount > 0 || input.watchCount > 0) {
    highlights.push(
      `${input.highRiskCount} high-risk and ${input.watchCount} watch FCNs should be reviewed in FCN Center.`,
    );
  }

  if (input.upcomingEventsCount > 0) {
    highlights.push(`${input.upcomingEventsCount} upcoming FCN timeline events are available.`);
  }

  if (input.stockCount > 0 || input.cryptoCount > 0) {
    highlights.push(
      `${input.stockCount} stock and ${input.cryptoCount} crypto positions are visible for future portfolio-aware news wiring.`,
    );
  } else {
    highlights.push("Stock and Crypto workspace intelligence remain readiness-only until positions are available.");
  }

  if (input.portfolioCount > 0) {
    highlights.push(
      `${input.portfolioCount} holdings are available through the shared Portfolio Truth Layer.`,
    );
  }

  return highlights.slice(0, 5);
}

function buildPortfolioIntelligenceSummary(input: {
  portfolioTruth: PortfolioTruthReadback | null | undefined;
}): IntelligenceReadbackSummary[] {
  const truth = input.portfolioTruth;

  if (!truth) {
    return [
      {
        note: "Shared Portfolio Truth Layer is not attached yet.",
        status: "placeholder",
        title: "Portfolio Readback",
        value: "Not attached",
      },
    ];
  }

  return [
    {
      note: "Shared holdings count from FCN, Stock, and Crypto readback.",
      status: statusFromTruthStatus(truth.readinessLevel),
      title: "Total Holdings",
      value: String(truth.counts.totalAssets),
    },
    {
      note: "Known notional only; missing values are not invented.",
      status: truth.amounts.totalKnownNotional > 0 ? "ready" : "placeholder",
      title: "Known Notional",
      value:
        truth.amounts.totalKnownNotional > 0
          ? truth.amounts.totalKnownNotional.toLocaleString("en-US")
          : "Unknown",
    },
    {
      note: "Symbols from FCN underlyings, Stock positions, and Crypto positions.",
      status: truth.symbols.topAvailableSymbols.length > 0 ? "ready" : "placeholder",
      title: "Available Symbols",
      value: String(truth.symbols.topAvailableSymbols.length),
    },
  ];
}

function buildRiskSnapshotSummary(input: {
  riskReadback: GlobalRiskCenterReadback;
}): IntelligenceReadbackSummary[] {
  const concentration = input.riskReadback.riskIntelligence.concentrationRisk;
  const dataQuality = input.riskReadback.riskIntelligence.dataQualityRisk;
  const fcnWorstOf = input.riskReadback.riskIntelligence.fcnWorstOfRisk;

  return [
    {
      note: input.riskReadback.riskScore.summary,
      status: input.riskReadback.riskScore.score === null ? "placeholder" : "ready",
      title: input.riskReadback.riskScore.label,
      value:
        input.riskReadback.riskScore.score === null
          ? "Unknown"
          : String(input.riskReadback.riskScore.score),
    },
    {
      note: concentration.summary,
      status: concentration.level === "UNKNOWN" ? "placeholder" : "ready",
      title: "Concentration",
      value: concentration.level,
    },
    {
      note: fcnWorstOf.summary,
      status: fcnWorstOf.worstPosition ? "ready" : "placeholder",
      title: "FCN Worst-of",
      value: fcnWorstOf.worstPosition?.riskStatus ?? "Unknown",
    },
    {
      note: dataQuality.summary,
      status: dataQuality.level === "LOW" ? "ready" : "partial",
      title: "Data Quality",
      value: dataQuality.level,
    },
  ];
}

function buildExposureIntelligenceSummary(input: {
  portfolioTruth: PortfolioTruthReadback | null | undefined;
  riskReadback: GlobalRiskCenterReadback;
}): IntelligenceExposureSummary {
  const topExposures =
    input.riskReadback.riskIntelligence.topExposures.length > 0
      ? input.riskReadback.riskIntelligence.topExposures
      : input.portfolioTruth?.symbols.topExposures ?? [];

  return {
    note:
      topExposures.length > 0
        ? "Occurrence-based exposure readback from existing holdings symbols."
        : "No exposure symbols are available yet.",
    topExposures,
    totalKnownSymbols: input.portfolioTruth?.symbols.topAvailableSymbols.length ?? 0,
  };
}

function buildReadinessWarningSummary(input: {
  portfolioTruth: PortfolioTruthReadback | null | undefined;
  sourceStatus: IntelligenceCenterSourceStatus[];
}): IntelligenceReadinessWarningSummary {
  const warnings = input.portfolioTruth?.missingDataWarnings ?? [];
  const sourceWarnings = input.sourceStatus.filter((sourceItem) =>
    sourceItem.status === "error" ||
    sourceItem.status === "partial" ||
    sourceItem.status === "unauthenticated" ||
    sourceItem.status === "unavailable",
  );

  return {
    sourceWarnings,
    warningCount: warnings.length + sourceWarnings.length,
    warnings: warnings.slice(0, 5),
  };
}

export function buildIntelligenceCenterReadback(input: {
  cryptoError?: boolean;
  cryptoPositions: CryptoPosition[];
  fcnError?: boolean;
  fcnPositions: FCNPosition[];
  manualPrices?: FCNManualPriceOverrides;
  portfolioCount?: number;
  portfolioError?: boolean;
  portfolioTruth?: PortfolioTruthReadback | null;
  stockError?: boolean;
  stockPositions: StockPosition[];
  unauthenticated?: boolean;
}): IntelligenceCenterReadback {
  const unauthenticated = input.unauthenticated ?? false;
  const portfolioCount =
    input.portfolioCount ?? input.portfolioTruth?.portfolioDashboard?.portfolioCount ?? 0;
  const fcn = buildFcnIntelligenceCenterReadback(input.fcnPositions, input.manualPrices ?? {});
  const riskReadback = buildGlobalRiskCenterReadback({
    cryptoError: input.cryptoError,
    cryptoPositions: input.cryptoPositions,
    fcnError: input.fcnError,
    fcnPositions: input.fcnPositions,
    manualPrices: input.manualPrices,
    portfolioTruth: input.portfolioTruth,
    stockError: input.stockError,
    stockPositions: input.stockPositions,
    unauthenticated,
  });
  const fcnStatus = statusFromCount({
    count: input.fcnPositions.length,
    error: input.fcnError,
    unauthenticated,
  });
  const stockStatus = statusFromCount({
    count: input.stockPositions.length,
    error: input.stockError,
    unauthenticated,
  });
  const cryptoStatus = statusFromCount({
    count: input.cryptoPositions.length,
    error: input.cryptoError,
    unauthenticated,
  });
  const portfolioStatus = statusFromCount({
    count: portfolioCount,
    error: input.portfolioError,
    unauthenticated,
  });
  const sourceStatusList = [
    source(
      "Portfolio Truth Layer",
      input.portfolioTruth
        ? statusFromTruthStatus(input.portfolioTruth.readinessLevel)
        : "placeholder",
      "Shared v4.01 readback used before creating portfolio-aware insights.",
    ),
    source("Risk Intelligence Layer", "ready", "Shared v4.03 readback used for risk snapshot and exposure summaries."),
    source("FCN API", fcnStatus, "Used for FCN intelligence highlights."),
    source("Stock API", stockStatus, "Used for readiness and future portfolio-aware highlights."),
    source("Crypto API", cryptoStatus, "Used for readiness and future portfolio-aware highlights."),
    source("Portfolio Dashboard API", portfolioStatus, "Used for portfolio-aware readiness."),
    source("External AI", "placeholder", "Not connected."),
    source("External News", "placeholder", "Not connected."),
  ] satisfies IntelligenceCenterSourceStatus[];

  return {
    commentaryReadiness: [
      source(
        "Deterministic Mock Commentary",
        "placeholder",
        "Existing deterministic mock commentary foundation exists, but v3.40 does not generate commentary cards yet; no external AI provider is connected.",
      ),
      source(
        "External AI Provider",
        "placeholder",
        "OpenAI, Claude, Gemini, Anthropic, LangChain, and LlamaIndex remain out of scope.",
      ),
      source(
        "Personalized Advice",
        "placeholder",
        "Not enabled. Commentary must remain information workflow and risk-awareness only.",
      ),
    ],
    entries: buildEntries(),
    exposureIntelligenceSummary: buildExposureIntelligenceSummary({
      portfolioTruth: input.portfolioTruth,
      riskReadback,
    }),
    fcn,
    generatedAt: new Date().toISOString(),
    highlights: buildHighlights({
      cryptoCount: input.cryptoPositions.length,
      fcnCount: input.fcnPositions.length,
      highRiskCount: fcn.summary.highRiskCount,
      portfolioCount,
      stockCount: input.stockPositions.length,
      upcomingEventsCount: fcn.summary.upcomingEventsCount,
      watchCount: fcn.summary.watchCount,
    }),
    marketSnapshot: [
      source(
        "Public Market Overview",
        "ready",
        "The existing public /market route remains the market snapshot entry point for v3.40.",
      ),
      source(
        "Workspace Market Integration",
        "placeholder",
        "Workspace-specific market modules are not duplicated in this sprint.",
      ),
    ],
    newsReadiness: [
      source("Daily / Weekly Public Intelligence", "ready", "Public Daily and Weekly routes remain available."),
      source(
        "Portfolio-Aware News Foundation",
        "placeholder",
        "Existing mock portfolio news foundation exists, but v3.40 does not generate a holding-aware feed yet; no external news provider is connected.",
      ),
      source(
        "External News Provider",
        "placeholder",
        "No News API, Yahoo, broker, or third-party news provider is connected in v3.40.",
      ),
    ],
    portfolioIntelligenceSummary: buildPortfolioIntelligenceSummary({
      portfolioTruth: input.portfolioTruth,
    }),
    portfolioTruth: input.portfolioTruth ?? null,
    portfolioStatus: [
      source(
        "Portfolio Truth Layer",
        input.portfolioTruth
          ? statusFromTruthStatus(input.portfolioTruth.readinessLevel)
          : "placeholder",
        "Shared v4.01 readback layer for Portfolio, Risk, and Intelligence Center.",
      ),
      source("Portfolio Dashboard", portfolioStatus, "Existing /api/portfolio/dashboard readback path."),
      source("FCN Positions", fcnStatus, "Existing /api/fcn readback path reused for FCN highlights."),
      source("Stock Positions", stockStatus, "Existing /api/stocks readback path; intelligence remains readiness-first."),
      source("Crypto Positions", cryptoStatus, "Existing /api/crypto readback path; intelligence remains readiness-first."),
    ],
    readinessWarningSummary: buildReadinessWarningSummary({
      portfolioTruth: input.portfolioTruth,
      sourceStatus: sourceStatusList,
    }),
    riskReadback,
    riskSnapshotSummary: buildRiskSnapshotSummary({
      riskReadback,
    }),
    sourceStatus: sourceStatusList,
    stats: {
      cryptoCount: input.cryptoPositions.length,
      fcnCount: input.fcnPositions.length,
      portfolioCount: input.portfolioTruth?.counts.totalAssets ?? portfolioCount,
      stockCount: input.stockPositions.length,
    },
  };
}

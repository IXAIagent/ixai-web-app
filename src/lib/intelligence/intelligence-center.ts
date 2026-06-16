import {
  buildFcnIntelligenceCenterReadback,
  type FCNManualPriceOverrides,
} from "@/src/lib/fcn/intelligence-center";
import type {
  IntelligenceCenterEntry,
  IntelligenceCenterReadback,
  IntelligenceCenterSourceStatus,
  IntelligenceCenterStatus,
} from "@/src/lib/intelligence/intelligence-center-types";
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
    highlights.push(`${input.portfolioCount} portfolios are available for future portfolio-aware intelligence.`);
  }

  return highlights.slice(0, 5);
}

export function buildIntelligenceCenterReadback(input: {
  cryptoError?: boolean;
  cryptoPositions: CryptoPosition[];
  fcnError?: boolean;
  fcnPositions: FCNPosition[];
  manualPrices?: FCNManualPriceOverrides;
  portfolioCount?: number;
  portfolioError?: boolean;
  stockError?: boolean;
  stockPositions: StockPosition[];
  unauthenticated?: boolean;
}): IntelligenceCenterReadback {
  const unauthenticated = input.unauthenticated ?? false;
  const portfolioCount = input.portfolioCount ?? 0;
  const fcn = buildFcnIntelligenceCenterReadback(input.fcnPositions, input.manualPrices ?? {});
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
    portfolioStatus: [
      source("Portfolio Dashboard", portfolioStatus, "Existing /api/portfolio/dashboard readback path."),
      source("FCN Positions", fcnStatus, "Existing /api/fcn readback path reused for FCN highlights."),
      source("Stock Positions", stockStatus, "Existing /api/stocks readback path; intelligence remains readiness-first."),
      source("Crypto Positions", cryptoStatus, "Existing /api/crypto readback path; intelligence remains readiness-first."),
    ],
    sourceStatus: [
      source("FCN API", fcnStatus, "Used for FCN intelligence highlights."),
      source("Stock API", stockStatus, "Used for readiness and future portfolio-aware highlights."),
      source("Crypto API", cryptoStatus, "Used for readiness and future portfolio-aware highlights."),
      source("Portfolio Dashboard API", portfolioStatus, "Used for portfolio-aware readiness."),
      source("External AI", "placeholder", "Not connected."),
      source("External News", "placeholder", "Not connected."),
    ],
    stats: {
      cryptoCount: input.cryptoPositions.length,
      fcnCount: input.fcnPositions.length,
      portfolioCount,
      stockCount: input.stockPositions.length,
    },
  };
}

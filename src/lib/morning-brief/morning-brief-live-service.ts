"use client";

import { getWorkspaceAlertSummary, type WorkspaceAlertSummary } from "@/src/lib/alerts";
import { getWorkspaceLiveMarketSnapshotForTruth } from "@/src/lib/market-data";
import {
  buildMorningBrief,
  buildMorningSnapshot,
  type MorningSnapshot,
} from "@/src/lib/morning-brief";
import {
  buildMorningBriefV1Sections,
  type MorningBriefV1Section,
} from "@/src/lib/morning-brief/morning-brief-sections";
import { buildMorningBriefShareText } from "@/src/lib/morning-brief/morning-brief-share";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { getWorkspaceLegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";
import {
  buildLegacyLiveRiskAdapterSnapshot,
  type LegacyLiveRiskAdapterSnapshot,
} from "@/src/lib/risk/legacy-risk-engine/live-risk-adapter";
import {
  buildFcnLiveUnderlyingSnapshot,
  buildPortfolioLiveValuationSnapshot,
  type FcnLiveUnderlyingSnapshot,
  type PortfolioLiveValuationSnapshot,
} from "@/src/lib/valuation";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import type { WorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-types";
import type { WorkspaceLiveMarketSnapshot } from "@/src/lib/market-data";

export type MorningBriefV1 = {
  alerts: WorkspaceAlertSummary | null;
  asOf: string | null;
  date: string;
  fcn: FcnLiveUnderlyingSnapshot;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  legacySnapshot: MorningSnapshot;
  liveMarket: WorkspaceLiveMarketSnapshot;
  portfolio: PortfolioLiveValuationSnapshot;
  readOnly: true;
  risk: LegacyLiveRiskAdapterSnapshot;
  sections: MorningBriefV1Section[];
  shareText: string;
  sourceStatus: "partial" | "ready" | "unavailable";
  watchlist: WorkspaceWatchlistSummary | null;
};

function buildDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Taipei",
    year: "numeric",
  }).format(new Date());
}

function inferStatus(input: {
  fcn: FcnLiveUnderlyingSnapshot;
  liveMarket: WorkspaceLiveMarketSnapshot;
  portfolio: PortfolioLiveValuationSnapshot;
  risk: LegacyLiveRiskAdapterSnapshot;
}): MorningBriefV1["sourceStatus"] {
  if (
    input.liveMarket.dataQuality === "unavailable" &&
    input.portfolio.dataQuality === "unavailable" &&
    input.fcn.dataQuality === "unavailable"
  ) {
    return "unavailable";
  }

  if (
    input.liveMarket.dataQuality !== "live" ||
    input.portfolio.dataQuality !== "live" ||
    input.fcn.dataQuality !== "live" ||
    input.risk.dataQuality !== "live"
  ) {
    return "partial";
  }

  return "ready";
}

export async function getWorkspaceMorningBriefV1(): Promise<MorningBriefV1> {
  const [truth, legacyRiskSnapshot, alerts, watchlist] = await Promise.all([
    loadPortfolioTruthReadback(),
    getWorkspaceLegacyRiskEngineSnapshot(),
    getWorkspaceAlertSummary().catch(() => null),
    getWorkspaceWatchlistSummary().catch(() => null),
  ]);
  const liveMarket = await getWorkspaceLiveMarketSnapshotForTruth(truth);
  const portfolio = buildPortfolioLiveValuationSnapshot({
    quoteSnapshot: liveMarket.sourceSnapshot,
    truth,
  });
  const fcn = buildFcnLiveUnderlyingSnapshot({
    fcnPositions: truth.positions.fcn,
    quoteSnapshot: liveMarket.sourceSnapshot,
  });
  const risk = buildLegacyLiveRiskAdapterSnapshot({
    fcn,
    legacyRiskSnapshot,
    portfolio,
    quoteSnapshot: liveMarket.sourceSnapshot,
  });
  const legacySnapshot = buildMorningSnapshot(
    buildMorningBrief({
      legacyRiskSnapshot,
      liveFcnSnapshot: fcn,
      livePortfolioValuation: portfolio,
      liveRiskAdapterSnapshot: risk,
    }),
  );
  const sections = buildMorningBriefV1Sections({
    alerts,
    fcn,
    liveMarket,
    portfolio,
    risk,
    watchlist,
  });
  const brief: Omit<MorningBriefV1, "shareText"> = {
    alerts,
    asOf: liveMarket.asOf,
    date: buildDateKey(),
    fcn,
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer:
      "Morning Brief v1 is read-only monitoring and intelligence workflow context. It does not provide investment recommendations, trading instructions, order execution, or return promises.",
    legacySnapshot,
    liveMarket,
    portfolio,
    readOnly: true,
    risk,
    sections,
    sourceStatus: inferStatus({
      fcn,
      liveMarket,
      portfolio,
      risk,
    }),
    watchlist,
  };

  return {
    ...brief,
    shareText: buildMorningBriefShareText(brief as MorningBriefV1),
  };
}

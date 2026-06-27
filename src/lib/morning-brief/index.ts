"use client";

import { buildMorningBrief } from "@/src/lib/morning-brief/brief-engine";
import { buildMorningSnapshot } from "@/src/lib/morning-brief/brief-snapshot";
import { buildMarketDataSnapshot } from "@/src/lib/market-data";
import { getWorkspaceLegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";

export * from "@/src/lib/morning-brief/brief-diagnostics";
export * from "@/src/lib/morning-brief/brief-engine";
export * from "@/src/lib/morning-brief/brief-fcn-adapter";
export * from "@/src/lib/morning-brief/brief-live-preview-adapter";
export * from "@/src/lib/morning-brief/brief-news-placeholder";
export * from "@/src/lib/morning-brief/brief-market-data-adapter";
export * from "@/src/lib/morning-brief/brief-portfolio-adapter";
export * from "@/src/lib/morning-brief/brief-risk-adapter";
export * from "@/src/lib/morning-brief/brief-snapshot";
export * from "@/src/lib/morning-brief/brief-types";
export * from "@/src/lib/morning-brief/morning-brief-live-service";
export * from "@/src/lib/morning-brief/morning-brief-sections";
export * from "@/src/lib/morning-brief/morning-brief-share";

export async function getWorkspaceMorningBrief() {
  try {
    return buildMorningBrief({
      legacyRiskSnapshot: await getWorkspaceLegacyRiskEngineSnapshot(),
      marketDataSnapshot: await buildMarketDataSnapshot(),
    });
  } catch {
    return buildMorningBrief({ legacyRiskSnapshot: null });
  }
}

export async function getWorkspaceMorningSnapshot() {
  return buildMorningSnapshot(await getWorkspaceMorningBrief());
}

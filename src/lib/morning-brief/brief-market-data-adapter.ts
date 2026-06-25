import type { MarketDataSnapshot } from "@/src/lib/market-data";
import type { MorningBriefMarketDataSummary } from "@/src/lib/morning-brief/brief-types";

export function buildMorningMarketDataSummary(
  snapshot?: MarketDataSnapshot | null,
): MorningBriefMarketDataSummary {
  if (!snapshot) {
    return {
      dataQuality: "unavailable",
      liveExternalFeedEnabled: false,
      manualProviderSnapshotSupported: true,
      providerStatus: "unavailable",
      quoteCount: 0,
      source: "none",
      sourceStatus: "unavailable",
      warnings: ["Market data snapshot is unavailable; Morning Brief keeps placeholder behavior."],
    };
  }

  return {
    dataQuality: snapshot.dataQuality,
    liveExternalFeedEnabled: false,
    manualProviderSnapshotSupported: true,
    providerStatus: snapshot.providerStatus,
    quoteCount: snapshot.quotes.length,
    source: snapshot.source,
    sourceStatus: snapshot.providerStatus === "unavailable" ? "unavailable" : "placeholder",
    warnings: snapshot.warnings,
  };
}

import type { MorningBriefDiagnostics } from "@/src/lib/morning-brief/brief-types";

export function buildMorningBriefDiagnostics(): MorningBriefDiagnostics {
  return {
    aiRecommendationEnabled: false,
    brokerEnabled: false,
    dbWritesEnabled: false,
    externalApiCallsEnabled: false,
    fcnSource: "V15 FCN risk adapter + existing FCN readback",
    generatedAt: new Date().toISOString(),
    liveExternalFeedEnabled: false,
    marketDataInputSupported: true,
    marketDataSource: "V17 Manual Market Data Provider Placeholder",
    manualProviderSnapshotSupported: true,
    newsPlaceholderOnly: true,
    newsSource: "V16 News Placeholder",
    phase: "V16_MORNING_BRIEF_ENGINE",
    portfolioSource: "V15 Portfolio risk adapter + Portfolio Truth Layer",
    readOnly: true,
    recommendationLogicEnabled: false,
    riskEngineSource: "V15 Legacy Risk Engine",
    schedulerEnabled: false,
    telegramEnabled: false,
  };
}

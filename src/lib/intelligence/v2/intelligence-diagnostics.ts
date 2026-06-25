import type { IntelligenceV2Diagnostics } from "@/src/lib/intelligence/v2/intelligence-types";

export function buildIntelligenceV2Diagnostics(): IntelligenceV2Diagnostics {
  return {
    aiProviderEnabled: false,
    brokerEnabled: false,
    externalLLMCallsEnabled: false,
    generatedAt: new Date().toISOString(),
    phase: "V19_INTELLIGENCE_CENTER_V2_FOUNDATION",
    readOnly: true,
    recommendationLogicEnabled: false,
    tradingLogicEnabled: false,
  };
}

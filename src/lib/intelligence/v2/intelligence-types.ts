import type { MarketDataSnapshot } from "@/src/lib/market-data";
import type { MorningBrief } from "@/src/lib/morning-brief";
import type { LegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";

export type IntelligenceV2Severity = "info" | "warning" | "critical";

export type IntelligenceV2Source =
  | "portfolio"
  | "risk"
  | "fcn"
  | "market"
  | "morning_brief"
  | "system";

export interface IntelligenceV2Insight {
  id: string;
  severity: IntelligenceV2Severity;
  source: IntelligenceV2Source;
  summary: string;
  title: string;
}

export interface IntelligenceV2SafetyFlags {
  actionableTradingInstructions: false;
  aiProviderEnabled: false;
  externalLLMCallsEnabled: false;
  recommendationLogicEnabled: false;
}

export interface IntelligenceV2Report {
  dataQuality: string;
  diagnostics: IntelligenceV2Diagnostics;
  fcnContext: string;
  generatedAt: string;
  limitations: string[];
  marketContext: string;
  monitoringInsights: IntelligenceV2Insight[];
  morningBriefContext: string;
  portfolioContext: string;
  riskContext: string;
  safetyFlags: IntelligenceV2SafetyFlags;
}

export interface IntelligenceV2Diagnostics {
  aiProviderEnabled: false;
  brokerEnabled: false;
  externalLLMCallsEnabled: false;
  generatedAt: string;
  phase: "V19_INTELLIGENCE_CENTER_V2_FOUNDATION";
  readOnly: true;
  recommendationLogicEnabled: false;
  tradingLogicEnabled: false;
}

export interface BuildIntelligenceV2Input {
  legacyRiskSnapshot?: LegacyRiskEngineSnapshot | null;
  marketDataSnapshot?: MarketDataSnapshot | null;
  morningBrief?: MorningBrief | null;
}

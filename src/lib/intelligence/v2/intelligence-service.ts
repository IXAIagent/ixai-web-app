import { buildMarketDataSnapshot } from "@/src/lib/market-data";
import { buildMorningBrief } from "@/src/lib/morning-brief";
import { getWorkspaceLegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";
import { buildIntelligenceMorningBriefContext } from "@/src/lib/intelligence/v2/intelligence-brief-adapter";
import { buildIntelligenceV2Diagnostics } from "@/src/lib/intelligence/v2/intelligence-diagnostics";
import { buildIntelligenceMarketContext } from "@/src/lib/intelligence/v2/intelligence-market-adapter";
import { buildIntelligenceRiskContext } from "@/src/lib/intelligence/v2/intelligence-risk-adapter";
import type {
  BuildIntelligenceV2Input,
  IntelligenceV2Insight,
  IntelligenceV2Report,
  IntelligenceV2SafetyFlags,
} from "@/src/lib/intelligence/v2/intelligence-types";

const safetyFlags: IntelligenceV2SafetyFlags = {
  actionableTradingInstructions: false,
  aiProviderEnabled: false,
  externalLLMCallsEnabled: false,
  recommendationLogicEnabled: false,
};

function buildMonitoringInsights(input: BuildIntelligenceV2Input): IntelligenceV2Insight[] {
  const insights: IntelligenceV2Insight[] = [
    {
      id: "v19-risk-readback",
      severity: input.legacyRiskSnapshot ? "info" : "warning",
      source: "risk",
      summary: input.legacyRiskSnapshot
        ? "Risk context is reused from V15 Legacy Risk Engine without recalculating another engine."
        : "Risk context is unavailable; Intelligence v2 remains in insufficient-data mode.",
      title: "Risk Context",
    },
    {
      id: "v19-market-placeholder",
      severity: "info",
      source: "market",
      summary: "Market context uses V17 manual placeholder provider metadata only. No Yahoo, Binance, broker, or live provider call is made.",
      title: "Market Provider Boundary",
    },
    {
      id: "v19-morning-brief-link",
      severity: input.morningBrief ? "info" : "warning",
      source: "morning_brief",
      summary: input.morningBrief
        ? "Morning Brief context is available as a deterministic workspace readback."
        : "Morning Brief context is unavailable; no external job or scheduler is attempted.",
      title: "Morning Brief Context",
    },
  ];

  if ((input.legacyRiskSnapshot?.fcnRisk.insufficientDataCount ?? 0) > 0) {
    insights.push({
      id: "v19-fcn-data-quality",
      severity: "warning",
      source: "fcn",
      summary: "Some FCN risk inputs remain insufficient-data and should stay visible as monitoring limitations.",
      title: "FCN Data Quality",
    });
  }

  return insights;
}

export function buildIntelligenceV2Report(input: BuildIntelligenceV2Input): IntelligenceV2Report {
  const insights = buildMonitoringInsights(input);

  return {
    dataQuality: insights.some((insight) => insight.severity === "warning")
      ? "partial"
      : "placeholder",
    diagnostics: buildIntelligenceV2Diagnostics(),
    fcnContext: input.legacyRiskSnapshot
      ? `FCN risk positions ${input.legacyRiskSnapshot.fcnRisk.positionCount}; insufficient ${input.legacyRiskSnapshot.fcnRisk.insufficientDataCount}.`
      : "FCN context unavailable.",
    generatedAt: new Date().toISOString(),
    limitations: [
      "V19 Intelligence v2 is deterministic and rule-based.",
      "No OpenAI, external LLM, external news provider, broker, trading, or recommendation logic is enabled.",
      "Market context uses V17 manual placeholder provider metadata.",
    ],
    marketContext: buildIntelligenceMarketContext(input.marketDataSnapshot),
    monitoringInsights: insights,
    morningBriefContext: buildIntelligenceMorningBriefContext(input.morningBrief),
    portfolioContext: input.legacyRiskSnapshot
      ? `Portfolio risk positions ${input.legacyRiskSnapshot.portfolioRisk.positionCount}; data quality ${input.legacyRiskSnapshot.portfolioRisk.dataQuality.sourceStatus}.`
      : "Portfolio context unavailable.",
    riskContext: buildIntelligenceRiskContext(input.legacyRiskSnapshot),
    safetyFlags,
  };
}

export async function getWorkspaceIntelligenceV2Report(): Promise<IntelligenceV2Report> {
  try {
    const marketDataSnapshot = await buildMarketDataSnapshot();
    const legacyRiskSnapshot = await getWorkspaceLegacyRiskEngineSnapshot();
    const morningBrief = buildMorningBrief({
      legacyRiskSnapshot,
      marketDataSnapshot,
    });

    return buildIntelligenceV2Report({
      legacyRiskSnapshot,
      marketDataSnapshot,
      morningBrief,
    });
  } catch {
    return buildIntelligenceV2Report({});
  }
}

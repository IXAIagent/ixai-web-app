import { buildMorningBriefDiagnostics } from "@/src/lib/morning-brief/brief-diagnostics";
import { buildMorningFcnSummary } from "@/src/lib/morning-brief/brief-fcn-adapter";
import { buildMorningMarketDataSummary } from "@/src/lib/morning-brief/brief-market-data-adapter";
import { buildMorningNewsPlaceholder } from "@/src/lib/morning-brief/brief-news-placeholder";
import { buildMorningPortfolioSummary } from "@/src/lib/morning-brief/brief-portfolio-adapter";
import { buildMorningRiskSummary } from "@/src/lib/morning-brief/brief-risk-adapter";
import type {
  BuildMorningBriefInput,
  MorningBrief,
  MorningBriefWarning,
} from "@/src/lib/morning-brief/brief-types";

const LIMITATIONS = [
  "V16 Morning Brief Engine is read-only and performs no database writes.",
  "News is a placeholder; no external news provider is connected.",
  "No Telegram bot, scheduler, broker, trading, or AI recommendation logic is included.",
  "Risk, Portfolio, and FCN sections reuse V15 Legacy Risk Engine readback.",
  "Market data input is supported through V17 manual placeholder snapshots only.",
];

function buildDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Taipei",
    year: "numeric",
  }).format(new Date());
}

type MorningBriefWarningInput = Pick<
  MorningBrief,
  "fcnSummary" | "marketDataSummary" | "newsSummary" | "portfolioSummary" | "riskSummary"
>;

function collectWarnings(input: MorningBriefWarningInput) {
  const warnings: MorningBriefWarning[] = [...input.riskSummary.warnings];

  if (input.portfolioSummary.sourceStatus !== "ready") {
    warnings.push({
      message: `Portfolio source status is ${input.portfolioSummary.sourceStatus}.`,
      severity: "warning",
      source: "Portfolio Adapter",
    });
  }

  if (input.fcnSummary.sourceStatus !== "ready") {
    warnings.push({
      message: `FCN source status is ${input.fcnSummary.sourceStatus}.`,
      severity: "warning",
      source: "FCN Adapter",
    });
  }

  if (input.newsSummary.sourceStatus === "placeholder") {
    warnings.push({
      message: "News section is placeholder-only in V16.",
      severity: "info",
      source: "News Placeholder",
    });
  }

  if (input.marketDataSummary.sourceStatus !== "ready") {
    warnings.push({
      message: `Market data source status is ${input.marketDataSummary.sourceStatus}.`,
      severity: "info",
      source: "Market Data Adapter",
    });
  }

  return warnings;
}

export function buildMorningBrief(input: BuildMorningBriefInput): MorningBrief {
  const portfolioSummary = buildMorningPortfolioSummary(input.legacyRiskSnapshot);
  const riskSummary = buildMorningRiskSummary(input.legacyRiskSnapshot);
  const fcnSummary = buildMorningFcnSummary(input.legacyRiskSnapshot);
  const newsSummary = buildMorningNewsPlaceholder();
  const marketDataSummary = buildMorningMarketDataSummary(input.marketDataSnapshot);
  const warnings = collectWarnings({
    fcnSummary,
    marketDataSummary,
    newsSummary,
    portfolioSummary,
    riskSummary,
  });

  return {
    dataQuality: {
      sourceStatus:
        warnings.some((warning) => warning.severity === "critical" || warning.severity === "high")
          ? "partial"
          : warnings.length > 0
            ? "partial"
            : "ready",
      warnings,
    },
    date: buildDateKey(),
    diagnostics: buildMorningBriefDiagnostics(),
    fcnSummary,
    limitations: LIMITATIONS,
    marketDataSummary,
    newsSummary,
    portfolioSummary,
    riskSummary,
    sourceSnapshot: input.legacyRiskSnapshot
      ? {
          generatedAt: input.legacyRiskSnapshot.generatedAt,
          phase: input.legacyRiskSnapshot.phase,
        }
      : null,
    warnings,
  };
}

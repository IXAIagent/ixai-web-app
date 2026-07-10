import { getEditorialProviderSourceResultAsync } from "@/src/lib/editorial/providers/provider-source";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule/fcn-schedule-service";
import {
  getAssetDiagnostics,
  getAssetIntelligence,
  getAssetSummary,
} from "@/src/lib/intelligence/assets";
import {
  getMonitoringEvents,
} from "@/src/lib/intelligence/monitoring";
import { buildMonitoringDiagnostics } from "@/src/lib/intelligence/monitoring/monitoring-diagnostics";
import { buildTodayFocus } from "@/src/lib/intelligence/monitoring/today-focus-engine";
import { getNotificationDeliveryPreview } from "@/src/lib/intelligence/notifications";
import { buildIntelligencePlatformDiagnostics } from "@/src/lib/intelligence/platform/platform-diagnostics";
import { buildFcnIntelligenceSnapshot } from "@/src/lib/intelligence/platform/platform-fcn";
import { buildTodayFocusV2 } from "@/src/lib/intelligence/platform/platform-focus";
import { buildMarketIntelligenceSnapshot } from "@/src/lib/intelligence/platform/platform-market";
import { buildPortfolioIntelligenceSnapshot } from "@/src/lib/intelligence/platform/platform-portfolio";
import { buildRiskIntelligenceSnapshot } from "@/src/lib/intelligence/platform/platform-risk";
import type {
  IntelligencePlatformContext,
  IntelligencePlatformServiceInput,
  IntelligencePlatformSnapshot,
  SettledSource,
} from "@/src/lib/intelligence/platform/platform-types";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import { buildPortfolioRiskSummary } from "@/src/lib/risk/risk-engine";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";

async function settleSource<T>(
  source: string,
  task: () => Promise<T> | T,
): Promise<SettledSource<T>> {
  try {
    return {
      data: await task(),
      error: null,
      source,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Unknown source failure",
        source,
      },
      source,
    };
  }
}

function safeSync<T>(
  source: string,
  errors: IntelligencePlatformContext["errors"],
  task: () => T,
): T | null {
  try {
    return task();
  } catch (error) {
    errors.push({
      message: error instanceof Error ? error.message : "Unknown source failure",
      source,
    });
    return null;
  }
}

export async function buildIntelligencePlatformContext(
  input: IntelligencePlatformServiceInput = {},
): Promise<IntelligencePlatformContext> {
  if (input.context) {
    return input.context;
  }

  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const settled = await Promise.all([
    settleSource("portfolio-valuation", getWorkspacePortfolioValuation),
    settleSource("fcn-risk", getWorkspaceFcnRiskSummary),
    settleSource("fcn-schedule", getWorkspaceFcnScheduleSummary),
    settleSource("watchlist", getWorkspaceWatchlistSummary),
    settleSource("editorial-provider-source", getEditorialProviderSourceResultAsync),
  ]);
  const errors = settled.flatMap((result) => (result.error ? [result.error] : []));
  const portfolioValuation = settled[0]?.data ?? null;
  const fcnRisk = settled[1]?.data ?? null;
  const fcnSchedule = settled[2]?.data ?? null;
  const watchlist = settled[3]?.data ?? null;
  const providerSource = settled[4]?.data ?? null;
  const portfolioRisk = portfolioValuation
    ? safeSync("portfolio-risk", errors, () => buildPortfolioRiskSummary(portfolioValuation))
    : null;
  const providerDiagnostics = input.providerDiagnostics ?? providerSource?.diagnostics ?? null;
  const assets = safeSync("asset-intelligence", errors, () =>
    getAssetIntelligence({
      generatedAt,
      portfolioPositions: portfolioValuation?.positions ?? [],
      watchlistItems: watchlist?.items ?? [],
    }),
  ) ?? [];
  const assetDiagnostics = safeSync("asset-diagnostics", errors, () => getAssetDiagnostics(assets));
  const assetSummary = safeSync("asset-summary", errors, () => getAssetSummary(assets));
  const monitoringEvents = safeSync("monitoring-events", errors, () =>
    getMonitoringEvents({
      assets,
      generatedAt,
      providerDiagnostics,
    }),
  ) ?? [];
  const todayFocus = safeSync("today-focus", errors, () =>
    buildTodayFocus(monitoringEvents),
  ) ?? [];
  const monitoringDiagnostics = safeSync("monitoring-diagnostics", errors, () =>
    buildMonitoringDiagnostics(monitoringEvents, assets, generatedAt),
  );
  const notificationPreview = safeSync("notification-preview", errors, () =>
    getNotificationDeliveryPreview({
      generatedAt,
      monitoringEvents,
    }),
  );

  return {
    assetDiagnostics,
    assetSummary,
    assets,
    errors,
    fcnRisk,
    fcnSchedule,
    generatedAt,
    monitoringDiagnostics,
    monitoringEvents,
    notificationPreview,
    portfolioRisk,
    portfolioValuation,
    providerDiagnostics,
    todayFocus,
    watchlist,
  };
}

export async function getPortfolioIntelligenceSnapshot(input: IntelligencePlatformServiceInput = {}) {
  return buildPortfolioIntelligenceSnapshot(await buildIntelligencePlatformContext(input));
}

export async function getMarketIntelligenceSnapshot(input: IntelligencePlatformServiceInput = {}) {
  return buildMarketIntelligenceSnapshot(await buildIntelligencePlatformContext(input));
}

export async function getRiskIntelligenceSnapshot(input: IntelligencePlatformServiceInput = {}) {
  return buildRiskIntelligenceSnapshot(await buildIntelligencePlatformContext(input));
}

export async function getFcnIntelligenceSnapshot(input: IntelligencePlatformServiceInput = {}) {
  return buildFcnIntelligenceSnapshot(await buildIntelligencePlatformContext(input));
}

export async function getTodayFocusV2(input: IntelligencePlatformServiceInput = {}) {
  const context = await buildIntelligencePlatformContext(input);
  const portfolio = buildPortfolioIntelligenceSnapshot(context);
  const market = buildMarketIntelligenceSnapshot(context);
  const risk = buildRiskIntelligenceSnapshot(context);
  const fcn = buildFcnIntelligenceSnapshot(context);

  return buildTodayFocusV2(context, {
    fcn,
    market,
    portfolio,
    risk,
  });
}

export async function getIntelligencePlatformDiagnostics(input: IntelligencePlatformServiceInput = {}) {
  return (await getIntelligencePlatformSnapshot(input)).diagnostics;
}

export async function getIntelligencePlatformSnapshot(
  input: IntelligencePlatformServiceInput = {},
): Promise<IntelligencePlatformSnapshot> {
  const context = await buildIntelligencePlatformContext(input);
  const portfolio = buildPortfolioIntelligenceSnapshot(context);
  const market = buildMarketIntelligenceSnapshot(context);
  const risk = buildRiskIntelligenceSnapshot(context);
  const fcn = buildFcnIntelligenceSnapshot(context);
  const todayFocus = buildTodayFocusV2(context, {
    fcn,
    market,
    portfolio,
    risk,
  });
  const partialSnapshot = {
    fcn,
    generatedAt: context.generatedAt,
    market,
    portfolio,
    risk,
    todayFocus,
  };

  return {
    ...partialSnapshot,
    diagnostics: buildIntelligencePlatformDiagnostics(partialSnapshot, context.errors),
  };
}

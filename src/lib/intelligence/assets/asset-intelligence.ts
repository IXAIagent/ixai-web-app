import type { EditorialProviderCoverageArea } from "@/src/lib/editorial/providers";
import type { PositionValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import type { WorkspaceWatchlistItemReadback } from "@/src/lib/watchlist/watchlist-types";
import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";
import { buildAssetHealth } from "@/src/lib/intelligence/assets/asset-health";
import { buildAssetReadiness } from "@/src/lib/intelligence/assets/asset-readiness";
import type {
  AssetCoverage,
  AssetCurrency,
  AssetIntelligence,
  AssetIntelligenceType,
  AssetMarket,
  AssetQuality,
  AssetStateStatus,
  RelatedAssetReference,
} from "@/src/lib/intelligence/assets/asset-types";

function clamp(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function normalizeCurrency(currency: string | null | undefined): AssetCurrency {
  const normalized = (currency ?? "UNKNOWN").toUpperCase();
  if (["EUR", "HKD", "JPY", "KRW", "MIXED", "TWD", "USD", "USDT"].includes(normalized)) {
    return normalized as AssetCurrency;
  }
  return "UNKNOWN";
}

function inferMarket(symbol: string, fallback?: string | null): AssetMarket {
  const normalizedFallback = (fallback ?? "").toLowerCase();
  const normalizedSymbol = normalizeSymbol(symbol);

  if (normalizedFallback.includes("crypto") || ["BTC", "ETH", "BNB", "BTCUSDT", "ETHUSDT"].includes(normalizedSymbol)) {
    return "crypto";
  }

  if (normalizedFallback === "tw" || normalizedFallback.includes("taiwan") || /^\d{4}$/.test(normalizedSymbol)) {
    return "tw";
  }

  if (normalizedFallback === "hk" || normalizedSymbol.endsWith(".HK")) {
    return "hk";
  }

  if (normalizedFallback === "jp" || normalizedSymbol.endsWith(".T")) {
    return "jp";
  }

  if (normalizedFallback === "kr" || normalizedSymbol.endsWith(".KS")) {
    return "kr";
  }

  if (normalizedFallback === "eu") {
    return "eu";
  }

  if (normalizedSymbol === "CASH") {
    return "cash";
  }

  return normalizedFallback ? "global" : "us";
}

function inferTypeFromSymbol(symbol: string, fallback?: string): AssetIntelligenceType {
  const normalizedFallback = (fallback ?? "").toLowerCase();
  const normalizedSymbol = normalizeSymbol(symbol);

  if (normalizedFallback.includes("fcn")) return "fcn";
  if (normalizedFallback.includes("crypto") || ["BTC", "ETH", "BNB", "BTCUSDT", "ETHUSDT"].includes(normalizedSymbol)) return "crypto";
  if (normalizedFallback.includes("etf") || ["SPY", "QQQ", "VOO", "TLT"].includes(normalizedSymbol)) return "etf";
  if (normalizedSymbol === "CASH") return "cash";
  return "stock";
}

function coverageForAsset(input: {
  hasEvent?: boolean;
  hasNews?: boolean;
  hasPrice?: boolean;
  market: AssetMarket;
  type: AssetIntelligenceType;
}): AssetCoverage {
  const areas = new Set<EditorialProviderCoverageArea>();
  if (input.market === "us") areas.add("us");
  if (input.market === "tw") areas.add("taiwan");
  if (input.market === "crypto" || input.type === "crypto") areas.add("crypto");
  if (input.type === "fcn") areas.add("fcn");
  if (input.type === "stock" || input.type === "etf") areas.add("technology");
  areas.add("macro");

  const score = clamp(
    (input.hasPrice ? 0.35 : 0) +
      (input.hasNews ? 0.25 : 0) +
      (input.hasEvent ? 0.15 : 0) +
      Math.min(0.25, areas.size * 0.04),
  );
  const required: EditorialProviderCoverageArea[] = ["macro", "us", "taiwan", "crypto", "fcn", "technology"];

  return {
    areas: Array.from(areas),
    missing: required.filter((area) => !areas.has(area)),
    score,
  };
}

function qualityForAsset(input: { coverageScore: number; hasPrice?: boolean; hasNews?: boolean }): AssetQuality {
  const confidence = clamp((input.hasPrice ? 0.38 : 0) + (input.hasNews ? 0.26 : 0) + input.coverageScore * 0.36);

  return {
    confidence,
    score: confidence,
    sourceDiversity: input.hasPrice && input.hasNews ? 0.68 : input.hasPrice || input.hasNews ? 0.42 : 0.16,
  };
}

function buildAsset(input: {
  displayName: string;
  eventStatus?: AssetStateStatus;
  id: string;
  lastUpdated?: string | null;
  market?: AssetMarket;
  monitoringScope: "manual" | "placeholder" | "portfolio" | "watchlist";
  newsStatus?: AssetStateStatus;
  price?: number | null;
  priceStatus?: AssetStateStatus;
  relatedAssets?: RelatedAssetReference[];
  relatedFcn?: RelatedAssetReference[];
  relatedWatchlist?: RelatedAssetReference[];
  riskDetail?: string;
  riskLevel?: "attention" | "critical" | "normal" | "unknown";
  status?: AssetIntelligence["status"];
  symbol: string;
  type: AssetIntelligenceType;
  currency?: string | null;
}): AssetIntelligence {
  const lastUpdated = input.lastUpdated ?? new Date().toISOString();
  const market = input.market ?? inferMarket(input.symbol);
  const priceStatus = input.priceStatus ?? (input.price == null ? "missing" : "available");
  const newsStatus = input.newsStatus ?? "limited";
  const eventStatus = input.eventStatus ?? (input.type === "cash" ? "not_applicable" : "limited");
  const coverage = coverageForAsset({
    hasEvent: eventStatus === "available" || eventStatus === "limited",
    hasNews: newsStatus === "available" || newsStatus === "limited",
    hasPrice: priceStatus === "available" || priceStatus === "limited",
    market,
    type: input.type,
  });
  const quality = qualityForAsset({
    coverageScore: coverage.score,
    hasNews: newsStatus === "available" || newsStatus === "limited",
    hasPrice: priceStatus === "available" || priceStatus === "limited",
  });
  const health = buildAssetHealth({
    coverageScore: coverage.score,
    eventStatus,
    newsStatus,
    priceStatus,
    qualityScore: quality.score,
  });
  const diagnostics = {
    assetCount: 1,
    generatedAt: lastUpdated,
    healthyAssets: health.status === "healthy" ? 1 : 0,
    missingCoverage: coverage.score < 0.35 ? 1 : 0,
    missingNews: newsStatus === "missing" ? 1 : 0,
    missingPrice: priceStatus === "missing" ? 1 : 0,
    offlineAssets: health.status === "offline" ? 1 : 0,
    warningAssets: health.status === "degraded" ? 1 : 0,
  };

  return {
    assetType: input.type,
    coverage,
    currency: normalizeCurrency(input.currency),
    displayName: input.displayName,
    eventState: {
      asOf: lastUpdated,
      detail: eventStatus === "not_applicable" ? "No event coverage required for this asset." : "Event coverage is prepared for future monitoring.",
      source: "editorial",
      status: eventStatus,
    },
    health,
    id: input.id,
    lastUpdated,
    market,
    monitoringState: {
      asOf: lastUpdated,
      enabled: input.monitoringScope !== "placeholder",
      scope: input.monitoringScope,
      source: input.monitoringScope === "manual" || input.monitoringScope === "placeholder"
        ? "derived"
        : input.monitoringScope,
      status: input.monitoringScope === "placeholder" ? "limited" : "available",
    },
    newsState: {
      asOf: lastUpdated,
      detail: newsStatus === "missing" ? "No news relationship is available yet." : "News relationship is ready for future relevance matching.",
      source: "editorial",
      status: newsStatus,
    },
    priceState: {
      asOf: lastUpdated,
      currency: normalizeCurrency(input.currency),
      price: input.price ?? null,
      source: "market",
      status: priceStatus,
    },
    quality,
    readiness: buildAssetReadiness(diagnostics),
    relatedAssets: input.relatedAssets ?? [],
    relatedFcn: input.relatedFcn ?? [],
    relatedWatchlist: input.relatedWatchlist ?? [],
    riskState: {
      asOf: lastUpdated,
      detail: input.riskDetail ?? "Risk state is derived from existing portfolio / FCN / watchlist context.",
      level: input.riskLevel ?? "unknown",
      source: "derived",
      status: input.riskLevel && input.riskLevel !== "unknown" ? "available" : "limited",
    },
    status: input.status ?? "monitoring",
    symbol: normalizeSymbol(input.symbol),
    themes: [],
  };
}

export function createAssetIntelligenceFromPortfolioPosition(position: PositionValuation): AssetIntelligence {
  const assetType = position.assetClass === "crypto" ? "crypto" : position.assetClass === "fcn" ? "fcn" : inferTypeFromSymbol(position.symbol, position.assetClass);

  return buildAsset({
    currency: position.currency,
    displayName: position.name,
    id: `portfolio:${position.id}`,
    lastUpdated: new Date().toISOString(),
    market: inferMarket(position.symbol),
    monitoringScope: "portfolio",
    newsStatus: "limited",
    price: position.marketPrice,
    priceStatus: position.marketPrice == null ? "missing" : "available",
    riskDetail: position.warningMessage,
    riskLevel: position.fcnRiskStatus === "unavailable" ? "attention" : position.nearestKiDistancePercent != null && position.nearestKiDistancePercent < 10 ? "critical" : "normal",
    status: "active",
    symbol: position.symbol,
    type: assetType,
  });
}

function relatedUnderlying(underlying: FCNUnderlying): RelatedAssetReference {
  return {
    id: `fcn-underlying:${normalizeSymbol(underlying.symbol)}`,
    label: underlying.name ?? normalizeSymbol(underlying.symbol),
    relationship: "same_fcn",
    symbol: normalizeSymbol(underlying.symbol),
  };
}

export function createAssetIntelligenceFromFcnPosition(position: FCNPosition): AssetIntelligence {
  const worstOf = position.worstOfSummary;

  return buildAsset({
    currency: position.currency,
    displayName: position.name,
    eventStatus: position.observationSchedule.length > 0 ? "available" : "limited",
    id: `fcn:${position.id}`,
    lastUpdated: position.updatedAt,
    market: "global",
    monitoringScope: "portfolio",
    newsStatus: "limited",
    price: position.notionalAmount,
    priceStatus: position.notionalAmount == null ? "limited" : "available",
    relatedAssets: position.underlyings.map(relatedUnderlying),
    riskDetail: worstOf.worstUnderlyingSymbol
      ? `Worst-of underlying: ${worstOf.worstUnderlyingSymbol}.`
      : "Worst-of relationship is not available yet.",
    riskLevel:
      worstOf.status === "missing_current_price" || worstOf.status === "missing_underlyings"
        ? "attention"
        : (worstOf.worstUnderlyingReturnPct ?? 0) < -25
          ? "critical"
          : "normal",
    status: position.status === "active" ? "monitoring" : "archived",
    symbol: position.name,
    type: "fcn",
  });
}

export function createAssetIntelligenceFromWatchlistItem(item: WorkspaceWatchlistItemReadback): AssetIntelligence {
  const quote = item.quote?.quote;
  const type = item.assetType === "crypto" ? "crypto" : item.assetType === "stock" ? inferTypeFromSymbol(item.symbol, "stock") : "watchlist";

  return buildAsset({
    currency: quote?.currency,
    displayName: item.name,
    id: `watchlist:${item.id}`,
    lastUpdated: item.updatedAt ?? quote?.updatedAt,
    market: inferMarket(item.symbol, item.assetType),
    monitoringScope: "watchlist",
    newsStatus: item.note ? "limited" : "missing",
    price: quote?.price ?? null,
    priceStatus: item.quoteStatus === "available" ? "available" : "missing",
    relatedWatchlist: [
      {
        id: `watchlist:${item.id}`,
        label: item.name,
        relationship: "same_watchlist",
        symbol: item.symbol,
      },
    ],
    riskDetail: item.note,
    riskLevel: item.alertAbove || item.alertBelow ? "attention" : "unknown",
    status: "monitoring",
    symbol: item.symbol,
    type,
  });
}

export function createPlaceholderAssetIntelligence(type: AssetIntelligence["assetType"], generatedAt: string): AssetIntelligence {
  const symbol = type === "cash" ? "CASH" : "FUTURE";

  return buildAsset({
    currency: type === "cash" ? "USD" : "UNKNOWN",
    displayName: type === "cash" ? "Cash" : "Future Asset",
    eventStatus: "not_applicable",
    id: `placeholder:${type}`,
    lastUpdated: generatedAt,
    market: type === "cash" ? "cash" : "future",
    monitoringScope: "placeholder",
    newsStatus: "missing",
    price: null,
    priceStatus: "missing",
    riskLevel: "unknown",
    status: "placeholder",
    symbol,
    type,
  });
}

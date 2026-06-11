"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Crown,
  Database,
  Layers3,
  LineChart,
  ShieldAlert,
} from "lucide-react";

import { PortfolioArchitectureMap } from "@/components/portfolio/portfolio-architecture-map";
import { FeatureIcon } from "@/components/ui/feature-icon";
import type { AssetCategory } from "@/src/lib/portfolio/assets";
import { PORTFOLIO_ASSET_CATEGORIES } from "@/src/lib/portfolio/assets";
import { buildPortfolioCommentary } from "@/src/lib/portfolio/commentary/commentary-builder";
import type { PortfolioCommentaryFeed } from "@/src/lib/portfolio/commentary/commentary-types";
import { buildPortfolioConcentration } from "@/src/lib/portfolio/concentration/concentration-builder";
import type {
  PortfolioConcentrationItem,
  PortfolioConcentrationReport,
} from "@/src/lib/portfolio/concentration/concentration-types";
import { buildPortfolioCorrelation } from "@/src/lib/portfolio/correlation/correlation-builder";
import type {
  PortfolioCorrelationPair,
  PortfolioCorrelationReport,
} from "@/src/lib/portfolio/correlation/correlation-types";
import type { PortfolioDashboardSummary } from "@/src/lib/portfolio/dashboard";
import type {
  PortfolioAccount,
  PortfolioAccountProvider,
} from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";
import type { PortfolioInputRegion } from "@/src/lib/portfolio/input/asset-types";
import { buildPortfolioExposure } from "@/src/lib/portfolio/exposure/exposure-builder";
import type {
  PortfolioExposureItem,
  PortfolioExposureReport,
} from "@/src/lib/portfolio/exposure/exposure-types";
import { buildPortfolioIntelligence } from "@/src/lib/portfolio/intelligence-engine/intelligence-score-builder";
import type { PortfolioIntelligenceScore } from "@/src/lib/portfolio/intelligence-engine/intelligence-engine-types";
import { buildPortfolioMarketSnapshots } from "@/src/lib/portfolio/market-data/market-data-builder";
import type { PortfolioMarketDataFeed } from "@/src/lib/portfolio/market-data/market-data-types";
import { buildPortfolioNewsFeed } from "@/src/lib/portfolio/news/news-service";
import type { PortfolioNewsFeed } from "@/src/lib/portfolio/news/news-types";
import { buildPortfolioRecommendations } from "@/src/lib/portfolio/recommendation/recommendation-builder";
import type { PortfolioRecommendationReport } from "@/src/lib/portfolio/recommendation/recommendation-types";
import { getPortfolioRepository } from "@/src/lib/portfolio/repository/portfolio-persistence-provider";
import type { PortfolioOwnershipValidationStatus } from "@/src/lib/portfolio/repository/portfolio-repository";
import { buildPortfolioRiskReport } from "@/src/lib/portfolio/risk/risk-score-builder";
import type { PortfolioRiskReport } from "@/src/lib/portfolio/risk/risk-types";
import { buildPortfolioValuation } from "@/src/lib/portfolio/valuation/valuation-builder";
import type {
  PortfolioAllocationItem,
  PortfolioValuationReport,
} from "@/src/lib/portfolio/valuation/valuation-types";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";

type DashboardResponse = {
  ok: boolean;
  summary?: PortfolioDashboardSummary;
};

const ASSET_CATEGORY_LABEL: Record<AssetCategory, string> = {
  CASH: "Cash",
  CRYPTO: "Crypto",
  DUAL: "Dual",
  FCN: "FCN",
  GRID: "Grid",
  STOCK: "Stock",
};

const TIER_LABEL = {
  basic: "IXAI Basic",
  free: "IXAI Free",
  pro: "IXAI Pro",
} as const;

const FEATURE_LABELS = [
  ["Portfolio", "canViewPortfolio"],
  ["FCN", "canViewFcn"],
  ["Risk", "canViewRisk"],
  ["Pro", "canViewPro"],
] as const;

const PORTFOLIO_ACCOUNT_PROVIDERS: PortfolioAccountProvider[] = [
  "MANUAL",
  "BINANCE",
  "BYBIT",
  "OKX",
  "CTBC",
  "FUBON",
  "YUANTA",
  "IBKR",
  "FIRSTRRADE",
  "CSV",
];

const PORTFOLIO_REGIONS: PortfolioInputRegion[] = [
  "TW",
  "HK",
  "CN",
  "JP",
  "KR",
  "US",
  "EU",
  "GLOBAL",
];

const portfolioRepository = getPortfolioRepository("supabase");

function numberLabel(value: number) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function formatApprox(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

function formatSignedMoney(value: number) {
  if (!Number.isFinite(value) || value === 0) {
    return "0";
  }

  return `${value > 0 ? "+" : "-"}${formatMoney(value)}`;
}

function formatPercent(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatShare(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return `${value.toFixed(1)}%`;
}

function formatConfidence(value: number) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return `${Math.round(value * 100)}%`;
}

function getPortfolioStatusCopy(status: PortfolioDashboardSummary["portfolioStatus"]) {
  return {
    "Elevated Risk": "風險升高",
    "High Risk": "高風險",
    Healthy: "健康",
    Watch: "觀察",
  }[status];
}

function percentageLabel(count: number, total: number) {
  if (total <= 0 || count <= 0) {
    return "0.0%";
  }

  return `${((count / total) * 100).toFixed(1)}%`;
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>(
    (counts, value) => ({
      ...counts,
      [value]: (counts[value] ?? 0) + 1,
    }),
    {} as Record<T, number>,
  );
}

function AllocationGroup({
  items,
  title,
}: {
  items: PortfolioAllocationItem[];
  title: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
      <h3 className="text-base font-semibold text-[var(--ixai-forest)]">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div className="grid gap-2" key={item.key}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-[var(--ixai-forest)]">
                  {item.label}
                </span>
                <span className="font-mono text-[var(--ixai-forest-soft)]">
                  {formatMoney(item.marketValue)} · {formatShare(item.sharePercent)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(9,41,31,0.08)]">
                <div
                  className="h-full rounded-full bg-[var(--ixai-gold)]"
                  style={{ width: `${Math.max(0, Math.min(100, item.sharePercent))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          目前沒有可計算的 allocation。
        </p>
      )}
    </div>
  );
}

function ExposureGroup({
  items,
  title,
}: {
  items: PortfolioExposureItem[];
  title: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
      <h3 className="text-base font-semibold text-[var(--ixai-forest)]">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div className="grid gap-2" key={`${item.category}-${item.key}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-[var(--ixai-forest)]">
                  {item.label}
                </span>
                <span className="font-mono text-[var(--ixai-forest-soft)]">
                  {formatMoney(item.marketValue)} · {formatShare(item.percentage)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(9,41,31,0.08)]">
                <div
                  className="h-full rounded-full bg-[var(--ixai-gold)]"
                  style={{ width: `${Math.max(0, Math.min(100, item.percentage))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          目前沒有可計算的 exposure。
        </p>
      )}
    </div>
  );
}

function ConcentrationMetric({
  item,
  label,
}: {
  item: PortfolioConcentrationItem | null | undefined;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
        {label}
      </p>
      <p className="mt-2 break-words text-xl font-semibold text-[var(--ixai-forest)]">
        {item?.label ?? "--"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-[rgba(176,141,87,0.38)] bg-[rgba(176,141,87,0.10)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
          {item?.level ?? "LOW"}
        </span>
        <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          {formatShare(item?.percentage ?? null)}
        </span>
      </div>
      <p className="mt-3 font-mono text-sm text-[var(--ixai-forest-soft)]">
        {formatMoney(item?.marketValue ?? 0)}
      </p>
    </div>
  );
}

function CorrelationPairCard({ pair }: { pair: PortfolioCorrelationPair }) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="break-words text-lg font-semibold text-[var(--ixai-forest)]">
          {pair.leftLabel} ↔ {pair.rightLabel}
        </p>
        <span className="rounded-full border border-[rgba(176,141,87,0.38)] bg-[rgba(176,141,87,0.10)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
          {pair.level}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          Score {numberLabel(pair.score)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {pair.rationale}
      </p>
    </article>
  );
}

export function PortfolioCenterDashboard() {
  const [summary, setSummary] = useState<PortfolioDashboardSummary | null>(null);
  const [ownershipStatus, setOwnershipStatus] =
    useState<PortfolioOwnershipValidationStatus | null>(null);
  const [repositoryAccounts, setRepositoryAccounts] = useState<PortfolioAccount[]>([]);
  const [repositoryAssets, setRepositoryAssets] = useState<PortfolioAsset[]>([]);
  const [repositoryPositions, setRepositoryPositions] = useState<PortfolioPosition[]>([]);
  const [portfolioMarketDataFeed, setPortfolioMarketDataFeed] =
    useState<PortfolioMarketDataFeed | null>(null);
  const [portfolioValuationReport, setPortfolioValuationReport] =
    useState<PortfolioValuationReport | null>(null);
  const [portfolioExposureReport, setPortfolioExposureReport] =
    useState<PortfolioExposureReport | null>(null);
  const [portfolioConcentrationReport, setPortfolioConcentrationReport] =
    useState<PortfolioConcentrationReport | null>(null);
  const [portfolioCorrelationReport, setPortfolioCorrelationReport] =
    useState<PortfolioCorrelationReport | null>(null);
  const [portfolioNewsFeed, setPortfolioNewsFeed] = useState<PortfolioNewsFeed | null>(null);
  const [portfolioCommentaryFeed, setPortfolioCommentaryFeed] =
    useState<PortfolioCommentaryFeed | null>(null);
  const [portfolioIntelligenceScore, setPortfolioIntelligenceScore] =
    useState<PortfolioIntelligenceScore | null>(null);
  const [portfolioRiskReport, setPortfolioRiskReport] =
    useState<PortfolioRiskReport | null>(null);
  const [portfolioRecommendationReport, setPortfolioRecommendationReport] =
    useState<PortfolioRecommendationReport | null>(null);
  const [status, setStatus] = useState<"error" | "loading" | "ready" | "unauthenticated">(
    "loading",
  );

  const loadSummary = useCallback(async () => {
    setStatus("loading");

    const headers = await getSupabaseAuthorizationHeaders();

    if (!headers) {
      setSummary(null);
      setOwnershipStatus(null);
      setPortfolioMarketDataFeed(null);
      setPortfolioValuationReport(null);
      setPortfolioExposureReport(null);
      setPortfolioConcentrationReport(null);
      setPortfolioCorrelationReport(null);
      setPortfolioNewsFeed(null);
      setPortfolioCommentaryFeed(null);
      setPortfolioIntelligenceScore(null);
      setPortfolioRiskReport(null);
      setPortfolioRecommendationReport(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const [
        response,
        repositoryOwnershipStatus,
        accounts,
        assets,
        positions,
      ] = await Promise.all([
        fetch("/api/portfolio/dashboard", {
          cache: "no-store",
          headers,
        }),
        portfolioRepository.getOwnershipValidationStatus(),
        portfolioRepository.getAccounts(),
        portfolioRepository.getAssets(),
        portfolioRepository.getPositions(),
      ]);
      const marketDataFeed = await buildPortfolioMarketSnapshots({ assets });
      const valuationReport = await buildPortfolioValuation({
        accounts,
        assets,
        marketDataFeed,
        positions,
      });
      const exposureReport = await buildPortfolioExposure({
        accounts,
        assets,
        marketDataFeed,
        positions,
        valuationReport,
      });
      const concentrationReport = await buildPortfolioConcentration({
        exposureReport,
      });
      const correlationReport = await buildPortfolioCorrelation({
        concentrationReport,
        exposureReport,
      });
      const newsFeed = await buildPortfolioNewsFeed({ assets });
      const commentaryFeed = await buildPortfolioCommentary({ newsFeed });
      const intelligenceScore = await buildPortfolioIntelligence({
        accounts,
        assets,
        commentary: commentaryFeed,
        newsFeed,
      });
      const riskReport = await buildPortfolioRiskReport({
        accounts,
        assets,
        positions,
      });
      const recommendationReport = await buildPortfolioRecommendations({
        riskReport,
      });
      const payload = (await response.json().catch(() => ({}))) as DashboardResponse;

      if (!response.ok || !payload.summary) {
        setSummary(payload.summary ?? null);
        setOwnershipStatus(repositoryOwnershipStatus);
        setRepositoryAccounts(accounts);
        setRepositoryAssets(assets);
        setRepositoryPositions(positions);
        setPortfolioMarketDataFeed(marketDataFeed);
        setPortfolioValuationReport(valuationReport);
        setPortfolioExposureReport(exposureReport);
        setPortfolioConcentrationReport(concentrationReport);
        setPortfolioCorrelationReport(correlationReport);
        setPortfolioNewsFeed(newsFeed);
        setPortfolioCommentaryFeed(commentaryFeed);
        setPortfolioIntelligenceScore(intelligenceScore);
        setPortfolioRiskReport(riskReport);
        setPortfolioRecommendationReport(recommendationReport);
        setStatus(response.status === 401 ? "unauthenticated" : "error");
        return;
      }

      setSummary(payload.summary);
      setOwnershipStatus(repositoryOwnershipStatus);
      setRepositoryAccounts(accounts);
      setRepositoryAssets(assets);
      setRepositoryPositions(positions);
      setPortfolioMarketDataFeed(marketDataFeed);
      setPortfolioValuationReport(valuationReport);
      setPortfolioExposureReport(exposureReport);
      setPortfolioConcentrationReport(concentrationReport);
      setPortfolioCorrelationReport(correlationReport);
      setPortfolioNewsFeed(newsFeed);
      setPortfolioCommentaryFeed(commentaryFeed);
      setPortfolioIntelligenceScore(intelligenceScore);
      setPortfolioRiskReport(riskReport);
      setPortfolioRecommendationReport(recommendationReport);
      setStatus("ready");
    } catch {
      setSummary(null);
      setOwnershipStatus(null);
      setRepositoryAccounts([]);
      setRepositoryAssets([]);
      setRepositoryPositions([]);
      setPortfolioMarketDataFeed(null);
      setPortfolioValuationReport(null);
      setPortfolioExposureReport(null);
      setPortfolioConcentrationReport(null);
      setPortfolioCorrelationReport(null);
      setPortfolioNewsFeed(null);
      setPortfolioCommentaryFeed(null);
      setPortfolioIntelligenceScore(null);
      setPortfolioRiskReport(null);
      setPortfolioRecommendationReport(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSummary();
    });
  }, [loadSummary]);

  const assetCategories = summary?.portfolioAssetCategories ?? [];
  const assetAllocationSummary = summary?.assetAllocationSummary ?? [];
  const assetCategoryCounts = summary?.assetCategoryCounts;
  const repositoryAssetCategoryCounts = useMemo(
    () => countBy(repositoryAssets.map((asset) => asset.category)),
    [repositoryAssets],
  );
  const repositoryProviderCounts = useMemo(
    () => countBy(repositoryAccounts.map((account) => account.provider)),
    [repositoryAccounts],
  );
  const repositoryRegionCounts = useMemo(
    () => countBy([
      ...repositoryAccounts.map((account) => account.region),
      ...repositoryAssets.map((asset) => asset.region),
    ]),
    [repositoryAccounts, repositoryAssets],
  );
  const repositoryRegionTotal = repositoryAccounts.length + repositoryAssets.length;
  const intelligenceUniverse = portfolioNewsFeed?.universe;
  const marketSnapshots = portfolioMarketDataFeed?.snapshots.slice(0, 8) ?? [];
  const portfolioValuation = portfolioValuationReport?.valuation;
  const portfolioAllocation = portfolioValuationReport?.allocation;
  const topExposureItems = portfolioExposureReport?.topExposures.slice(0, 5) ?? [];
  const latestHeadlines = portfolioNewsFeed?.items.slice(0, 5) ?? [];
  const latestCommentary = portfolioCommentaryFeed?.items.slice(0, 5) ?? [];
  const entitlements = summary?.entitlements;
  const fcnWorstOfRanking = useMemo(
    () => summary?.fcnWorstOfRanking?.slice(0, 5) ?? [],
    [summary?.fcnWorstOfRanking],
  );
  const fcnExposureSummary = useMemo(
    () => summary?.fcnExposureSummary?.slice(0, 5) ?? [],
    [summary?.fcnExposureSummary],
  );
  const monitoringHighlights = summary?.monitoringHighlights?.slice(0, 5) ?? [];

  if (status === "loading") {
    return (
      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white p-5 text-sm leading-7 text-[var(--ixai-forest-soft)] shadow-[0_18px_48px_rgba(9,41,31,0.07)]">
        正在讀取 Portfolio Center...
      </section>
    );
  }

  if (status === "unauthenticated") {
    return (
      <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[rgba(176,141,87,0.08)] p-5 text-sm leading-7 text-[var(--ixai-forest)]">
        登入後即可查看 Portfolio Center，包含資產配置、FCN 風險與會員權限狀態。
      </section>
    );
  }

  if (status === "error" || !summary) {
    return (
      <section className="rounded-2xl border border-[color-mix(in_srgb,var(--ixai-risk-watch)_38%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_9%,white)] p-5 text-sm leading-7 text-[var(--ixai-forest)]">
        暫時無法讀取 Portfolio Center。請稍後再試，或確認資料層設定已完成。
      </section>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white p-5 shadow-[0_18px_48px_rgba(9,41,31,0.07)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
              我的 IXAI 投資組合主控台
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              這裡彙整已儲存的 Portfolio、FCN、Stock、Crypto 與權限狀態，作為未來 Pro 工作區基礎。
            </p>
          </div>
          <FeatureIcon icon={BriefcaseBusiness} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Health Score", `${numberLabel(summary.portfolioHealthScore)} / 100`],
            ["Risk Score", `${numberLabel(summary.portfolioRiskScore)} / 100`],
            ["Status", getPortfolioStatusCopy(summary.portfolioStatus)],
            ["Membership", TIER_LABEL[summary.membershipTier]],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <PortfolioArchitectureMap />

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Ownership Validation Status
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Supabase Persistence Ownership
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v1.95 驗證 Portfolio Persistence 由目前登入使用者讀取，不使用 mock fallback 或 client-side 偽隔離。
            </p>
          </div>
          <FeatureIcon icon={Database} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Current User ID", ownershipStatus?.currentUserId ?? "unauthenticated"],
            ["Current Account ID", ownershipStatus?.currentAccountId ?? "none"],
            ["Account Count", ownershipStatus?.accountCount ?? 0],
            ["Asset Count", ownershipStatus?.assetCount ?? 0],
            ["Position Count", ownershipStatus?.positionCount ?? 0],
            ["Repository Source", ownershipStatus?.repositorySource ?? "pending"],
            ["RLS Status", ownershipStatus?.rlsStatus ?? "pending"],
          ].map(([label, value]) => (
            <div
              className="min-w-0 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 break-words font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                {value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Ownership validation 僅顯示目前 session 可讀取的 owner-scoped records；跨使用者隔離由 Supabase RLS 與 user_id 查詢共同保護。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Dashboard Foundation
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Repository-driven Portfolio Dashboard
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v1.96 以 Repository Layer 直接讀取 accounts、assets 與 positions，建立第一版可視化 dashboard。
            </p>
          </div>
          <FeatureIcon icon={BadgeCheck} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Total Accounts", repositoryAccounts.length],
            ["Total Assets", repositoryAssets.length],
            ["Total Positions", repositoryPositions.length],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ixai-forest)]">
                {numberLabel(Number(value))}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
              Asset Category Allocation
            </h3>
            <div className="mt-4 grid gap-3">
              {PORTFOLIO_ASSET_CATEGORIES.map((category) => {
                const count = repositoryAssetCategoryCounts[category] ?? 0;
                const share = percentageLabel(count, repositoryAssets.length);

                return (
                  <div className="grid gap-2" key={category}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-[var(--ixai-forest)]">
                        {ASSET_CATEGORY_LABEL[category]}
                      </span>
                      <span className="font-mono text-[var(--ixai-forest-soft)]">
                        {numberLabel(count)} · {share}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(9,41,31,0.08)]">
                      <div
                        className="h-full rounded-full bg-[var(--ixai-gold)]"
                        style={{ width: share }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
              Dashboard Status
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Foundation", "Enabled"],
                ["Repository Source", ownershipStatus?.repositorySource ?? "pending"],
                ["Ownership Validation", "Enabled"],
                ["Persistence Layer", "Enabled"],
              ].map(([label, value]) => (
                <div
                  className="min-w-0 rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                  key={label}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                    {label}
                  </p>
                  <p className="mt-2 break-words font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
              Provider Allocation
            </h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {PORTFOLIO_ACCOUNT_PROVIDERS.map((provider) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.68)] p-3 text-sm"
                  key={provider}
                >
                  <span className="font-semibold text-[var(--ixai-forest)]">{provider}</span>
                  <span className="font-mono text-[var(--ixai-forest-soft)]">
                    {numberLabel(repositoryProviderCounts[provider] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
              Region Allocation
            </h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {PORTFOLIO_REGIONS.map((region) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.68)] p-3 text-sm"
                  key={region}
                >
                  <span className="font-semibold text-[var(--ixai-forest)]">{region}</span>
                  <span className="font-mono text-[var(--ixai-forest-soft)]">
                    {numberLabel(repositoryRegionCounts[region] ?? 0)} ·{" "}
                    {percentageLabel(repositoryRegionCounts[region] ?? 0, repositoryRegionTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Dashboard Foundation 僅做資料視覺化；不包含新聞、AI commentary、券商同步、CSV import processing、行情或交易功能。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Exposure Engine
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Mock Exposure Dashboard Foundation
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v2.05 使用 Portfolio Valuation、mock market snapshots 與 repository assets 產生 exposure readback，協助理解 asset type、symbol、region 與 provider 集中度。
            </p>
          </div>
          <FeatureIcon icon={Layers3} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Market Value", formatMoney(portfolioExposureReport?.totalMarketValue ?? 0)],
            ["Top Exposure Count", numberLabel(topExposureItems.length)],
            ["Generated Time", portfolioExposureReport?.generatedAt ?? "--"],
            ["Engine Source", portfolioExposureReport ? "mock" : "pending"],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 break-words text-lg font-semibold text-[var(--ixai-forest)] sm:text-2xl">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Top Exposures
          </h3>
          {topExposureItems.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {topExposureItems.map((item) => (
                <article
                  className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.70)] p-3"
                  key={`${item.category}-${item.key}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[rgba(176,141,87,0.38)] bg-[rgba(176,141,87,0.10)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
                      {item.category}
                    </span>
                    <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {formatShare(item.percentage)}
                    </span>
                  </div>
                  <p className="mt-3 break-words text-xl font-semibold text-[var(--ixai-forest)]">
                    {item.label}
                  </p>
                  <p className="mt-2 font-mono text-sm text-[var(--ixai-forest-soft)]">
                    {formatMoney(item.marketValue)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              目前沒有可顯示的 top exposure。
            </p>
          )}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <ExposureGroup
            items={portfolioExposureReport?.assetTypeExposure ?? []}
            title="Asset Type Exposure"
          />
          <ExposureGroup
            items={portfolioExposureReport?.symbolExposure ?? []}
            title="Symbol / Underlying Exposure"
          />
          <ExposureGroup
            items={portfolioExposureReport?.regionExposure ?? []}
            title="Region Exposure"
          />
          <ExposureGroup
            items={portfolioExposureReport?.providerExposure ?? []}
            title="Provider Exposure"
          />
        </div>

        <p className="mt-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {portfolioExposureReport?.summary ??
            "Portfolio Exposure Engine is ready, but no exposure report is available yet."}
        </p>
        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio Exposure Engine Foundation 使用 deterministic mock exposure logic。僅供監控與風險意識，不構成投資建議、交易指令、價格目標、報酬承諾或自動交易。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Concentration Engine
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Mock Concentration Dashboard Foundation
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v2.06 將 Exposure Report 轉成集中度摘要，顯示 symbol、FCN underlying、asset type、provider 與 region 的最高集中度。
            </p>
          </div>
          <FeatureIcon icon={ShieldAlert} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Overall Concentration",
              portfolioConcentrationReport?.overallConcentration ?? "LOW",
            ],
            [
              "Concentration Score",
              numberLabel(portfolioConcentrationReport?.concentrationScore ?? 0),
            ],
            ["Alert Count", numberLabel(portfolioConcentrationReport?.alerts.length ?? 0)],
            ["Generated Time", portfolioConcentrationReport?.generatedAt ?? "--"],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 break-words text-lg font-semibold text-[var(--ixai-forest)] sm:text-2xl">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <ConcentrationMetric
            item={portfolioConcentrationReport?.topSymbol}
            label="Top Symbol"
          />
          <ConcentrationMetric
            item={portfolioConcentrationReport?.topFcnUnderlying}
            label="Top FCN Underlying"
          />
          <ConcentrationMetric
            item={portfolioConcentrationReport?.topAssetType}
            label="Top Asset Type"
          />
          <ConcentrationMetric
            item={portfolioConcentrationReport?.topProvider}
            label="Top Provider"
          />
          <ConcentrationMetric
            item={portfolioConcentrationReport?.topRegion}
            label="Top Region"
          />
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Alerts</h3>
            {portfolioConcentrationReport &&
            portfolioConcentrationReport.alerts.length > 0 ? (
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {portfolioConcentrationReport.alerts.map((alert) => (
                  <li
                    className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.08)] px-3 py-2"
                    key={alert}
                  >
                    {alert}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                目前沒有 concentration alert。
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Summary</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {portfolioConcentrationReport?.summary ??
                "Portfolio Concentration Engine is ready, but no concentration report is available yet."}
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio Concentration Engine Foundation 使用 deterministic mock concentration logic。僅供監控與風險意識，不構成投資建議、交易指令、價格目標、報酬承諾或自動交易。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Correlation Engine
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Mock Correlation Dashboard Foundation
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v2.07 將 Exposure Report 與 Concentration Report 轉成 deterministic mock correlation pairs，協助閱讀 TSLA / NVDA、BTC / ETH 等共振風險情境。
            </p>
          </div>
          <FeatureIcon icon={Layers3} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Correlation Score", numberLabel(portfolioCorrelationReport?.correlationScore ?? 0)],
            ["Correlation Risk Level", portfolioCorrelationReport?.level ?? "LOW"],
            ["High Count", numberLabel(portfolioCorrelationReport?.highCorrelationCount ?? 0)],
            ["Generated Time", portfolioCorrelationReport?.generatedAt ?? "--"],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 break-words text-lg font-semibold text-[var(--ixai-forest)] sm:text-2xl">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["High Correlation", portfolioCorrelationReport?.highCorrelationCount ?? 0],
            ["Medium Correlation", portfolioCorrelationReport?.mediumCorrelationCount ?? 0],
            ["Low Correlation", portfolioCorrelationReport?.lowCorrelationCount ?? 0],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
                {numberLabel(Number(value))}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Top Correlation Pairs
          </h3>
          {portfolioCorrelationReport &&
          portfolioCorrelationReport.topCorrelationPairs.length > 0 ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {portfolioCorrelationReport.topCorrelationPairs.map((pair) => (
                <CorrelationPairCard
                  key={`${pair.leftSymbol}-${pair.rightSymbol}`}
                  pair={pair}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              目前沒有 mock correlation pair。
            </p>
          )}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Alerts</h3>
            {portfolioCorrelationReport && portfolioCorrelationReport.alerts.length > 0 ? (
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {portfolioCorrelationReport.alerts.map((alert) => (
                  <li
                    className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.08)] px-3 py-2"
                    key={alert}
                  >
                    {alert}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                目前沒有 correlation alert。
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Summary</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {portfolioCorrelationReport?.summary ??
                "Portfolio Correlation Engine is ready, but no correlation report is available yet."}
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio Correlation Engine Foundation 使用 deterministic mock correlation logic。僅供監控與風險意識，不構成投資建議、交易指令、價格目標、報酬承諾或自動交易。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Market Data
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Mock Market Snapshot Foundation
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v2.03 將 Portfolio Asset 轉成 Intelligence Universe，再透過 deterministic mock provider 產生 Market Snapshot；目前不連接 Yahoo Finance、Binance、CoinGecko、Finnhub、Polygon 或任何真實行情。
            </p>
          </div>
          <FeatureIcon icon={LineChart} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Market Data Status", portfolioMarketDataFeed ? "Mock Enabled" : "Pending"],
            ["Provider Source", portfolioMarketDataFeed?.providerSource ?? "mock"],
            ["Tracked Symbols", portfolioMarketDataFeed?.totalSymbols ?? 0],
            ["Snapshot Count", portfolioMarketDataFeed?.snapshotCount ?? 0],
            ["Updated Time", portfolioMarketDataFeed?.updatedAt ?? "--"],
          ].map(([label, value]) => {
            const displayValue =
              typeof value === "number" ? numberLabel(value) : value;

            return (
              <div
                className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4"
                key={label}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  {label}
                </p>
                <p className="mt-2 break-words text-lg font-semibold text-[var(--ixai-forest)] sm:text-2xl">
                  {displayValue}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">
            Market Snapshot Cards
          </p>
          {marketSnapshots.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {marketSnapshots.map((snapshot) => (
                <article
                  className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.70)] p-3"
                  key={snapshot.symbol}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-[rgba(176,141,87,0.38)] bg-[rgba(176,141,87,0.10)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
                      {snapshot.symbol}
                    </span>
                    <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {snapshot.assetType}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-semibold text-[var(--ixai-forest)]">
                    {snapshot.currency} {formatApprox(snapshot.price)}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                    <div className="flex items-center justify-between gap-3">
                      <span>Daily Change</span>
                      <span className="font-mono text-[var(--ixai-forest)]">
                        {formatPercent(snapshot.dailyChangePercent)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Market Status</span>
                      <span className="font-mono text-[var(--ixai-forest)]">
                        {snapshot.marketStatus}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              目前沒有 mock market snapshot。新增支援標的後，Market Data Foundation 會顯示 deterministic snapshot cards。
            </p>
          )}
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio Market Data Foundation 僅使用 deterministic mock provider。僅供資料流驗證與風險監控 UI，不構成投資建議、即時行情、交易指令或績效承諾。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Valuation
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Mock Valuation Engine Foundation
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v2.04 使用 Repository Assets、Positions 與 mock market snapshots 建立 Portfolio Value 與 Allocation Metrics；目前不連接真實行情、券商或交易系統。
            </p>
          </div>
          <FeatureIcon icon={LineChart} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Cost Basis", formatMoney(portfolioValuation?.totalCostBasis ?? 0)],
            ["Total Market Value", formatMoney(portfolioValuation?.totalMarketValue ?? 0)],
            ["Unrealized P/L", formatSignedMoney(portfolioValuation?.unrealizedPnL ?? 0)],
            ["Unrealized Return", formatPercent(portfolioValuation?.unrealizedPnLPercent ?? 0)],
            ["Asset Count", numberLabel(portfolioValuation?.assetCount ?? 0)],
            ["Position Count", numberLabel(portfolioValuation?.positionCount ?? 0)],
            ["Provider Source", portfolioValuationReport?.providerSource ?? "mock"],
            ["Generated Time", portfolioValuation?.generatedAt ?? "--"],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 break-words text-lg font-semibold text-[var(--ixai-forest)] sm:text-2xl">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Allocation
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
              Asset Type、Provider 與 Region Allocation
            </h3>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <AllocationGroup
              items={portfolioAllocation?.byAssetType ?? []}
              title="Asset Type Allocation"
            />
            <AllocationGroup
              items={portfolioAllocation?.byProvider ?? []}
              title="Provider Allocation"
            />
            <AllocationGroup
              items={portfolioAllocation?.byRegion ?? []}
              title="Region Allocation"
            />
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio Valuation Engine Foundation 僅使用 deterministic mock valuation。若 position 或 price 資料不足，系統會使用已儲存 cost basis / market value 作為 safe fallback。僅供監控與風險意識，不構成投資建議、即時估值、績效承諾或自動交易。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio News Feed
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Intelligence Universe → Mock News Provider
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v1.98 建立 Portfolio → Intelligence Universe → News Provider → Portfolio News Feed 的資料流；目前使用 mock provider，不連接外部新聞、AI、行情或券商。
            </p>
          </div>
          <FeatureIcon icon={LineChart} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["News Provider Status", portfolioNewsFeed?.providerStatus ?? "pending"],
            ["Tracked Symbols", intelligenceUniverse?.totalTrackedSymbols ?? 0],
            ["News Count", portfolioNewsFeed?.newsCount ?? 0],
          ].map(([label, value]) => {
            const displayValue =
              typeof value === "number" ? numberLabel(value) : value;

            return (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ixai-forest)]">
                {displayValue}
              </p>
            </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">
            Tracked Symbols
          </p>
          {intelligenceUniverse && intelligenceUniverse.symbols.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {intelligenceUniverse.symbols.map((symbol) => (
                <span
                  className="inline-flex max-w-full rounded-full border border-[rgba(176,141,87,0.38)] bg-[rgba(176,141,87,0.10)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--ixai-forest)]"
                  key={symbol}
                >
                  {symbol}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              尚未有可追蹤標的。新增 Stock、Crypto、Grid、Dual 或含 underlyings 的 FCN 後，這裡會形成 Intelligence Universe。
            </p>
          )}
        </div>

        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">
            Latest Headlines
          </p>
          {latestHeadlines.length > 0 ? (
            <div className="mt-3 grid gap-3">
              {latestHeadlines.map((item) => (
                <article
                  className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.70)] p-3"
                  key={item.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-[var(--ixai-gold)]">
                        {item.symbol} · {item.category}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                        {item.summary}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-[var(--ixai-forest-soft)]">
                      {item.source}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              目前 mock provider 沒有符合 tracked symbols 的 headline。新增支援標的後可產生 foundation feed。
            </p>
          )}
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio News Feed 目前只使用 mock provider 進行資料流驗證，不代表投資建議、新聞推薦、交易指令或 AI commentary。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio AI Commentary
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Mock Commentary Layer
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v1.99 將 Portfolio News Feed 接到 mock commentary provider，建立未來 Intelligence Engine 的解讀層基礎；目前不連接任何 AI provider。
            </p>
          </div>
          <FeatureIcon icon={BrainCircuit} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Commentary Count", portfolioCommentaryFeed?.commentaryCount ?? 0],
            ["Bullish Signals", portfolioCommentaryFeed?.bullishCount ?? 0],
            ["Neutral Signals", portfolioCommentaryFeed?.neutralCount ?? 0],
            ["Bearish Signals", portfolioCommentaryFeed?.bearishCount ?? 0],
            [
              "Volatile / Risk Watch",
              (portfolioCommentaryFeed?.volatileCount ?? 0) +
                (portfolioCommentaryFeed?.riskWatchCount ?? 0),
            ],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ixai-forest)]">
                {numberLabel(Number(value))}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">
            Latest Commentary
          </p>
          {latestCommentary.length > 0 ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {latestCommentary.map((item) => (
                <article
                  className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.70)] p-3"
                  key={item.id}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[rgba(176,141,87,0.38)] bg-[rgba(176,141,87,0.10)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
                        {item.symbol}
                      </span>
                      <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                        {item.sentiment}
                      </span>
                      <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                        Risk {item.riskLevel}
                      </span>
                      <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                        Confidence {formatConfidence(item.confidence)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                        {item.headline}
                      </h3>
                      <p className="mt-1 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              目前沒有 mock commentary。當 News Feed 產生符合支援標的的項目後，這裡會顯示 foundation commentary。
            </p>
          )}
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          AI Commentary Foundation 僅使用 mock commentary logic。僅供監控與風險意識，不構成投資建議、績效承諾或自動交易。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Intelligence Engine
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Mock Portfolio Intelligence Score
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v2.00 將 Repository、News Feed 與 AI Commentary Foundation 串成第一版 Portfolio Intelligence Engine scoring layer。
            </p>
          </div>
          <FeatureIcon icon={ShieldAlert} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Health Score", portfolioIntelligenceScore?.healthScore ?? 0],
            ["Risk Score", portfolioIntelligenceScore?.riskScore ?? 0],
            ["Concentration", portfolioIntelligenceScore?.concentrationScore ?? 0],
            ["Diversification", portfolioIntelligenceScore?.diversificationScore ?? 0],
            ["Overall Rating", portfolioIntelligenceScore?.overallRating ?? "pending"],
          ].map(([label, value]) => {
            const displayValue =
              typeof value === "number" ? numberLabel(value) : value;

            return (
              <div
                className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4"
                key={label}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)] sm:text-3xl">
                  {displayValue}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">
            Portfolio Intelligence Summary
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {portfolioIntelligenceScore?.summary ??
              "Portfolio Intelligence Engine is ready, but no score is available yet."}
          </p>
          <p className="mt-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            Generated Time: {portfolioIntelligenceScore?.generatedAt ?? "--"}
          </p>
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio Intelligence Engine Foundation 僅使用 mock scoring。僅供監控與風險意識，不構成投資建議、績效承諾或自動交易。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Risk Engine
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Mock Portfolio Risk Report
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v2.01 建立第一版 deterministic risk report，使用 repository assets、accounts 與 positions，不接行情、新聞或 AI provider。
            </p>
          </div>
          <FeatureIcon icon={ShieldAlert} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Overall Risk", portfolioRiskReport?.overallRisk ?? "PENDING"],
            ["Risk Score", portfolioRiskReport?.riskScore ?? 0],
            ["Concentration Risk", portfolioRiskReport?.concentrationRisk ?? "PENDING"],
            ["Diversification Risk", portfolioRiskReport?.diversificationRisk ?? "PENDING"],
            ["FCN Risk", portfolioRiskReport?.fcnRisk ?? "PENDING"],
            ["Crypto Risk", portfolioRiskReport?.cryptoRisk ?? "PENDING"],
            ["Cash Buffer Risk", portfolioRiskReport?.cashBufferRisk ?? "PENDING"],
            ["Generated Time", portfolioRiskReport?.generatedAt ?? "--"],
          ].map(([label, value]) => {
            const displayValue =
              typeof value === "number" ? numberLabel(value) : value;

            return (
              <div
                className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4"
                key={label}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  {label}
                </p>
                <p className="mt-2 break-words text-lg font-semibold text-[var(--ixai-forest)] sm:text-2xl">
                  {displayValue}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
            <p className="text-sm font-semibold text-[var(--ixai-forest)]">
              Summary
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {portfolioRiskReport?.summary ??
                "Portfolio Risk Engine is ready, but no risk report is available yet."}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
            <p className="text-sm font-semibold text-[var(--ixai-forest)]">
              Alerts
            </p>
            {portfolioRiskReport && portfolioRiskReport.alerts.length > 0 ? (
              <ul className="mt-2 grid gap-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {portfolioRiskReport.alerts.map((alert) => (
                  <li
                    className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.08)] px-3 py-2"
                    key={alert}
                  >
                    {alert}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                目前沒有 mock risk alert。
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio Risk Engine Foundation 僅使用 mock deterministic scoring。僅供監控與風險意識，不構成投資建議、績效承諾或自動交易。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Recommendation Engine
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Mock Portfolio Recommendation Prompts
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v2.02 將 Risk Report 接到 deterministic Recommendation Engine，產生監控型 workflow prompts；不連接 AI、新聞、行情、券商或交易系統。
            </p>
          </div>
          <FeatureIcon icon={ShieldAlert} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Recommendation Count", portfolioRecommendationReport?.recommendationCount ?? 0],
            ["High Priority Count", portfolioRecommendationReport?.highPriorityCount ?? 0],
            ["Generated Time", portfolioRecommendationReport?.generatedAt ?? "--"],
          ].map(([label, value]) => {
            const displayValue =
              typeof value === "number" ? numberLabel(value) : value;

            return (
              <div
                className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4"
                key={label}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  {label}
                </p>
                <p className="mt-2 break-words text-lg font-semibold text-[var(--ixai-forest)] sm:text-2xl">
                  {displayValue}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4">
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">
            Recommendation Cards
          </p>
          {portfolioRecommendationReport &&
          portfolioRecommendationReport.recommendations.length > 0 ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {portfolioRecommendationReport.recommendations.map((item) => (
                <article
                  className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.70)] p-3"
                  key={item.id}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[rgba(176,141,87,0.38)] bg-[rgba(176,141,87,0.10)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
                        {item.category}
                      </span>
                      <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                        Priority {item.priority}
                      </span>
                      <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                        Severity {item.severity}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              目前沒有 recommendation prompt。Risk Report 產生後，這裡會顯示 deterministic monitoring prompts。
            </p>
          )}
          <p className="mt-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {portfolioRecommendationReport?.summary ??
              "Portfolio Recommendation Engine is ready, but no recommendation report is available yet."}
          </p>
        </div>

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio Recommendation Engine Foundation 僅使用 deterministic mock prompts。僅供監控與風險意識，不構成投資建議、交易指令、價格目標或自動交易。
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Repository Status
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              UI → Repository → Supabase Persistence
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v1.95 驗證 Repository Layer 以 Supabase owner-scoped records 讀取 accounts、assets 與 positions。
            </p>
          </div>
          <FeatureIcon icon={Database} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Repository Layer", "Enabled"],
            ["Persistence Layer", "Enabled"],
            ["Ownership Validation", "Enabled"],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Layers3} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Multi-Asset Allocation
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              資產類別與讀取摘要
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assetCategories.map((category) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4"
              key={category}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {ASSET_CATEGORY_LABEL[category]}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
                {numberLabel(assetCategoryCounts?.[category] ?? 0)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2">
          {assetAllocationSummary.map((item) => (
            <div
              className="grid gap-2 rounded-xl border border-[var(--ixai-border)] bg-white/72 p-4 text-sm sm:grid-cols-[1fr_auto_auto]"
              key={item.category}
            >
              <span className="font-semibold text-[var(--ixai-forest)]">
                {ASSET_CATEGORY_LABEL[item.category]}
              </span>
              <span className="text-[var(--ixai-forest-soft)]">
                {numberLabel(item.count)} records
              </span>
              <span className="font-mono text-[var(--ixai-forest)]">
                {formatApprox(item.valueApprox)} · {formatShare(item.sharePct)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={ShieldAlert} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              FCN Risk Dashboard
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Worst-of、Near KI 與集中度
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[0.8fr_1fr_1fr]">
          <div className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              Near KI Count
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ixai-forest)]">
              {numberLabel(summary.nearKiCount)}
            </p>
            <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
              僅依已儲存手動價格計算。
            </p>
          </div>

          <div className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <p className="font-semibold text-[var(--ixai-forest)]">
              Worst-of Ranking Top 5
            </p>
            <div className="mt-3 grid gap-2">
              {fcnWorstOfRanking.length > 0 ? (
                fcnWorstOfRanking.map((item) => (
                  <div
                    className="rounded-lg border border-[var(--ixai-border)] bg-white/72 p-3 text-sm"
                    key={item.fcnId}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold text-[var(--ixai-forest)]">
                        {item.underlyingSymbol ?? "--"} · {item.fcnName}
                      </span>
                      <span className="font-mono text-[var(--ixai-forest)]">
                        {formatPercent(item.returnPct)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  尚未有可計算 Worst-of ranking 的 FCN。
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <p className="font-semibold text-[var(--ixai-forest)]">
              Concentration Exposure Top 5
            </p>
            <div className="mt-3 grid gap-2">
              {fcnExposureSummary.length > 0 ? (
                fcnExposureSummary.map((item) => (
                  <div
                    className="rounded-lg border border-[var(--ixai-border)] bg-white/72 p-3 text-sm"
                    key={item.underlyingSymbol}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold text-[var(--ixai-forest)]">
                        {item.underlyingSymbol}
                        {item.underlyingName ? ` · ${item.underlyingName}` : ""}
                      </span>
                      <span className="font-mono text-[var(--ixai-forest)]">
                        {numberLabel(item.count)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  尚未有 FCN 標的集中度資料。
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {summary.riskNarrative}
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={LineChart} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Intelligence
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              監控摘要與風險解讀
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/75 p-4">
            <p className="font-semibold text-[var(--ixai-forest)]">Monitoring Highlights</p>
            <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {monitoringHighlights.map((item) => (
                <li className="flex gap-2" key={item}>
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ixai-gold)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {[
            ["Risk Narrative", summary.riskNarrative],
            ["Worst-of Narrative", summary.worstOfNarrative],
            ["Concentration Narrative", summary.concentrationNarrative],
            ["Near-KI Narrative", summary.nearKiNarrative],
          ].map(([label, copy]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-white/75 p-4"
              key={label}
            >
              <p className="font-semibold text-[var(--ixai-forest)]">{label}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Crown} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Membership Status
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Current Plan：{TIER_LABEL[summary.membershipTier]}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Portfolio Center 目前只顯示權限基礎，不包含付款流程。
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_LABELS.map(([label, key]) => {
            const enabled = entitlements?.[key] ?? false;

            return (
              <div
                className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                key={key}
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck
                    aria-hidden="true"
                    className={`h-4 w-4 ${enabled ? "text-[var(--ixai-gold)]" : "text-[rgba(9,41,31,0.32)]"}`}
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                    {label}
                  </p>
                </div>
                <p className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
                  {enabled ? "Available" : "Locked"}
                </p>
              </div>
            );
          })}
        </div>

        <button
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[rgba(176,141,87,0.42)] bg-[rgba(176,141,87,0.10)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] sm:w-auto"
          type="button"
        >
          Upgrade flow coming soon
        </button>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(9,41,31,0.04)] p-5 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        本頁僅用於資產整理、風險監控與資訊閱讀，不構成投資建議、交易指令、價格預測、績效承諾或自動交易。
      </section>
    </div>
  );
}

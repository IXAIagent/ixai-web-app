"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
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
import type { PortfolioDashboardSummary } from "@/src/lib/portfolio/dashboard";
import type {
  PortfolioAccount,
  PortfolioAccountProvider,
} from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";
import type { PortfolioInputRegion } from "@/src/lib/portfolio/input/asset-types";
import { buildPortfolioNewsIntelligenceFoundation } from "@/src/lib/portfolio/intelligence/intelligence-builder";
import { getPortfolioRepository } from "@/src/lib/portfolio/repository/portfolio-persistence-provider";
import type { PortfolioOwnershipValidationStatus } from "@/src/lib/portfolio/repository/portfolio-repository";
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

export function PortfolioCenterDashboard() {
  const [summary, setSummary] = useState<PortfolioDashboardSummary | null>(null);
  const [ownershipStatus, setOwnershipStatus] =
    useState<PortfolioOwnershipValidationStatus | null>(null);
  const [repositoryAccounts, setRepositoryAccounts] = useState<PortfolioAccount[]>([]);
  const [repositoryAssets, setRepositoryAssets] = useState<PortfolioAsset[]>([]);
  const [repositoryPositions, setRepositoryPositions] = useState<PortfolioPosition[]>([]);
  const [status, setStatus] = useState<"error" | "loading" | "ready" | "unauthenticated">(
    "loading",
  );

  const loadSummary = useCallback(async () => {
    setStatus("loading");

    const headers = await getSupabaseAuthorizationHeaders();

    if (!headers) {
      setSummary(null);
      setOwnershipStatus(null);
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
      const payload = (await response.json().catch(() => ({}))) as DashboardResponse;

      if (!response.ok || !payload.summary) {
        setSummary(payload.summary ?? null);
        setOwnershipStatus(repositoryOwnershipStatus);
        setRepositoryAccounts(accounts);
        setRepositoryAssets(assets);
        setRepositoryPositions(positions);
        setStatus(response.status === 401 ? "unauthenticated" : "error");
        return;
      }

      setSummary(payload.summary);
      setOwnershipStatus(repositoryOwnershipStatus);
      setRepositoryAccounts(accounts);
      setRepositoryAssets(assets);
      setRepositoryPositions(positions);
      setStatus("ready");
    } catch {
      setSummary(null);
      setOwnershipStatus(null);
      setRepositoryAccounts([]);
      setRepositoryAssets([]);
      setRepositoryPositions([]);
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
  const intelligenceUniverse = useMemo(
    () => buildPortfolioNewsIntelligenceFoundation(repositoryAssets),
    [repositoryAssets],
  );
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
              Portfolio Intelligence Universe
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              未來新聞與 AI 觀察的標的宇宙
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              v1.97 只根據 Repository 資產資料產生 tracked symbols；不連接新聞、AI、行情或券商。
            </p>
          </div>
          <FeatureIcon icon={LineChart} shadow={false} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Total Tracked Symbols", intelligenceUniverse.totalTrackedSymbols],
            ["Source Mentions", intelligenceUniverse.sourceCount],
            ["Ignored Cash Assets", intelligenceUniverse.ignoredCashCount],
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
            Symbol List
          </p>
          {intelligenceUniverse.symbols.length > 0 ? (
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

        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Intelligence Universe 是持倉關聯觀察清單，不代表投資建議、新聞推薦、交易指令或 AI commentary。
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

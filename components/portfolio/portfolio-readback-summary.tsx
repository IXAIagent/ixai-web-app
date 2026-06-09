"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  Coins,
  Database,
  Gauge,
  ShieldAlert,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import type {
  PortfolioDashboardRiskStatus,
  PortfolioDashboardSummary,
} from "@/src/lib/portfolio/dashboard";

type ReadbackVariant = "portfolio" | "fcn" | "risk" | "pro";

type DashboardResponse = {
  ok: boolean;
  summary?: PortfolioDashboardSummary;
};

const EMPTY_SUMMARY: PortfolioDashboardSummary = {
  cryptoCount: 0,
  cryptoDualCount: 0,
  cryptoGridCount: 0,
  cryptoMarketValueApprox: 0,
  fcnCount: 0,
  fcnNotionalApprox: 0,
  fcnUnderlyingCount: 0,
  fcnWorstOfInvalidInitialPriceCount: 0,
  fcnWorstOfMissingCurrentPriceCount: 0,
  fcnWorstOfMissingUnderlyingsCount: 0,
  fcnWorstOfReadyCount: 0,
  fcnWorstOfSummaries: [],
  generatedAt: "",
  highLevelRiskStatus: "clear",
  incompleteValuationCount: 0,
  fcnExposureSummary: [],
  fcnWorstOfRanking: [],
  nearKiCount: 0,
  portfolioCount: 0,
  portfolioRiskScore: 0,
  portfolios: [],
  state: "unauthenticated",
  stockCount: 0,
  stockMarketValueApprox: 0,
  totalNotionalApprox: 0,
};

const VARIANT_COPY = {
  fcn: {
    eyebrow: "FCN Readback",
    title: "已儲存 FCN 資料",
    empty: "尚未建立 FCN 監控資料。",
    description: "目前只讀取 FCN 主表與連結標的數量，不做 KI / KO 即時計算。",
  },
  portfolio: {
    eyebrow: "Portfolio Readback",
    title: "我的投資組合資料層",
    empty: "尚未建立 Portfolio。",
    description: "IXAI 已能讀取 Portfolio、FCN、股票與 Crypto 儲存資料，作為未來 Pro Dashboard 基礎。",
  },
  pro: {
    eyebrow: "Pro Data Readiness",
    title: "Pro 資料層狀態",
    empty: "資料層已建立，尚未有使用者 Portfolio 資料。",
    description: "Portfolio、FCN、Stock / Crypto storage 已可讀取；AI Monitoring 尚未啟用。",
  },
  risk: {
    eyebrow: "Risk Readback",
    title: "風險資料完整度",
    empty: "尚未有 Portfolio 資料可形成風險視圖。",
    description: "目前只根據已儲存資料的數量、複雜度與缺漏欄位做風險意識提示。",
  },
} as const;

const RISK_LABEL: Record<PortfolioDashboardRiskStatus, string> = {
  clear: "Clear",
  elevated: "Elevated",
  watch: "Watch",
};

const RISK_COPY: Record<PortfolioDashboardRiskStatus, string> = {
  clear: "目前資料量少或尚未建立部位，風險視圖維持觀察前狀態。",
  elevated: "資料中已有較高複雜度或較多缺漏欄位，建議先補齊資料再進一步分析。",
  watch: "已建立部分部位資料，適合持續補齊價格、名目本金與標的資訊。",
};

const RISK_CLASS: Record<PortfolioDashboardRiskStatus, string> = {
  clear:
    "border-[color-mix(in_srgb,var(--ixai-risk-clear)_38%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[color-mix(in_srgb,var(--ixai-risk-clear)_64%,var(--ixai-forest))]",
  elevated:
    "border-[color-mix(in_srgb,var(--ixai-risk-elevated)_38%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-elevated)_12%,white)] text-[color-mix(in_srgb,var(--ixai-risk-elevated)_68%,var(--ixai-forest))]",
  watch:
    "border-[color-mix(in_srgb,var(--ixai-risk-watch)_38%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_12%,white)] text-[color-mix(in_srgb,var(--ixai-risk-watch)_68%,var(--ixai-forest))]",
};

function formatApprox(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  }).format(value);
}

function numberLabel(value: number) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function formatPercent(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function getWorstOfStatusCopy(status: PortfolioDashboardSummary["fcnWorstOfSummaries"][number]["status"]) {
  return {
    invalid_initial_price: "初始價格待補",
    missing_current_price: "尚未有現價",
    missing_underlyings: "尚未有連結標的",
    ready: "可計算",
  }[status];
}

export function PortfolioReadbackSummary({ variant = "portfolio" }: { variant?: ReadbackVariant }) {
  const [summary, setSummary] = useState<PortfolioDashboardSummary>(EMPTY_SUMMARY);
  const [status, setStatus] = useState<"error" | "loading" | "ready" | "unauthenticated">(
    "loading",
  );

  const loadSummary = useCallback(
    async (options: { showLoading?: boolean } = {}) => {
      const showLoading = options.showLoading ?? true;

      if (showLoading) {
        setStatus("loading");
      }

      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        setSummary(EMPTY_SUMMARY);
        setStatus("unauthenticated");
        return;
      }

      try {
        const response = await fetch("/api/portfolio/dashboard", {
          cache: "no-store",
          headers,
        });
        const payload = (await response.json().catch(() => ({}))) as DashboardResponse;

        if (!response.ok || !payload.summary) {
          setSummary(payload.summary ?? EMPTY_SUMMARY);
          setStatus(response.status === 401 ? "unauthenticated" : "error");
          return;
        }

        setSummary(payload.summary);
        setStatus("ready");
      } catch {
        setSummary(EMPTY_SUMMARY);
        setStatus("error");
      }
    },
    [],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadSummary();
    });
  }, [loadSummary]);

  useEffect(() => {
    function handlePortfolioChanged() {
      void loadSummary({ showLoading: false });
    }

    window.addEventListener("ixai:portfolio:changed", handlePortfolioChanged);

    return () => {
      window.removeEventListener("ixai:portfolio:changed", handlePortfolioChanged);
    };
  }, [loadSummary]);

  const copy = VARIANT_COPY[variant];
  const hasAnyData = summary.portfolioCount + summary.fcnCount + summary.stockCount + summary.cryptoCount > 0;
  const shouldShowWorstOf = variant === "fcn" || variant === "pro" || variant === "risk";
  const shouldShowRiskDashboard = variant === "pro" || variant === "risk";
  const fcnWorstOfSummaries = useMemo(
    () => summary.fcnWorstOfSummaries ?? [],
    [summary.fcnWorstOfSummaries],
  );
  const fcnWorstOfRanking = useMemo(
    () => summary.fcnWorstOfRanking ?? [],
    [summary.fcnWorstOfRanking],
  );
  const fcnExposureSummary = useMemo(
    () => summary.fcnExposureSummary ?? [],
    [summary.fcnExposureSummary],
  );
  const primaryWorstOf = useMemo(() => {
    const ready = fcnWorstOfSummaries
      .filter((item) => item.status === "ready" && typeof item.worstUnderlyingReturnPct === "number")
      .toSorted(
        (a, b) => (a.worstUnderlyingReturnPct ?? 0) - (b.worstUnderlyingReturnPct ?? 0),
      )[0];

    return ready ?? fcnWorstOfSummaries[0] ?? null;
  }, [fcnWorstOfSummaries]);
  const stats = useMemo(
    () => [
      { icon: BriefcaseBusiness, label: "Portfolio", value: numberLabel(summary.portfolioCount) },
      { icon: ShieldAlert, label: "FCN", value: numberLabel(summary.fcnCount) },
      { icon: BarChart3, label: "Stock / ETF", value: numberLabel(summary.stockCount) },
      { icon: Coins, label: "Crypto", value: numberLabel(summary.cryptoCount) },
    ],
    [summary.cryptoCount, summary.fcnCount, summary.portfolioCount, summary.stockCount],
  );

  return (
    <section className="rounded-3xl border border-[rgba(9,41,31,0.14)] bg-white p-5 shadow-[0_18px_48px_rgba(9,41,31,0.07)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <FeatureIcon icon={Database} />
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
              {copy.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {copy.description}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${RISK_CLASS[summary.highLevelRiskStatus]}`}
        >
          <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
          {RISK_LABEL[summary.highLevelRiskStatus]}
        </span>
      </div>

      {status === "loading" ? (
        <div className="mt-5 rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.70)] p-4 text-sm text-[var(--ixai-forest-soft)]">
          正在讀取 Portfolio 資料...
        </div>
      ) : null}

      {status === "unauthenticated" ? (
        <div className="mt-5 rounded-2xl border border-[color-mix(in_srgb,var(--ixai-risk-watch)_36%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_9%,white)] p-4 text-sm leading-7 text-[var(--ixai-forest)]">
          登入後即可讀取你的 Portfolio / FCN / Stock / Crypto 資料層。
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-5 rounded-2xl border border-[color-mix(in_srgb,var(--ixai-risk-elevated)_36%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-elevated)_9%,white)] p-4 text-sm leading-7 text-[var(--ixai-forest)]">
          暫時無法讀取 Portfolio 資料層。請稍後再試，或確認 Supabase migration 已完成。
        </div>
      ) : null}

      {status === "ready" ? (
        <>
          {!hasAnyData ? (
            <div className="mt-5 rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {copy.empty}
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div
                  className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                  key={item.label}
                >
                  <FeatureIcon icon={item.icon} size="sm" shadow={false} />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--ixai-forest)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--ixai-border)] bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                Approx Stored Value
              </p>
              <p className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                {formatApprox(summary.totalNotionalApprox)}
              </p>
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                僅加總已儲存欄位；未做匯率換算或即時報價。
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--ixai-border)] bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                FCN Underlyings
              </p>
              <p className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                {numberLabel(summary.fcnUnderlyingCount)}
              </p>
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                已儲存連結標的數量，不代表即時 Worst-of 狀態。
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--ixai-border)] bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                Grid / Dual
              </p>
              <p className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                {numberLabel(summary.cryptoGridCount)} / {numberLabel(summary.cryptoDualCount)}
              </p>
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                只代表監控條件已儲存，不代表策略執行。
              </p>
            </div>
          </div>

          {shouldShowWorstOf ? (
            <div className="mt-5 rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                    FCN Worst-of MVP
                  </p>
                  {primaryWorstOf ? (
                    <>
                      <p className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                        {primaryWorstOf.status === "ready"
                          ? `${primaryWorstOf.worstUnderlyingSymbol ?? "--"} · ${formatPercent(
                              primaryWorstOf.worstUnderlyingReturnPct,
                            )}`
                          : getWorstOfStatusCopy(primaryWorstOf.status)}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                        {primaryWorstOf.status === "ready"
                          ? `${primaryWorstOf.fcnName} 的目前 Worst-of 為 ${
                              primaryWorstOf.worstUnderlyingName ??
                              primaryWorstOf.worstUnderlyingSymbol ??
                              "未命名標的"
                            }。`
                          : "尚未有現價或完整標的價格，待補價格後計算 Worst-of。"}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                      尚未有 FCN 連結標的可計算 Worst-of。
                    </p>
                  )}
                </div>
                <div className="grid min-w-[160px] gap-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  <span>可計算：{numberLabel(summary.fcnWorstOfReadyCount ?? 0)}</span>
                  <span>缺現價：{numberLabel(summary.fcnWorstOfMissingCurrentPriceCount ?? 0)}</span>
                  <span>缺標的：{numberLabel(summary.fcnWorstOfMissingUnderlyingsCount ?? 0)}</span>
                  <span>初始價待補：{numberLabel(summary.fcnWorstOfInvalidInitialPriceCount ?? 0)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-6 text-[rgba(9,41,31,0.58)]">
                Worst-of 僅使用已儲存的手動價格欄位計算，不串接即時行情，不構成投資建議。
              </p>
            </div>
          ) : null}

          {shouldShowRiskDashboard ? (
            <div className="mt-5 rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/75 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                    Risk Dashboard MVP
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--ixai-forest)]">
                    {numberLabel(summary.portfolioRiskScore ?? 0)}
                    <span className="ml-1 text-sm font-medium text-[var(--ixai-forest-soft)]">
                      / 100
                    </span>
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    Near KI Count：{numberLabel(summary.nearKiCount ?? 0)}。此分數只用已儲存資料做風險意識排序。
                  </p>
                </div>
                <div className="grid gap-3 text-sm lg:min-w-[460px] lg:grid-cols-2">
                  <div className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3">
                    <p className="font-semibold text-[var(--ixai-forest)]">
                      Worst-of Ranking Top 5
                    </p>
                    <div className="mt-3 grid gap-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                      {fcnWorstOfRanking.slice(0, 5).length > 0 ? (
                        fcnWorstOfRanking.slice(0, 5).map((item) => (
                          <div className="flex items-center justify-between gap-3" key={item.fcnId}>
                            <span className="min-w-0 truncate">
                              {item.underlyingSymbol ?? "--"} · {item.fcnName}
                            </span>
                            <span className="font-mono text-[var(--ixai-forest)]">
                              {formatPercent(item.returnPct)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p>尚未有可計算 Worst-of ranking 的 FCN。</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3">
                    <p className="font-semibold text-[var(--ixai-forest)]">
                      Concentration Exposure Top 5
                    </p>
                    <div className="mt-3 grid gap-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                      {fcnExposureSummary.slice(0, 5).length > 0 ? (
                        fcnExposureSummary.slice(0, 5).map((item) => (
                          <div
                            className="flex items-center justify-between gap-3"
                            key={item.underlyingSymbol}
                          >
                            <span className="min-w-0 truncate">
                              {item.underlyingSymbol}
                              {item.underlyingName ? ` · ${item.underlyingName}` : ""}
                            </span>
                            <span className="font-mono text-[var(--ixai-forest)]">
                              {numberLabel(item.count)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p>尚未有 FCN 標的集中度資料。</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-6 text-[rgba(9,41,31,0.58)]">
                Risk Dashboard MVP 僅為監控與風險意識工具，不代表買賣建議、產品推薦或收益承諾。
              </p>
            </div>
          ) : null}

          <div className={`mt-5 rounded-2xl border p-4 text-sm leading-7 ${RISK_CLASS[summary.highLevelRiskStatus]}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">資料層風險意識：{RISK_LABEL[summary.highLevelRiskStatus]}</p>
                <p className="mt-1">{RISK_COPY[summary.highLevelRiskStatus]}</p>
                {summary.incompleteValuationCount > 0 ? (
                  <p className="mt-1">
                    目前有 {numberLabel(summary.incompleteValuationCount)} 筆資料缺少可估值欄位。
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <p className="mt-5 text-xs leading-6 text-[rgba(9,41,31,0.58)]">
        本區僅用於資料讀取、監控準備與風險意識，不構成投資建議、買賣指令、目標價、報酬承諾或自動交易。
      </p>
    </section>
  );
}

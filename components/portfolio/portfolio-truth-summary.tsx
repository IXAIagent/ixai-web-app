"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";

const STATUS_LABEL: Record<string, string> = {
  partial: "Partial",
  placeholder: "Placeholder",
  ready: "Ready",
  unauthenticated: "Sign in required",
  unavailable: "Unavailable",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value)}%`;
}

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
    }).format(new Date(value));
  } catch {
    return "剛剛";
  }
}

function getHealthLabel(status: string) {
  if (status === "ready" || status === "partial") {
    return "Ready";
  }

  if (status === "unavailable" || status === "unauthenticated") {
    return "Error";
  }

  return "Missing";
}

function getStatusClass(status: string) {
  if (status === "ready") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "partial") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "unavailable" || status === "unauthenticated") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-[var(--ixai-border)] bg-white/70 text-[var(--ixai-forest-soft)]";
}

export function PortfolioTruthSummary() {
  const [truth, setTruth] = useState<PortfolioTruthReadback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshTruth() {
    setIsLoading(true);
    const nextTruth = await loadPortfolioTruthReadback();
    setTruth(nextTruth);
    setIsLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void refreshTruth();
    });
  }, []);

  const stats = useMemo(() => {
    if (!truth) {
      return [
        { label: "Total Assets", value: "—", note: "讀取中" },
        { label: "Stocks", value: "—", note: "讀取中" },
        { label: "Crypto", value: "—", note: "讀取中" },
        { label: "FCN", value: "—", note: "讀取中" },
      ];
    }

    return [
      {
        label: "Total Assets",
        note: "FCN / Stock / Crypto shared readback",
        value: String(truth.counts.totalAssets),
      },
      {
        label: "Stocks",
        note: "Existing Stock API records",
        value: String(truth.counts.totalStockPositions),
      },
      {
        label: "Crypto",
        note: `Grid ${truth.counts.totalGridPositions} / Dual ${truth.counts.totalDualPositions}`,
        value: String(truth.counts.totalCryptoPositions),
      },
      {
        label: "FCN",
        note: "Persisted FCN positions",
        value: String(truth.counts.totalFcnPositions),
      },
    ];
  }, [truth]);

  const allocation = useMemo(() => {
    const total = truth?.counts.totalAssets ?? 0;

    return [
      {
        count: truth?.counts.totalStockPositions ?? 0,
        label: "Stocks",
        note: "Stock position count",
        tone: "bg-emerald-600",
      },
      {
        count: truth?.counts.totalFcnPositions ?? 0,
        label: "FCN",
        note: "Structured product count",
        tone: "bg-amber-500",
      },
      {
        count: truth?.counts.totalCryptoPositions ?? 0,
        label: "Crypto",
        note: "Crypto / Grid / Dual count",
        tone: "bg-sky-600",
      },
    ].map((item) => ({
      ...item,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
  }, [truth]);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Portfolio Truth Layer
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            我的資產總覽
          </h2>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refreshTruth()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "更新中" : "重新整理"}
        </button>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
        v4.01 使用同一份 normalized readback 整合 FCN、Stock、Crypto 與 Portfolio Dashboard 來源。若價格或成本缺漏，IXAI 只顯示已知名目金額，不推估市場價值。
      </p>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
          Portfolio Holdings Summary
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={stat.label}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--ixai-forest)]">
              {stat.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {stat.note}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)]">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            Known Notional
          </p>
          <p className="mt-3 text-2xl font-semibold text-[var(--ixai-forest)]">
            {truth ? formatCurrency(truth.amounts.totalKnownNotional) : "—"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            FCN notional plus Stock / Crypto known values only. Missing prices are not fabricated.
          </p>
          {truth ? (
            <p className="mt-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
              Last refreshed: {formatTime(truth.lastRefreshedAt)}
            </p>
          ) : null}
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            Readiness
          </p>
          <p className="mt-3 text-2xl font-semibold text-[var(--ixai-forest)]">
            {truth ? STATUS_LABEL[truth.readinessLevel] : "Loading"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            Shared source status for Portfolio, Risk, and Intelligence.
          </p>
        </article>
      </div>

      {truth ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              Portfolio Allocation
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
              Counts-based allocation
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              Valuation is incomplete, so v4.02 uses position counts only. No market value is invented.
            </p>
            <div className="mt-4 grid gap-3">
              {allocation.map((item) => (
                <div key={item.label}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                      {item.label}
                    </p>
                    <p className="font-mono text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {item.count} positions / {formatPercent(item.percentage)}
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                    <div
                      className={`h-full rounded-full ${item.tone}`}
                      style={{ width: `${Math.max(item.percentage, item.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              Top Exposure Summary
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
              Most repeated symbols
            </h3>
            {truth.symbols.topExposures.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {truth.symbols.topExposures.map((exposure) => (
                  <div
                    className="flex flex-col gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                    key={exposure.symbol}
                  >
                    <div>
                      <p className="font-mono text-base font-semibold text-[var(--ixai-forest)]">
                        {exposure.symbol}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                        {exposure.sources.join(" / ")}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.84)] px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
                      {exposure.occurrenceCount} occurrence{exposure.occurrenceCount === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                No symbols are available from FCN underlyings, Stock positions, or Crypto positions yet.
              </p>
            )}
          </article>
        </div>
      ) : null}

      {truth ? (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            Portfolio Data Health
          </p>
        </div>
      ) : null}

      {truth ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {truth.dataSourceStatuses.map((source) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-white/65 p-4"
              key={source.key}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">
                  {source.label}
                </h3>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusClass(source.status)}`}
                >
                  {getHealthLabel(source.status)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                {source.note}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      {truth && truth.missingDataWarnings.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p className="font-semibold">Missing data notes</p>
          <ul className="mt-2 grid gap-1">
            {truth.missingDataWarnings.slice(0, 4).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

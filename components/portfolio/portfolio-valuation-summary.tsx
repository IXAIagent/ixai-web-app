"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, RefreshCw, WalletCards } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import type {
  PortfolioValuationResult,
  ValuationSourceStatus,
} from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

const STATUS_CLASS: Record<ValuationSourceStatus, string> = {
  delayed: "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)] text-[var(--ixai-forest)]",
  fallback: "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest-soft)]",
  live: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[var(--ixai-forest)]",
  partial: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_40%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] text-[var(--ixai-forest)]",
  stale: "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)] text-[var(--ixai-forest)]",
  unavailable: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)] text-[var(--ixai-forest)]",
};

function formatCurrency(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    currency: currency === "MIXED" || currency === "USDT" ? "USD" : currency,
    maximumFractionDigits: value >= 100 ? 0 : 2,
    style: "currency",
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  try {
    return new Intl.DateTimeFormat("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
    }).format(new Date(value));
  } catch {
    return "--";
  }
}

function StatusBadge({ status }: { status: ValuationSourceStatus }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export function PortfolioValuationSummary() {
  const [valuation, setValuation] = useState<PortfolioValuationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  async function refreshValuation() {
    setIsLoading(true);
    const result = await runWorkspaceSafe(
      "workspace-portfolio-valuation-summary",
      getWorkspacePortfolioValuation,
      null,
    );

    if (!mountedRef.current) {
      return;
    }

    setValuation(result.data);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    queueMicrotask(() => {
      if (!cancelled) {
        void refreshValuation();
      }
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  const summaryCards = useMemo(() => {
    const currency = valuation?.currency ?? "USD";
    const summary = valuation?.summary;

    return [
      {
        label: "Estimated Market Value",
        note: "Market quotes + FCN notional placeholder",
        value: formatCurrency(summary?.totalMarketValue, currency),
      },
      {
        label: "Cost Basis",
        note: "Known average cost / notional only",
        value: formatCurrency(summary?.totalCostBasis, currency),
      },
      {
        label: "Unrealized P/L",
        note: `${formatPercent(summary?.totalUnrealizedPnlPercent)} estimated return`,
        value: formatCurrency(summary?.totalUnrealizedPnl, currency),
      },
      {
        label: "Priced / Unpriced",
        note: "Positions with estimated market value",
        value: summary
          ? `${summary.pricedPositionCount} / ${summary.unpricedPositionCount}`
          : "--",
      },
    ];
  }, [valuation]);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Calculator} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Portfolio Valuation Engine
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Estimated portfolio value
            </h2>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refreshValuation()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "估值中" : "重新估值"}
        </button>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
        v4.30 combines Portfolio Truth readback with Market Data Foundation quotes. FCN values use notional placeholders only; this is an estimated monitoring view, not investment advice.
      </p>

      {valuation?.summary.positionCount === 0 ? (
        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          No portfolio positions are available for valuation yet. Add Stock, Crypto, or FCN inputs to start building valuation readback.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={card.label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {card.label}
            </p>
            <p className="mt-2 break-words font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {card.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {card.note}
            </p>
          </article>
        ))}
      </div>

      {valuation ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  Asset Allocation
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
                  Estimated by asset class
                </h3>
              </div>
              <StatusBadge status={valuation.summary.sourceStatus} />
            </div>
            <div className="mt-4 grid gap-3">
              {valuation.summary.assetAllocation.map((item) => (
                <div key={item.assetClass}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold capitalize text-[var(--ixai-forest)]">
                      {item.assetClass}
                    </p>
                    <p className="font-mono text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {formatCurrency(item.marketValue, valuation.currency)} / {formatPercent(item.allocationPercent)}
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                    <div
                      className="h-full rounded-full bg-[var(--ixai-gold)]"
                      style={{
                        width: `${Math.max(item.allocationPercent, item.marketValue > 0 ? 4 : 0)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                    {item.positionCount} position(s), {item.pricedPositionCount} priced · {item.sourceStatus}
                  </p>
                </div>
              ))}
              {valuation.summary.assetAllocation.length === 0 ? (
                <p className="text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  No allocation is available yet.
                </p>
              ) : null}
            </div>
          </article>

          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <div className="flex items-center gap-2">
              <WalletCards className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                Position Valuation
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              {valuation.positions.slice(0, 6).map((position) => (
                <div
                  className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                  key={position.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                        {position.symbol}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                        {position.name} · {position.assetClass}
                      </p>
                    </div>
                    <StatusBadge status={position.sourceStatus} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
                    {formatCurrency(position.marketValue, position.currency)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                    P/L {formatCurrency(position.unrealizedPnl, position.currency)} · {formatPercent(position.unrealizedPnlPercent)}
                  </p>
                  {position.warningMessage ? (
                    <p className="mt-2 rounded-md border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                      {position.warningMessage}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {valuation && valuation.summary.warnings.length > 0 ? (
        <article className="mt-5 rounded-xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Valuation Warnings
          </p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {valuation.summary.warnings.slice(0, 5).map((warning, index) => (
              <li className="break-words" key={`${warning.code}-${warning.positionId ?? index}`}>
                {warning.message}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
        Last updated: {formatTime(valuation?.summary.updatedAt)}. Valuation is informational and monitoring-only. It does not provide buy/sell instructions, target prices, order execution, auto trading, or return promises.
      </p>
    </section>
  );
}

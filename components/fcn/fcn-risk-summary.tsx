"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gauge, RefreshCw, ShieldAlert } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { FCN_MANUAL_PRICE_EVENT } from "@/src/lib/fcn/manual-price-overrides";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import { INPUT_TRUTH_BRIDGE_EVENT } from "@/src/lib/portfolio/input/input-truth-bridge";
import { FCN_DRAFT_STORE_EVENT } from "@/src/lib/portfolio/input/fcn-draft-store";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";
import type {
  FcnPortfolioRiskSummary,
  FcnRiskLevel,
  FcnRiskSourceStatus,
  FcnUnderlyingRisk,
} from "@/src/lib/fcn/risk/fcn-risk-types";

const LEVEL_CLASS: Record<FcnRiskLevel, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-800",
  high: "border-orange-200 bg-orange-50 text-orange-800",
  low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  unavailable: "border-slate-200 bg-slate-50 text-slate-700",
};

const SOURCE_CLASS: Record<FcnRiskSourceStatus, string> = {
  delayed: "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)] text-[var(--ixai-forest)]",
  fallback: "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest-soft)]",
  live: "border-emerald-200 bg-emerald-50 text-emerald-800",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  stale: "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)] text-[var(--ixai-forest)]",
  unavailable: "border-rose-200 bg-rose-50 text-rose-800",
};

function formatNumber(value: number | null | undefined, digits = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "UNKNOWN";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "UNKNOWN";
  }

  return `${value >= 0 ? "+" : ""}${formatNumber(value, 2)}%`;
}

function RiskBadge({ level }: { level: FcnRiskLevel }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${LEVEL_CLASS[level]}`}
    >
      {level.toUpperCase()}
    </span>
  );
}

function SourceBadge({ status }: { status: FcnRiskSourceStatus }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${SOURCE_CLASS[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function UnderlyingRiskRow({ underlying }: { underlying: FcnUnderlyingRisk }) {
  return (
    <div className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
            {underlying.symbol}
            {underlying.isWorstOf ? " · Worst-of" : ""}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
            Current {formatNumber(underlying.currentPrice, 2)} · Initial{" "}
            {formatNumber(underlying.initialPrice, 2)}
          </p>
        </div>
        <SourceBadge status={underlying.sourceStatus} />
      </div>
      <dl className="mt-3 grid gap-2 text-xs text-[var(--ixai-forest-soft)] sm:grid-cols-3">
        <div>
          <dt>Performance</dt>
          <dd className="font-semibold text-[var(--ixai-forest)]">
            {formatPercent(underlying.performancePercent)}
          </dd>
        </div>
        <div>
          <dt>KI Distance</dt>
          <dd className="font-semibold text-[var(--ixai-forest)]">
            {formatPercent(underlying.distanceToKiPercent)}
          </dd>
        </div>
        <div>
          <dt>Strike Distance</dt>
          <dd className="font-semibold text-[var(--ixai-forest)]">
            {formatPercent(underlying.distanceToStrikePercent)}
          </dd>
        </div>
      </dl>
      {underlying.warningMessage ? (
        <p className="mt-3 rounded-md border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
          {underlying.warningMessage}
        </p>
      ) : null}
    </div>
  );
}

export function FcnRiskSummary() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<FcnPortfolioRiskSummary | null>(null);
  const mountedRef = useRef(false);

  const refreshRiskSummary = useCallback(async () => {
    setIsLoading(true);
    const result = await runWorkspaceSafe(
      "workspace-fcn-risk-summary",
      getWorkspaceFcnRiskSummary,
      null,
    );

    if (!mountedRef.current) {
      return;
    }

    setSummary(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    queueMicrotask(() => {
      if (!cancelled) {
        void refreshRiskSummary();
      }
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [refreshRiskSummary]);

  useEffect(() => {
    const refresh = () => {
      void refreshRiskSummary();
    };

    window.addEventListener(FCN_MANUAL_PRICE_EVENT, refresh);
    window.addEventListener(FCN_DRAFT_STORE_EVENT, refresh);
    window.addEventListener(INPUT_TRUTH_BRIDGE_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(FCN_MANUAL_PRICE_EVENT, refresh);
      window.removeEventListener(FCN_DRAFT_STORE_EVENT, refresh);
      window.removeEventListener(INPUT_TRUTH_BRIDGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refreshRiskSummary]);

  const visibleSummaries = summary?.summaries.slice(0, 6) ?? [];

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={ShieldAlert} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              FCN Risk Engine v1
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Worst-of / KI / Strike / KO Monitoring
            </h2>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refreshRiskSummary()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "計算中" : "重新計算"}
        </button>
      </div>

      <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
        v4.50 uses existing FCN input/readback, local manual price overlays, and v4.20 market-service quotes where available. This is FCN barrier monitoring only, not a full FCN pricing engine.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Positions", summary?.positionCount ?? 0],
          ["Analyzed", summary?.analyzedPositionCount ?? 0],
          ["Unavailable", summary?.unavailablePositionCount ?? 0],
          ["High Risk", summary?.highRiskCount ?? 0],
          ["Critical", summary?.criticalRiskCount ?? 0],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </div>

      {summary ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <SourceBadge status={summary.sourceStatus} />
          <span className="rounded-full border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            Updated {new Date(summary.updatedAt).toLocaleString("zh-TW")}
          </span>
        </div>
      ) : null}

      {summary?.positionCount === 0 ? (
        <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          No FCN positions or local drafts are available for FCN Risk Engine v1 yet.
        </p>
      ) : null}

      {summary?.topRiskPositions.length ? (
        <section className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              Top Risk FCNs
            </p>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {summary.topRiskPositions.map((position) => (
              <article
                className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                key={position.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--ixai-forest)]">{position.name}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                      Worst-of {position.worstOfSymbol ?? "UNKNOWN"} · Performance{" "}
                      {formatPercent(position.worstOfPerformancePercent)}
                    </p>
                  </div>
                  <RiskBadge level={position.riskLevel} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {visibleSummaries.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {visibleSummaries.map((position) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={position.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-[var(--ixai-forest)]">{position.name}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                    Worst-of {position.worstOfSymbol ?? "UNKNOWN"} · Source {position.sourceStatus}
                  </p>
                </div>
                <RiskBadge level={position.riskLevel} />
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Worst-of Performance", formatPercent(position.worstOfPerformancePercent)],
                  ["Nearest KI Distance", formatPercent(position.nearestKiDistancePercent)],
                  ["Nearest Strike Distance", formatPercent(position.nearestStrikeDistancePercent)],
                  ["KO Status", position.koReady ? "KO ready" : "Not KO ready / unavailable"],
                ].map(([label, value]) => (
                  <div
                    className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                    key={label}
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[var(--ixai-forest)]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              {position.warnings.length > 0 ? (
                <ul className="mt-4 grid gap-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  {position.warnings.slice(0, 4).map((warning, index) => (
                    <li
                      className="rounded-md border border-[var(--ixai-border)] bg-white/70 p-2"
                      key={`${position.id}-${warning.code}-${warning.symbol ?? index}`}
                    >
                      {warning.symbol ? `${warning.symbol}: ` : ""}
                      {warning.message}
                    </li>
                  ))}
                </ul>
              ) : null}
              {position.underlyings.length > 0 ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {position.underlyings.slice(0, 4).map((underlying) => (
                    <UnderlyingRiskRow
                      key={`${position.id}-${underlying.symbol}`}
                      underlying={underlying}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
        {summary?.informationalOnlyDisclaimer ??
          "FCN Risk Engine v1 is informational and monitoring-only. It does not provide investment recommendations, order execution, auto trading, target prices, or return promises."}
      </p>
    </section>
  );
}

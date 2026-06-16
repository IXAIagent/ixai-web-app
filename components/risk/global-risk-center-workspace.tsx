"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bitcoin,
  CalendarDays,
  CandlestickChart,
  Gauge,
  Layers3,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { loadFcnManualPriceOverrides } from "@/src/lib/fcn/manual-price-overrides";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { buildGlobalRiskCenterReadback } from "@/src/lib/risk/global-risk-center";
import type {
  GlobalRiskAssetReadiness,
  GlobalRiskCenterReadback,
  GlobalRiskDataSourceStatus,
} from "@/src/lib/risk/global-risk-types";

type LoadStatus = "error" | "loading" | "ready" | "unauthenticated";

const STATUS_CLASS = {
  error: "border-rose-200 bg-rose-50 text-rose-800",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  placeholder: "border-slate-200 bg-slate-50 text-slate-700",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  unauthenticated: "border-amber-200 bg-amber-50 text-amber-800",
  unavailable: "border-rose-200 bg-rose-50 text-rose-800",
};

const LEVEL_CLASS = {
  ELEVATED: "border-rose-200 bg-rose-50 text-rose-800",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-800",
  MODERATE: "border-amber-200 bg-amber-50 text-amber-800",
  UNKNOWN: "border-slate-200 bg-slate-50 text-slate-700",
};

const TRUTH_RISK_CLASS = {
  HIGH: "border-rose-200 bg-rose-50 text-rose-800",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-800",
  MODERATE: "border-amber-200 bg-amber-50 text-amber-800",
  UNKNOWN: "border-slate-200 bg-slate-50 text-slate-700",
};

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return `${Math.round(value)}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function StatusPill({ status }: { status: GlobalRiskDataSourceStatus["status"] }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function MetricCard({
  label,
  note,
  value,
}: {
  label: string;
  note?: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/54">
        {label}
      </p>
      <p className="mt-2 break-words font-mono text-2xl font-semibold text-[var(--ixai-cream)]">
        {value}
      </p>
      {note ? <p className="mt-2 text-xs leading-5 text-white/60">{note}</p> : null}
    </article>
  );
}

function LightFactCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-current/20 bg-white/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>
      <p className="mt-2 break-words font-mono text-lg font-semibold">
        {value}
      </p>
    </article>
  );
}

function AssetReadinessCard({ item }: { item: GlobalRiskAssetReadiness }) {
  const icon =
    item.type === "FCN"
      ? ShieldCheck
      : item.type === "STOCK"
        ? CandlestickChart
        : item.type === "CRYPTO"
          ? Bitcoin
          : Layers3;

  return (
    <article className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-4 shadow-[0_14px_36px_rgba(9,41,31,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            {item.type}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
            {item.label}
          </h3>
        </div>
        <FeatureIcon icon={icon} size="sm" shadow={false} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusPill status={item.status} />
        <span className="rounded-full border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
          {formatNumber(item.count)} records
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {item.note}
      </p>
      <p className="mt-2 font-mono text-xs text-[rgba(9,41,31,0.54)]">
        Source: {item.source}
      </p>
    </article>
  );
}

function DataSourceCard({ source }: { source: GlobalRiskDataSourceStatus }) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
          {source.label}
        </h3>
        <StatusPill status={source.status} />
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {source.note}
      </p>
    </article>
  );
}

function buildInitialReadback(): GlobalRiskCenterReadback {
  return buildGlobalRiskCenterReadback({
    cryptoPositions: [],
    fcnPositions: [],
    stockPositions: [],
  });
}

export function GlobalRiskCenterWorkspace() {
  const [readback, setReadback] = useState<GlobalRiskCenterReadback>(() => buildInitialReadback());
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const loadRiskCenter = useCallback(async () => {
    setStatus("loading");
    setMessage(null);

    const truth = await loadPortfolioTruthReadback();

    if (truth.readinessLevel === "unauthenticated") {
      setReadback(
        buildGlobalRiskCenterReadback({
          cryptoPositions: [],
          fcnPositions: [],
          portfolioTruth: truth,
          stockPositions: [],
          unauthenticated: true,
        }),
      );
      setStatus("unauthenticated");
      return;
    }

    const isUnavailable = (key: "crypto" | "fcn" | "stock") =>
      truth.dataSourceStatuses.some(
        (source) => source.key === key && source.status === "unavailable",
      );

    const nextReadback = buildGlobalRiskCenterReadback({
      cryptoError: isUnavailable("crypto"),
      cryptoPositions: truth.positions.crypto,
      fcnError: isUnavailable("fcn"),
      fcnPositions: truth.positions.fcn,
      manualPrices: loadFcnManualPriceOverrides(),
      portfolioTruth: truth,
      stockError: isUnavailable("stock"),
      stockPositions: truth.positions.stock,
    });

    setReadback(nextReadback);

    if (truth.readinessLevel === "unavailable") {
      setStatus("error");
      setMessage("Some risk data sources could not be read. Available sources are still shown.");
      return;
    }

    setStatus("ready");
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRiskCenter();
    });
  }, [loadRiskCenter]);

  const scoreLabel = readback.riskScore.score === null ? "UNKNOWN" : String(readback.riskScore.score);
  const upcomingEvents = useMemo(() => readback.upcomingEvents.slice(0, 8), [readback.upcomingEvents]);
  const concentrationRisk = readback.riskIntelligence.concentrationRisk;
  const dataQualityRisk = readback.riskIntelligence.dataQualityRisk;
  const fcnWorstOfRisk = readback.riskIntelligence.fcnWorstOfRisk;
  const worstUnderlying = fcnWorstOfRisk.worstPosition?.worstUnderlying;

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                v4.03 Risk Intelligence Layer
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                Global Risk Center
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                Risk Center 現在使用 Portfolio Truth Layer 產生 concentration、top exposure、FCN worst-of 與 data quality readback。
                這是監控與風險意識，不是交易或投資建議。
              </p>
            </div>
            <FeatureIcon icon={ShieldAlert} shadow={false} tone="cream" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Foundation Score"
              note={readback.riskScore.summary}
              value={scoreLabel}
            />
            <MetricCard
              label="Total Holdings"
              note="Shared Portfolio Truth Layer count."
              value={formatNumber(readback.portfolioTruth?.counts.totalAssets ?? 0)}
            />
            <MetricCard
              label="FCN High Risk"
              note="RED FCN readback from v3.20 logic."
              value={formatNumber(readback.fcn.summary.highRiskCount)}
            />
            <MetricCard
              label="FCN Watch"
              note="YELLOW FCN readback from v3.20 logic."
              value={formatNumber(readback.fcn.summary.watchCount)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Portfolio Truth Status
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            Shared Holdings Readback
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            v4.01 keeps the existing Risk score unchanged, but adds the shared Portfolio Truth Layer so Risk Center can see available FCN, Stock, and Crypto records.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Total Holdings", formatNumber(readback.portfolioTruth?.counts.totalAssets ?? 0)],
              ["FCN", formatNumber(readback.portfolioTruth?.counts.totalFcnPositions ?? 0)],
              ["Stocks", formatNumber(readback.portfolioTruth?.counts.totalStockPositions ?? 0)],
              ["Crypto", formatNumber(readback.portfolioTruth?.counts.totalCryptoPositions ?? 0)],
            ].map(([label, value]) => (
              <article
                className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                key={label}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  {label}
                </p>
                <p className="mt-2 break-words text-lg font-semibold text-[var(--ixai-forest)] sm:text-2xl">
                  {value}
                </p>
              </article>
            ))}
          </div>
          {readback.portfolioTruth?.missingDataWarnings.length ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-800">
              {readback.portfolioTruth.missingDataWarnings[0]}
            </p>
          ) : null}
        </section>

        <section className={`rounded-2xl border p-5 sm:p-6 ${LEVEL_CLASS[readback.riskScore.level]}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
                Global Risk Overview
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {readback.riskScore.level}
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-7">
                {readback.riskScore.summary} Stock / Crypto / Grid / Dual are shown as readiness cards until their full risk engines are approved.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-current px-3 py-1 text-xs font-semibold">
              {readback.riskScore.label}
            </span>
          </div>
        </section>

        <WorkspaceMarketStatus contextLabel="Risk Center" />

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Risk Intelligence Layer
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            Truth-Layer Risk Readback
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            v4.03 extends the shared Portfolio Truth Layer into deterministic risk readback for concentration, top exposure, FCN worst-of, and data quality. No market data, AI, broker sync, or trading function is added.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <article className={`rounded-xl border p-4 ${TRUTH_RISK_CLASS[concentrationRisk.level]}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                    Concentration Risk
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">
                    {concentrationRisk.level}
                  </h3>
                </div>
                <span className="inline-flex w-fit rounded-full border border-current px-2.5 py-1 text-xs font-semibold">
                  Score {concentrationRisk.score ?? "UNKNOWN"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7">
                {concentrationRisk.summary}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <LightFactCard
                  label="Top Symbol"
                  value={concentrationRisk.topExposure?.symbol ?? "--"}
                />
                <LightFactCard
                  label="Occurrences"
                  value={formatNumber(concentrationRisk.topExposure?.occurrenceCount ?? null)}
                />
                <LightFactCard
                  label="Share"
                  value={formatPercent(concentrationRisk.topExposureSharePct)}
                />
              </div>
            </article>

            <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                Top Exposure Aggregation
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
                Top Available Symbols
              </h3>
              {readback.riskIntelligence.topExposures.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {readback.riskIntelligence.topExposures.map((exposure) => (
                    <div
                      className="flex flex-col gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                      key={exposure.symbol}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--ixai-forest)]">
                          {exposure.symbol}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                          Sources: {exposure.sources.join(", ")}
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.9)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
                        {exposure.occurrenceCount}x
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  No shared symbol exposures are available from FCN, Stock, or Crypto readback yet.
                </p>
              )}
            </article>

            <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                FCN Worst-of Risk Summary
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
                {fcnWorstOfRisk.worstPosition?.riskStatus ?? "UNKNOWN"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {fcnWorstOfRisk.summary}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <LightFactCard
                  label="Worst Underlying"
                  value={worstUnderlying?.underlying.symbol ?? "--"}
                />
                <LightFactCard
                  label="Worst KI Distance"
                  value={formatPercent(fcnWorstOfRisk.worstPosition?.worstKiDistancePct)}
                />
                <LightFactCard
                  label="Missing Prices"
                  value={formatNumber(fcnWorstOfRisk.missingPriceCount)}
                />
                <LightFactCard
                  label="Watch + High"
                  value={formatNumber(fcnWorstOfRisk.highRiskCount + fcnWorstOfRisk.watchCount)}
                />
              </div>
            </article>

            <article className={`rounded-xl border p-4 ${TRUTH_RISK_CLASS[dataQualityRisk.level]}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                    Data Quality Risk
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">
                    {dataQualityRisk.level}
                  </h3>
                </div>
                <span className="inline-flex w-fit rounded-full border border-current px-2.5 py-1 text-xs font-semibold">
                  Score {dataQualityRisk.score ?? "UNKNOWN"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7">
                {dataQualityRisk.summary}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <LightFactCard
                  label="Warnings"
                  value={formatNumber(dataQualityRisk.warningCount)}
                />
                <LightFactCard
                  label="Partial Sources"
                  value={formatNumber(dataQualityRisk.partialSourceCount)}
                />
                <LightFactCard
                  label="Unavailable"
                  value={formatNumber(dataQualityRisk.unavailableSourceCount)}
                />
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                FCN Risk Summary
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                v3.20 FCN Risk Readback
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
                Reuses FCN Intelligence Center calculations and manual price overlays. No duplicate FCN risk logic is introduced.
              </p>
            </div>
            <button
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
              disabled={status === "loading"}
              onClick={() => void loadRiskCenter()}
              type="button"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--ixai-gold)]" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              )}
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Total FCNs", formatNumber(readback.fcn.summary.totalCount)],
              ["Total Notional", readback.fcn.summary.totalNotionalLabel],
              ["High Risk", formatNumber(readback.fcn.summary.highRiskCount)],
              ["Watch", formatNumber(readback.fcn.summary.watchCount)],
              ["Unknown Risk", formatNumber(readback.fcn.summary.unknownRiskCount)],
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

          {message ? (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-800">
              {message}
            </p>
          ) : null}

          {status === "unauthenticated" ? (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-800">
              登入後才能讀取你的 FCN / Stock / Crypto risk sources。
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Multi-Asset Readiness
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            Stock / Crypto / Grid / Dual Readiness
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {readback.assetReadiness.map((item) => (
              <AssetReadinessCard item={item} key={item.type} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex items-center gap-3">
            <FeatureIcon icon={CalendarDays} shadow={false} />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Upcoming Risk Events
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                FCN Timeline Feed
              </h2>
            </div>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {upcomingEvents.map((event) => (
                <article
                  className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                  key={`${event.fcnId}-${event.eventType}-${event.date}-${event.note}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                        {event.eventType.replaceAll("_", " ")}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[var(--ixai-forest)]">
                        {event.fcnName}
                      </h3>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
                      {event.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[var(--ixai-forest)]">
                    {formatDate(event.date)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                    {event.note}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              目前沒有 upcoming FCN observation、coupon payment、KO observation 或 maturity events。
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex items-center gap-3">
            <FeatureIcon icon={Gauge} shadow={false} />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Data Source Status
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                Risk Source Readiness
              </h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {readback.dataSources.map((source) => (
              <DataSourceCard key={source.label} source={source} />
            ))}
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-2">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/my-ixai/fcn"
          >
            Open FCN Intelligence Center
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            href="/my-ixai/portfolio"
          >
            Open Portfolio Center
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Monitoring and risk-awareness only. No investment recommendation. No order execution.
          No auto trading. v3.30 does not connect live market data, broker sync, alert routing,
          or AI recommendation logic.
        </p>
      </section>
    </main>
  );
}

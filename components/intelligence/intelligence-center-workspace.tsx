"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  FileText,
  Gauge,
  Loader2,
  Newspaper,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { IntelligenceSummary } from "@/components/intelligence/intelligence-summary";
import { IntelligenceV2Summary } from "@/components/intelligence/intelligence-v2-summary";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { WorkspaceIntelligenceV14Summary } from "@/components/workspace/workspace-intelligence-v14-summary";
import { WorkspaceMorningBriefV14Card } from "@/components/workspace/workspace-morning-brief-v14-card";
import { loadFcnManualPriceOverrides } from "@/src/lib/fcn/manual-price-overrides";
import { useTranslation } from "@/src/lib/i18n";
import { buildIntelligenceCenterReadback } from "@/src/lib/intelligence/intelligence-center";
import type {
  IntelligenceCenterReadback,
  IntelligenceCenterSourceStatus,
  IntelligenceCenterStatus,
} from "@/src/lib/intelligence/intelligence-center-types";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

type LoadStatus = "error" | "loading" | "ready" | "unauthenticated";

const STATUS_LABEL: Record<IntelligenceCenterStatus, string> = {
  error: "Needs Review",
  partial: "Partial",
  placeholder: "Readiness",
  ready: "Ready",
  unauthenticated: "Login Required",
  unavailable: "Unavailable",
};

const STATUS_CLASS: Record<IntelligenceCenterStatus, string> = {
  error: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)] text-[var(--ixai-forest)]",
  partial: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] text-[var(--ixai-forest)]",
  placeholder: "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest-soft)]",
  ready: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[var(--ixai-forest)]",
  unauthenticated: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] text-[var(--ixai-forest)]",
  unavailable: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)] text-[var(--ixai-forest)]",
};

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function buildInitialReadback(): IntelligenceCenterReadback {
  return buildIntelligenceCenterReadback({
    cryptoPositions: [],
    fcnPositions: [],
    stockPositions: [],
  });
}

function StatusBadge({ status }: { status: IntelligenceCenterStatus }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function MetricCard({
  label,
  note,
  value,
}: {
  label: string;
  note: string;
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
      <p className="mt-2 text-xs leading-5 text-white/60">{note}</p>
    </article>
  );
}

function SourceCard({ source }: { source: IntelligenceCenterSourceStatus }) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
          {source.label}
        </h3>
        <StatusBadge status={source.status} />
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {source.note}
      </p>
    </article>
  );
}

function ReadbackSummaryCard({
  note,
  status,
  title,
  value,
}: {
  note: string;
  status: IntelligenceCenterStatus;
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            {title}
          </p>
          <p className="mt-2 break-words font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
            {value}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {note}
      </p>
    </article>
  );
}

export function IntelligenceCenterWorkspace() {
  const { t, tGlobal } = useTranslation("intelligence");
  const [readback, setReadback] = useState<IntelligenceCenterReadback>(() => buildInitialReadback());
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const loadIntelligenceCenter = useCallback(async () => {
    setStatus("loading");
    setMessage(null);

    const truthResult = await runWorkspaceSafe(
      "workspace-intelligence-center-truth",
      loadPortfolioTruthReadback,
      null,
    );

    if (!mountedRef.current) {
      return;
    }

    const truth = truthResult.data;

    if (!truth) {
      setReadback(buildInitialReadback());
      setStatus("error");
      setMessage(tRef.current("portfolioRiskReadinessUnavailable"));
      return;
    }

    if (truth.readinessLevel === "unauthenticated") {
      setReadback(
        buildIntelligenceCenterReadback({
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

    setReadback(
      buildIntelligenceCenterReadback({
        cryptoError: isUnavailable("crypto"),
        cryptoPositions: truth.positions.crypto,
        fcnError: isUnavailable("fcn"),
        fcnPositions: truth.positions.fcn,
        manualPrices: loadFcnManualPriceOverrides(),
        portfolioCount: truth.portfolioDashboard?.portfolioCount ?? 0,
        portfolioError: truth.dataSourceStatuses.some(
          (source) =>
            source.key === "portfolioDashboard" && source.status === "unavailable",
        ),
        portfolioTruth: truth,
        stockError: isUnavailable("stock"),
        stockPositions: truth.positions.stock,
      }),
    );

    if (truth.readinessLevel === "unavailable") {
      setStatus("error");
      setMessage(tRef.current("portfolioWarning"));
      return;
    }

    setStatus("ready");
  }, []);

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    queueMicrotask(() => {
      if (!cancelled) {
        void loadIntelligenceCenter();
      }
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [loadIntelligenceCenter]);

  const upcomingEvents = useMemo(
    () =>
      readback.fcn.timeline
        .filter((event) => event.status === "today" || event.status === "upcoming")
        .slice(0, 5),
    [readback.fcn.timeline],
  );

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                V14 Sprint 2 {t("workspaceIntelligence")}
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                {t("intelligenceCenter")}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                {t("body")}
              </p>
            </div>
            <FeatureIcon icon={Brain} shadow={false} tone="cream" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label={t("fcnHighlights")}
              note={t("fcnRiskReadback", "Existing /api/fcn readback and v3.20 helper output.")}
              value={formatNumber(readback.stats.fcnCount)}
            />
            <MetricCard
              label={t("stockPositions")}
              note={t("stockReadiness", "Readiness from /api/stocks, not a new intelligence engine.")}
              value={formatNumber(readback.stats.stockCount)}
            />
            <MetricCard
              label={t("cryptoPositions")}
              note={t("cryptoReadiness", "Readiness from /api/crypto, not a new market provider.")}
              value={formatNumber(readback.stats.cryptoCount)}
            />
            <MetricCard
              label={t("truthAssets")}
              note={t("sharedHoldingsReadback")}
              value={formatNumber(readback.stats.portfolioCount)}
            />
          </div>
        </section>

        <IntelligenceSummary />

        <IntelligenceV2Summary />

        <WorkspaceIntelligenceV14Summary autoLoad />

        <WorkspaceMorningBriefV14Card autoLoad />

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            {t("intelligenceReadbackLayer")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            {t("intelligenceReadbackTitle")}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {t("intelligenceReadbackBody")}
          </p>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <article className="rounded-2xl border border-[var(--ixai-border)] bg-white/70 p-4">
              <div className="flex items-center gap-3">
                <FeatureIcon icon={BarChart3} shadow={false} />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    {t("portfolioIntelligenceSummary")}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--ixai-forest)]">
                    {t("sharedHoldingsReadback")}
                  </h3>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                {readback.portfolioIntelligenceSummary.map((summary) => (
                  <ReadbackSummaryCard key={summary.title} {...summary} />
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[var(--ixai-border)] bg-white/70 p-4">
              <div className="flex items-center gap-3">
                <FeatureIcon icon={ShieldAlert} shadow={false} />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    {t("riskSnapshotSummary")}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--ixai-forest)]">
                    {t("reusedFromRiskIntelligence")}
                  </h3>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {readback.riskSnapshotSummary.map((summary) => (
                  <ReadbackSummaryCard key={summary.title} {...summary} />
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[var(--ixai-border)] bg-white/70 p-4">
              <div className="flex items-center gap-3">
                <FeatureIcon icon={Gauge} shadow={false} />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    {t("exposureIntelligenceSummary")}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--ixai-forest)]">
                    {t("occurrenceBasedSymbols")}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {readback.exposureIntelligenceSummary.note}
              </p>
              {readback.exposureIntelligenceSummary.topExposures.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {readback.exposureIntelligenceSummary.topExposures.map((exposure) => (
                    <div
                      className="flex flex-col gap-2 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 sm:flex-row sm:items-center sm:justify-between"
                      key={exposure.symbol}
                    >
                      <div>
                        <p className="font-semibold text-[var(--ixai-forest)]">
                          {exposure.symbol}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                          {t("sourceStatus")}: {exposure.sources.join(", ")}
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/80 px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
                        {exposure.occurrenceCount}x
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {t("noExposureSymbols")}
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-[var(--ixai-border)] bg-white/70 p-4">
              <div className="flex items-center gap-3">
                <FeatureIcon icon={FileText} shadow={false} />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    {t("readinessWarningSummary")}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--ixai-forest)]">
                    {t("missingDataWarnings")}
                  </h3>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  {t("totalWarnings")}
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
                  {formatNumber(readback.readinessWarningSummary.warningCount)}
                </p>
              </div>
              {readback.readinessWarningSummary.warnings.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {readback.readinessWarningSummary.warnings.map((warning) => (
                    <p
                      className="rounded-lg border border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] p-3 text-sm leading-6 text-[var(--ixai-forest)]"
                      key={warning}
                    >
                      {warning}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {t("noMissingDataWarnings")}
                </p>
              )}
            </article>
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                {t("portfolioTruthStatus")}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                {t("holdingsContextTitle")}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {t("holdingsContextBody")}
              </p>
            </div>
            <StatusBadge status={readback.portfolioTruth?.readinessLevel ?? "placeholder"} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [t("totalHoldings"), readback.portfolioTruth?.counts.totalAssets ?? 0],
              ["FCN", readback.portfolioTruth?.counts.totalFcnPositions ?? 0],
              [t("stockPositions"), readback.portfolioTruth?.counts.totalStockPositions ?? 0],
              [t("cryptoPositions"), readback.portfolioTruth?.counts.totalCryptoPositions ?? 0],
            ].map(([label, value]) => (
              <article
                className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                key={label}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  {label}
                </p>
                <p className="mt-2 break-words text-lg font-semibold text-[var(--ixai-forest)] sm:text-2xl">
                  {formatNumber(Number(value))}
                </p>
              </article>
            ))}
          </div>
          {readback.portfolioTruth?.symbols.topAvailableSymbols.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {readback.portfolioTruth.symbols.topAvailableSymbols.map((symbol) => (
                <span
                  className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]"
                  key={symbol}
                >
                  {symbol}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {t("noHoldingsSymbols")}
            </p>
          )}
          {readback.portfolioTruth?.missingDataWarnings.length ? (
            <p className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] p-3 text-sm leading-7 text-[var(--ixai-forest)]">
              {readback.portfolioTruth.missingDataWarnings[0]}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                {t("intelligenceOverview")}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                {t("workspaceIntelligence")}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {t("intelligenceOverviewBody")}
              </p>
            </div>
            <button
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
              disabled={status === "loading"}
              onClick={() => void loadIntelligenceCenter()}
              type="button"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--ixai-gold)]" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              )}
              {tGlobal("buttons", "refresh")}
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {readback.entries.map((entry) => (
              <Link
                className="group rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 transition hover:border-[rgba(176,141,87,0.55)] hover:bg-white"
                href={entry.href}
                key={entry.href}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                      {entry.label}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                      {entry.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
                <div className="mt-4">
                  <StatusBadge status={entry.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={Sparkles} shadow={false} />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  {t("todaysHighlights")}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                  {t("whatReadyToReview")}
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {readback.highlights.map((highlight) => (
                <p
                  className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]"
                  key={highlight}
                >
                  {highlight}
                </p>
              ))}
            </div>
            {status === "unauthenticated" ? (
              <p className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] p-3 text-sm leading-7 text-[var(--ixai-forest)]">
                {t("loginRequired")}
              </p>
            ) : null}
            {message ? (
              <p className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] p-3 text-sm leading-7 text-[var(--ixai-forest)]">
                {message}
              </p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={ShieldAlert} shadow={false} />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  {t("fcnIntelligenceHighlights")}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                  {t("reusedFromFcnCenter")}
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                [t("totalFcns"), readback.fcn.summary.totalCount],
                [t("highRisk"), readback.fcn.summary.highRiskCount],
                [t("watch"), readback.fcn.summary.watchCount],
                [tGlobal("risk", "unknownRisk", "Unknown Risk"), readback.fcn.summary.unknownRiskCount],
                [t("upcomingEvents"), readback.fcn.summary.upcomingEventsCount],
                [t("uniqueUnderlyings"), readback.fcn.summary.uniqueUnderlyingCount],
              ].map(([label, value]) => (
                <div
                  className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                  key={label}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                    {label}
                  </p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
                    {formatNumber(Number(value))}
                  </p>
                </div>
              ))}
            </div>
            <Link
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-semibold text-[var(--ixai-cream)] sm:w-fit"
              href="/my-ixai/fcn"
            >
              {t("fcnOpen")}
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </article>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex items-center gap-3">
            <FeatureIcon icon={CalendarDays} shadow={false} />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Upcoming FCN Events
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                Intelligence timeline inputs
              </h2>
            </div>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <article
                  className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                  key={`${event.fcnId}-${event.eventType}-${event.date}-${event.note}`}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                    {event.eventType.replaceAll("_", " ")}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-[var(--ixai-forest)]">
                    {event.fcnName}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                    {event.date} / {event.note}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              No upcoming FCN intelligence events are available from stored FCN timelines.
            </p>
          )}
        </section>

        <WorkspaceMarketStatus
          contextLabel="Intelligence Center"
          readback={readback.marketServiceReadiness}
        />

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={BarChart3} shadow={false} />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  Market Intelligence Snapshot
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                  Public source, workspace readiness
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {readback.marketSnapshot.map((source) => (
                <SourceCard key={source.label} source={source} />
              ))}
            </div>
            <Link
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
              href="/market"
            >
              Open Market Overview
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </article>

          <article className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={Newspaper} shadow={false} />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  News Feed Readiness
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                  Holding-aware news boundary
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {readback.newsReadiness.map((source) => (
                <SourceCard key={source.label} source={source} />
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={FileText} shadow={false} />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  Commentary Readiness
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                  No external AI provider
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {readback.commentaryReadiness.map((source) => (
                <SourceCard key={source.label} source={source} />
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={Gauge} shadow={false} />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  Next Action Panel
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                  Suggested workspace flow
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["/my-ixai/fcn", "Review FCN Center", "Check lifecycle, prices, timeline, and FCN risk readback."],
                ["/my-ixai/risk", "Review Risk Center", "Use Global Risk Center for FCN-led risk and source readiness."],
                ["/market", "Open Market Overview", "Read public market context before deeper workspace integration."],
                ["/my-ixai/input", "Complete Asset Input", "Add assets so future portfolio-aware intelligence has better context."],
              ].map(([href, label, note]) => (
                <Link
                  className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 transition hover:bg-white"
                  href={href}
                  key={href}
                >
                  <p className="font-semibold text-[var(--ixai-forest)]">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{note}</p>
                </Link>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Source Status
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {readback.sourceStatus.map((source) => (
              <SourceCard key={source.label} source={source} />
            ))}
          </div>
        </section>

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Monitoring and intelligence workflow only. No investment recommendation. No buy/sell
          instruction. No order execution. No auto trading. No return promise. v4.04 does not
          connect external AI, external news, broker sync, live market data, recommendations, or trading logic.
        </p>
      </section>
    </main>
  );
}

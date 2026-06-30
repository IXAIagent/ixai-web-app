"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { INPUT_TRUTH_BRIDGE_EVENT } from "@/src/lib/portfolio/input/input-truth-bridge";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import { useTranslation } from "@/src/lib/i18n/use-locale";
import { useWorkspaceDisplayLabels } from "@/src/lib/i18n/use-workspace-display-labels";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

const STATUS_KEY: Record<string, string> = {
  partial: "partial",
  placeholder: "fallback",
  ready: "ready",
  unauthenticated: "signInRequired",
  unavailable: "unavailable",
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

function getHealthKey(status: string) {
  if (status === "ready" || status === "partial") {
    return "ready";
  }

  if (status === "unavailable" || status === "unauthenticated") {
    return "error";
  }

  return "missing";
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
  const { t } = useTranslation("portfolio");
  const { assetTypeLabel, interpolate } = useWorkspaceDisplayLabels();
  const [truth, setTruth] = useState<PortfolioTruthReadback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  async function refreshTruth() {
    setIsLoading(true);
    const result = await runWorkspaceSafe(
      "workspace-portfolio-truth-summary",
      loadPortfolioTruthReadback,
      null,
    );

    if (!mountedRef.current) {
      return;
    }

    setTruth(result.data);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    queueMicrotask(() => {
      if (!cancelled) {
        void refreshTruth();
      }
    });

    function syncTruth() {
      if (!cancelled) {
        void refreshTruth();
      }
    }

    window.addEventListener(INPUT_TRUTH_BRIDGE_EVENT, syncTruth);
    window.addEventListener("ixai:portfolio-input:changed", syncTruth);
    window.addEventListener("storage", syncTruth);

    return () => {
      cancelled = true;
      mountedRef.current = false;
      window.removeEventListener(INPUT_TRUTH_BRIDGE_EVENT, syncTruth);
      window.removeEventListener("ixai:portfolio-input:changed", syncTruth);
      window.removeEventListener("storage", syncTruth);
    };
  }, []);

  const stats = useMemo(() => {
    if (!truth) {
      return [
        { label: t("totalAssets"), value: "—", note: t("loading") },
        { label: assetTypeLabel("stocks"), value: "—", note: t("loading") },
        { label: assetTypeLabel("crypto"), value: "—", note: t("loading") },
        { label: assetTypeLabel("fcn"), value: "—", note: t("loading") },
      ];
    }

    return [
      {
        label: t("totalAssets"),
        note:
          truth.counts.totalPendingInputs > 0
            ? interpolate(t("persistedPendingNote"), {
                pending: truth.counts.totalPendingInputs,
                persisted: truth.counts.totalPersistedAssets,
              })
            : t("sharedReadbackNote"),
        value: String(truth.counts.totalAssets),
      },
      {
        label: assetTypeLabel("stocks"),
        note:
          truth.counts.totalPendingStockInputs > 0
            ? interpolate(t("persistedPendingNote"), {
                pending: truth.counts.totalPendingStockInputs,
                persisted: truth.counts.totalStockPositions,
              })
            : t("existingStockApiRecords"),
        value: String(truth.counts.totalStockPositions),
      },
      {
        label: assetTypeLabel("crypto"),
        note:
          truth.counts.totalPendingCryptoInputs > 0
            ? interpolate(t("persistedPendingNote"), {
                pending: truth.counts.totalPendingCryptoInputs,
                persisted: truth.counts.totalCryptoPositions,
              })
            : interpolate(t("cryptoGridDualNote"), {
                dual: truth.counts.totalDualPositions,
                grid: truth.counts.totalGridPositions,
              }),
        value: String(truth.counts.totalCryptoPositions),
      },
      {
        label: assetTypeLabel("fcn"),
        note:
          truth.counts.totalPendingFcnInputs > 0
            ? interpolate(t("persistedPendingNote"), {
                pending: truth.counts.totalPendingFcnInputs,
                persisted: truth.counts.totalFcnPositions,
              })
            : t("sharedReadbackNote"),
        value: String(truth.counts.totalFcnPositions),
      },
    ];
  }, [assetTypeLabel, interpolate, t, truth]);

  const allocation = useMemo(() => {
    const total = truth?.counts.totalAssets ?? 0;

    return [
      {
        count: truth?.counts.totalStockPositions ?? 0,
        label: assetTypeLabel("stocks"),
        note: t("stockPositionCount"),
        tone: "bg-emerald-600",
      },
      {
        count: truth?.counts.totalFcnPositions ?? 0,
        label: assetTypeLabel("fcn"),
        note: t("structuredProductCount"),
        tone: "bg-amber-500",
      },
      {
        count: truth?.counts.totalCryptoPositions ?? 0,
        label: assetTypeLabel("crypto"),
        note: t("cryptoPositionCount"),
        tone: "bg-sky-600",
      },
    ].map((item) => ({
      ...item,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
  }, [assetTypeLabel, t, truth]);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            {t("portfolioTruthLayer")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            {t("assetOverviewTitle")}
          </h2>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refreshTruth()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? t("refreshing") : t("refresh")}
        </button>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {t("portfolioTruthBody")}
      </p>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
          {t("portfolioHoldingsSummary")}
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
            {t("knownNotional")}
          </p>
          <p className="mt-3 text-2xl font-semibold text-[var(--ixai-forest)]">
            {truth ? formatCurrency(truth.amounts.totalKnownNotional) : "—"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {t("knownNotionalBody")}
            {truth?.amounts.pendingKnownNotional
              ? ` ${interpolate(t("pendingInputNotional"), {
                  value: formatCurrency(truth.amounts.pendingKnownNotional),
                })}`
              : ""}
          </p>
          {truth ? (
            <p className="mt-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
              {t("lastRefreshed")}: {formatTime(truth.lastRefreshedAt)}
            </p>
          ) : null}
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            {t("readiness")}
          </p>
          <p className="mt-3 text-2xl font-semibold text-[var(--ixai-forest)]">
            {truth ? t(STATUS_KEY[truth.readinessLevel] ?? "unavailable") : t("loading")}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {t("healthSharedSource")}
          </p>
        </article>
      </div>

      {truth ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              {t("portfolioAllocation")}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
              {t("allocationByCount")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {t("allocationByCountBody")}
            </p>
            <div className="mt-4 grid gap-3">
              {allocation.map((item) => (
                <div key={item.label}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                      {item.label}
                    </p>
                    <p className="font-mono text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {interpolate(t("positionCount", "{count} position(s)"), {
                        count: item.count,
                      })} / {formatPercent(item.percentage)}
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
              {t("topExposureSummary")}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
              {t("topExposureTitle")}
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
                      {interpolate(t("occurrence"), {
                        count: exposure.occurrenceCount,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {t("noSymbols")}
              </p>
            )}
          </article>
        </div>
      ) : null}

      {truth && truth.pendingInputs.length > 0 ? (
        <article className="mt-4 rounded-xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {t("inputTruthBridge")}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
                {t("pendingLocalInputs")}
              </h3>
            </div>
            <span className="w-fit rounded-full border border-[rgba(176,141,87,0.38)] bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
              {truth.pendingInputs.length} {t("pending")}
            </span>
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {t("pendingLocalInputsBody")}
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {truth.pendingInputs.slice(0, 6).map((input) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                key={input.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                    {input.title}
                  </p>
                  <span className="rounded-full border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--ixai-forest-soft)]">
                    {input.category}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  {input.symbols.length > 0 ? input.symbols.join(" / ") : t("noSymbols")}
                </p>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {truth ? (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            {t("dataHealthEyebrow")}
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
                  {t(getHealthKey(source.status))}
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
          <p className="font-semibold">{t("missingDataNotes")}</p>
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

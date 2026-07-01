"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Signal,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { useTranslation } from "@/src/lib/i18n";
import { getWorkspacePortfolioRiskSummary } from "@/src/lib/risk/risk-service";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";
import type {
  PortfolioRiskResult,
  RiskLevel,
  RiskSignalSeverity,
} from "@/src/lib/risk/risk-engine-types";

const LEVEL_CLASS: Record<RiskLevel, string> = {
  critical: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_36%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_9%,white)] text-[var(--ixai-forest)]",
  high: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_28%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_7%,white)] text-[var(--ixai-forest)]",
  low: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[var(--ixai-forest)]",
  medium: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_38%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] text-[var(--ixai-forest)]",
  unavailable: "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest-soft)]",
};

const SEVERITY_CLASS: Record<RiskSignalSeverity, string> = {
  critical: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_36%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_9%,white)] text-[var(--ixai-forest)]",
  high: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_28%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_7%,white)] text-[var(--ixai-forest)]",
  info: "border-[var(--ixai-border)] bg-white/72 text-[var(--ixai-forest-soft)]",
  warning: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_38%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] text-[var(--ixai-forest)]",
};

function formatScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "UNKNOWN";
  }

  return `${Math.round(value)}/100`;
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.8)] px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
      {label.toUpperCase()}
    </span>
  );
}

function SeverityBadge({
  label,
  severity,
}: {
  label: string;
  severity: RiskSignalSeverity;
}) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${SEVERITY_CLASS[severity]}`}
    >
      {label}
    </span>
  );
}

export function RiskEngineSummary() {
  const { t } = useTranslation("risk");
  const [risk, setRisk] = useState<PortfolioRiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  async function refreshRisk() {
    setIsLoading(true);
    const result = await runWorkspaceSafe(
      "workspace-risk-engine-summary",
      getWorkspacePortfolioRiskSummary,
      null,
    );

    if (!mountedRef.current) {
      return;
    }

    setRisk(result.data);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    queueMicrotask(() => {
      if (!cancelled) {
        void refreshRisk();
      }
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  const summaryCards = useMemo(() => {
    const summary = risk?.summary;

    return [
      {
        label: t("critical"),
        value: String(summary?.criticalSignalCount ?? 0),
      },
      {
        label: t("high"),
        value: String(summary?.highSignalCount ?? 0),
      },
      {
        label: t("warning"),
        value: String(summary?.warningSignalCount ?? 0),
      },
      {
        label: t("signals"),
        value: String(summary?.signalCount ?? 0),
      },
    ];
  }, [risk, t]);

  const level = risk?.summary.riskLevel ?? "unavailable";

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Gauge} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Risk Engine v1
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              {t("portfolioRiskSummary")}
            </h2>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refreshRisk()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? t("loading") : t("recalculate")}
        </button>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {t("riskEngineBody")}
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className={`rounded-xl border p-4 ${LEVEL_CLASS[level]}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                {t("foundationRiskScore")}
              </p>
              <p className="mt-2 break-words font-mono text-4xl font-semibold">
                {formatScore(risk?.summary.riskScore)}
              </p>
            </div>
            <StatusBadge label={t(`riskLevel_${level}`, level)} />
          </div>
          <p className="mt-4 text-sm leading-7">
            {t("sourceStatusSentence").replace(
              "{status}",
              risk?.summary.sourceStatus ?? t("unavailable"),
            )}
          </p>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {t("signalCounts")}
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                key={card.label}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  {card.label}
                </p>
                <p className="mt-2 font-mono text-xl font-semibold text-[var(--ixai-forest)]">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {t("topSignals")}
            </p>
          </div>
          {risk?.summary.topSignals.length ? (
            <div className="mt-4 grid gap-3">
              {risk.summary.topSignals.map((signal) => (
                <article
                  className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                  key={signal.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--ixai-forest)]">
                        {signal.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                        {signal.message}
                      </p>
                    </div>
                    <SeverityBadge label={t(signal.severity, signal.severity)} severity={signal.severity} />
                  </div>
                  {signal.affectedSymbols.length > 0 ? (
                    <p className="mt-2 font-mono text-xs text-[rgba(9,41,31,0.54)]">
                      {t("symbols")}: {signal.affectedSymbols.join(", ")}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {t("noSignals")}
            </p>
          )}
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <div className="flex items-center gap-2">
            <Signal className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {t("scoreBreakdown")}
            </p>
          </div>
          {risk?.summary.scoreBreakdown.length ? (
            <div className="mt-4 grid gap-3">
              {risk.summary.scoreBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                      {item.label}
                    </p>
                    <p className="font-mono text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      +{item.scoreImpact} · {item.signalCount} {t("signals")}
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                    <div
                      className="h-full rounded-full bg-[var(--ixai-gold)]"
                      style={{ width: `${Math.min(item.scoreImpact, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Score breakdown is empty until the engine detects valuation, allocation, or data quality signals.
            </p>
          )}
        </article>
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
        {risk?.summary.informationalOnlyDisclaimer ??
          "Risk Engine v1 is informational and monitoring-only. It does not provide investment recommendations, order execution, auto trading, or return promises."}
      </p>
    </section>
  );
}

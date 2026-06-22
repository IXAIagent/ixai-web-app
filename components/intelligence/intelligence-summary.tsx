"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Brain, Loader2, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  buildEmptyWorkspaceIntelligenceReport,
  getWorkspaceIntelligenceReport,
} from "@/src/lib/intelligence/engine/intelligence-service";
import type {
  WorkspaceIntelligenceCategory,
  WorkspaceIntelligenceReport,
  WorkspaceIntelligenceSeverity,
} from "@/src/lib/intelligence/engine/intelligence-types";

const SEVERITY_CLASS: Record<WorkspaceIntelligenceSeverity, string> = {
  critical:
    "border-[color-mix(in_srgb,var(--ixai-risk-critical)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_9%,white)] text-[var(--ixai-forest)]",
  info: "border-[var(--ixai-border)] bg-white/75 text-[var(--ixai-forest-soft)]",
  warning:
    "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)] text-[var(--ixai-forest)]",
};

const CATEGORY_LABEL: Record<WorkspaceIntelligenceCategory, string> = {
  fcn: "FCN Intelligence",
  portfolio: "Portfolio Intelligence",
  risk: "Risk Intelligence",
  schedule: "Schedule Intelligence",
};

type LoadState = "error" | "loading" | "ready";

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function SeverityBadge({ severity }: { severity: WorkspaceIntelligenceSeverity }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${SEVERITY_CLASS[severity]}`}
    >
      {severity.toUpperCase()}
    </span>
  );
}

export function IntelligenceSummary() {
  const [report, setReport] = useState<WorkspaceIntelligenceReport>(() =>
    buildEmptyWorkspaceIntelligenceReport(),
  );
  const [state, setState] = useState<LoadState>("loading");

  const loadReport = useCallback(async () => {
    setState("loading");
    const nextReport = await getWorkspaceIntelligenceReport();
    setReport(nextReport);
    setState("ready");
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadReport();
    });
  }, [loadReport]);

  const cardsByCategory = useMemo(() => {
    const grouped = new Map<WorkspaceIntelligenceCategory, typeof report.cards>();

    report.cards.forEach((item) => {
      grouped.set(item.category, [...(grouped.get(item.category) ?? []), item]);
    });

    return Array.from(grouped.entries());
  }, [report]);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Brain} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              v4.80 Intelligence Engine v1
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Structured Workspace Intelligence Cards
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Deterministic cards generated from Portfolio Truth, Market Service,
              Market Cache, Portfolio Valuation, Risk, FCN Risk, and FCN Schedule.
              No AI model, recommendation logic, broker logic, or trading workflow is used.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          disabled={state === "loading"}
          onClick={() => void loadReport()}
          type="button"
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--ixai-gold)]" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          )}
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {[
          ["Cards", report.cardCount],
          ["Critical", report.criticalCount],
          ["Warnings", report.warningCount],
          ["Info", report.infoCount],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </div>

      {cardsByCategory.length > 0 ? (
        <div className="mt-5 grid gap-5">
          {cardsByCategory.map(([category, cards]) => (
            <article
              className="rounded-2xl border border-[var(--ixai-border)] bg-white/70 p-4"
              key={category}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                {CATEGORY_LABEL[category]}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((item) => (
                  <div
                    className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                    key={item.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                        {item.title}
                      </h3>
                      <SeverityBadge severity={item.severity} />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                      {item.summary}
                    </p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[rgba(9,41,31,0.48)]">
                      Source: {item.sourceEngine.replaceAll("_", " ")}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          No structured intelligence cards are available yet. Add holdings, FCN records,
          prices, or schedules to activate deterministic Workspace Intelligence readback.
        </p>
      )}

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
        Generated {formatTimestamp(report.generatedAt)}. Intelligence Cards are
        monitoring and workflow context only. IXAI does not provide buy/sell
        instructions, order execution, automated trading, target prices, guaranteed
        returns, or personalized investment recommendations.
      </p>
    </section>
  );
}

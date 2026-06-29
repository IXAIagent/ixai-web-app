"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  buildEmptyWorkspaceIntelligenceReportV14,
  getWorkspaceIntelligenceReportV14,
  type WorkspaceIntelligenceReportV14,
  type WorkspaceIntelligenceSeverity,
} from "@/src/lib/workspace/intelligence";
import { runWorkspaceRuntimeBudget, runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

const SEVERITY_LABEL: Record<WorkspaceIntelligenceSeverity, string> = {
  critical: "Critical",
  elevated: "Elevated",
  info: "Info",
  watch: "Watch",
};

const SEVERITY_CLASS: Record<WorkspaceIntelligenceSeverity, string> = {
  critical: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)]",
  elevated: "border-[color-mix(in_srgb,var(--ixai-risk-elevated)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-elevated)_10%,white)]",
  info: "border-[var(--ixai-border)] bg-white/70",
  watch: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)]",
};

export function WorkspaceIntelligenceV14Summary({ autoLoad = true }: { autoLoad?: boolean }) {
  const [report, setReport] = useState<WorkspaceIntelligenceReportV14>(() =>
    buildEmptyWorkspaceIntelligenceReportV14(),
  );
  const [isLoading, setIsLoading] = useState(autoLoad);
  const mountedRef = useRef(false);

  async function refresh(force = false) {
    setIsLoading(true);
    const fallback = buildEmptyWorkspaceIntelligenceReportV14();
    const result = await runWorkspaceRuntimeBudget(
      "workspace-intelligence-v14-summary",
      () =>
        runWorkspaceSafe(
          "workspace-intelligence-v14-summary",
          () => getWorkspaceIntelligenceReportV14({ force }),
          fallback,
        ),
      {
        data: fallback,
        error: null,
        label: "workspace-intelligence-v14-summary",
        ok: true,
      },
      { auto: !force, threshold: 2, timeoutMs: 4500 },
    );

    if (!mountedRef.current) return;
    setReport(result.data ?? fallback);
    setIsLoading(false);
  }

  useEffect(() => {
    mountedRef.current = true;

    if (autoLoad) {
      queueMicrotask(() => {
        void refresh(false);
      });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [autoLoad]);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Brain} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V14.4 Workspace Intelligence
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Rule-based intelligence cards
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Aggregates live valuation, FCN live risk, risk, watchlist, alerts, timeline, and data quality into explain-only cards.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void refresh(true)}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "讀取中" : "Refresh"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Readiness", report.readinessStatus],
          ["Cards", String(report.cardCount)],
          ["Watch / Elevated", String(report.watchCount + report.elevatedCount)],
        ].map(([label, value]) => (
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4" key={label}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 break-words font-mono text-xl font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {report.cards.map((card) => (
          <article className={`rounded-xl border p-4 ${SEVERITY_CLASS[card.severity]}`} key={card.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-base font-semibold text-[var(--ixai-forest)]">{card.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                  {card.type} · {card.source} · {card.dataQuality}
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/65 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {SEVERITY_LABEL[card.severity]}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">{card.summary}</p>
            {card.details.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {card.details.slice(0, 3).map((detail) => (
                  <span className="rounded-full border border-[var(--ixai-border)] bg-white/65 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]" key={detail}>
                    {detail}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        {report.informationalOnlyDisclaimer}
      </p>
    </section>
  );
}

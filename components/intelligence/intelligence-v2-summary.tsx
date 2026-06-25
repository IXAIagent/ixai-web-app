"use client";

import { useEffect, useState } from "react";
import { Brain } from "lucide-react";

import { getWorkspaceIntelligenceV2Report } from "@/src/lib/intelligence/v2";
import type { IntelligenceV2Report } from "@/src/lib/intelligence/v2";

export function IntelligenceV2Summary() {
  const [report, setReport] = useState<IntelligenceV2Report | null>(null);

  useEffect(() => {
    let active = true;

    void getWorkspaceIntelligenceV2Report().then((nextReport) => {
      if (active) {
        setReport(nextReport);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            V19 Intelligence Center v2 Foundation
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--ixai-forest)]">
            <Brain className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            Workspace intelligence context
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Deterministic context from Portfolio, Risk, FCN, Market placeholder, and Morning Brief.
            No LLM, AI recommendation, broker action, external news, or trading instruction is enabled.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-3 py-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          {report?.dataQuality ?? "loading"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {(report?.monitoringInsights ?? []).slice(0, 3).map((insight) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={insight.id}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">
                {insight.title}
              </h3>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/75 px-2 py-1 text-[10px] font-semibold text-[var(--ixai-forest-soft)]">
                {insight.severity}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {insight.summary}
            </p>
          </article>
        ))}
        {!report ? (
          <p className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)] md:col-span-3">
            Loading Intelligence v2 foundation readback...
          </p>
        ) : null}
      </div>

      <p className="mt-4 rounded-xl border border-[var(--ixai-border)] bg-white/60 p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        Safety flags: AI provider {String(report?.safetyFlags.aiProviderEnabled ?? false)},
        recommendations {String(report?.safetyFlags.recommendationLogicEnabled ?? false)},
        actionable trading instructions {String(report?.safetyFlags.actionableTradingInstructions ?? false)}.
      </p>
    </section>
  );
}

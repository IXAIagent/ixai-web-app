"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getWorkspaceDailyBrief } from "@/src/lib/daily-brief";
import {
  getDailyBriefHistorySummary,
  type DailyBriefHistorySummary,
} from "@/src/lib/daily-brief/history";
import type { WorkspaceDailyBrief, WorkspaceDailyBriefSeverity } from "@/src/lib/daily-brief";

const SEVERITY_CLASS: Record<WorkspaceDailyBriefSeverity, string> = {
  critical:
    "border-[color-mix(in_srgb,var(--ixai-risk-critical)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_9%,white)]",
  info: "border-[var(--ixai-border)] bg-white/70",
  warning:
    "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)]",
};

export function WorkspaceDailyBrief() {
  const [brief, setBrief] = useState<WorkspaceDailyBrief | null>(null);
  const [history, setHistory] = useState<DailyBriefHistorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    const [currentBrief, historySummary] = await Promise.all([
      getWorkspaceDailyBrief(),
      getDailyBriefHistorySummary(),
    ]);
    setBrief(currentBrief);
    setHistory(historySummary);
    setIsLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={FileText} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Workspace Daily Brief
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Rule-based daily workspace readback
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Combines Portfolio, Risk, FCN, Watchlist, Alerts, and Intelligence readback without AI model calls or external news fetching.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refresh()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "產生中" : "重新產生"}
        </button>
      </div>

      {brief ? (
        <>
          <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {brief.summary}
          </p>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {brief.sections.map((section) => (
              <article
                className={`rounded-xl border p-4 ${SEVERITY_CLASS[section.severity]}`}
                key={section.key}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                    {section.title}
                  </h3>
                  <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                    {section.severity}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            {brief.informationalOnlyDisclaimer}
          </p>
          {history ? (
            <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
              Daily Brief history foundation: {history.totalEntries} local readback entr{history.totalEntries === 1 ? "y" : "ies"}; source status {history.sourceStatus}. Durable history storage is not required in V6.40.
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

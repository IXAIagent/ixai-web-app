"use client";

import { useEffect, useRef, useState } from "react";
import { Newspaper, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  buildEmptyWorkspaceMorningBrief,
  getWorkspaceMorningBriefV14,
  type WorkspaceMorningBrief,
} from "@/src/lib/workspace/morning-brief";
import { runWorkspaceRuntimeBudget, runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

export function WorkspaceMorningBriefV14Card({
  autoLoad = false,
  compact = false,
}: {
  autoLoad?: boolean;
  compact?: boolean;
}) {
  const [brief, setBrief] = useState<WorkspaceMorningBrief>(() => buildEmptyWorkspaceMorningBrief());
  const [isLoading, setIsLoading] = useState(autoLoad);
  const mountedRef = useRef(false);

  async function refresh(force = false) {
    setIsLoading(true);
    const fallback = buildEmptyWorkspaceMorningBrief();
    const result = await runWorkspaceRuntimeBudget(
      "workspace-morning-brief-v14",
      () =>
        runWorkspaceSafe(
          "workspace-morning-brief-v14",
          () => getWorkspaceMorningBriefV14({ force }),
          fallback,
        ),
      {
        data: fallback,
        error: null,
        label: "workspace-morning-brief-v14",
        ok: true,
      },
      { auto: !force, threshold: 2, timeoutMs: 4500 },
    );

    if (!mountedRef.current) return;
    setBrief(result.data ?? fallback);
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

  const visibleSections = compact ? brief.sections.slice(0, 4) : brief.sections;

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Newspaper} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V14.5 Workspace Morning Brief
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              {brief.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              On-demand Workspace-readable brief. No scheduled delivery, notification send, AI model call, or trading signal.
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
          {isLoading ? "讀取中" : "Run brief"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Status
          </p>
          <p className="mt-2 font-mono text-xl font-semibold text-[var(--ixai-forest)]">
            {brief.status}
          </p>
        </article>
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Source
          </p>
          <p className="mt-2 font-mono text-xl font-semibold text-[var(--ixai-forest)]">
            {brief.sourceStatus}
          </p>
        </article>
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Warnings
          </p>
          <p className="mt-2 font-mono text-xl font-semibold text-[var(--ixai-forest)]">
            {brief.warnings.length}
          </p>
        </article>
      </div>

      <div className={`mt-5 grid gap-3 ${compact ? "lg:grid-cols-2" : "xl:grid-cols-3"}`}>
        {visibleSections.map((section) => (
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4" key={section.key}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-base font-semibold text-[var(--ixai-forest)]">{section.title}</p>
              <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/65 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {section.severity}
              </span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
              {section.source} · {section.dataQuality}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {section.summary}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        {brief.informationalOnlyDisclaimer}
      </p>
    </section>
  );
}

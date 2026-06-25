"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Newspaper, RefreshCw } from "lucide-react";

import { MorningBriefSummaryCard } from "@/components/morning-brief/morning-brief-summary-card";
import { MorningFcnCard } from "@/components/morning-brief/morning-fcn-card";
import { MorningRiskCard } from "@/components/morning-brief/morning-risk-card";
import { getWorkspaceMorningSnapshot } from "@/src/lib/morning-brief";
import type { MorningSnapshot } from "@/src/lib/morning-brief";

type LoadState = "error" | "loading" | "ready";

export function MorningBriefStatus({ compact = false }: { compact?: boolean }) {
  const [snapshot, setSnapshot] = useState<MorningSnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const loadSnapshot = useCallback(async () => {
    setLoadState("loading");
    try {
      setSnapshot(await getWorkspaceMorningSnapshot());
      setLoadState("ready");
    } catch {
      setSnapshot(null);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSnapshot();
    });
  }, [loadSnapshot]);

  if (compact) {
    return (
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V16 Morning Brief Engine
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
              Morning Brief Preview
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {snapshot
                ? `${snapshot.brief.portfolioSummary.positionCount} position(s), ${snapshot.brief.riskSummary.riskLevel} risk, news placeholder.`
                : "Loading Morning Brief snapshot."}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--ixai-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            {loadState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Read-only
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            V16 Morning Brief Engine
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--ixai-forest)]">
            <Newspaper className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            Morning Brief Preview
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Read-only morning snapshot built from Portfolio, V15 Risk, FCN, and a news placeholder. No Telegram, scheduler, broker, trading, or AI recommendation logic is enabled.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          disabled={loadState === "loading"}
          onClick={() => void loadSnapshot()}
          type="button"
        >
          {loadState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--ixai-gold)]" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          )}
          Refresh
        </button>
      </div>

      {snapshot ? (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <MorningBriefSummaryCard summary={snapshot.brief.portfolioSummary} />
            <MorningRiskCard summary={snapshot.brief.riskSummary} />
            <MorningFcnCard summary={snapshot.brief.fcnSummary} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
              <p className="text-sm font-semibold text-[var(--ixai-forest)]">News Placeholder</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                Source: {snapshot.brief.newsSummary.newsSource}. Status: {snapshot.brief.newsSummary.status}. Coverage: {snapshot.brief.newsSummary.coverage.join(", ")}.
              </p>
            </article>
            <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
              <p className="text-sm font-semibold text-[var(--ixai-forest)]">Diagnostics</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                Phase {snapshot.brief.diagnostics.phase}; DB writes off; scheduler off; Telegram off; broker off; AI recommendation off.
              </p>
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                External API calls: off. News: placeholder only. Risk source: {snapshot.brief.diagnostics.riskEngineSource}.
              </p>
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                Monitoring and intelligence workflow only. No buy/sell instructions, order execution, return promise, or auto trading.
              </p>
            </article>
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
          {loadState === "error"
            ? "Morning Brief snapshot could not be built. Existing Workspace modules remain available."
            : "Loading Morning Brief snapshot."}
        </p>
      )}
    </section>
  );
}

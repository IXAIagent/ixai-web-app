"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Newspaper, RefreshCw } from "lucide-react";

import {
  getWorkspaceMorningBriefV1,
  type MorningBriefV1,
} from "@/src/lib/morning-brief";

type LoadState = "error" | "loading" | "ready";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function MorningBriefLiveCard() {
  const [brief, setBrief] = useState<MorningBriefV1 | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "unavailable">("idle");

  const loadBrief = useCallback(async () => {
    setLoadState("loading");
    try {
      setBrief(await getWorkspaceMorningBriefV1());
      setLoadState("ready");
    } catch {
      setBrief(null);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadBrief();
    });
  }, [loadBrief]);

  const topSections = useMemo(() => brief?.sections.slice(0, 8) ?? [], [brief]);

  async function copyShareText() {
    if (!brief?.shareText || !navigator.clipboard) {
      setCopyState("unavailable");
      return;
    }

    await navigator.clipboard.writeText(brief.shareText);
    setCopyState("copied");
  }

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Morning Brief v1
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--ixai-forest)]">
            <Newspaper className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            Today&apos;s Workspace Brief
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Portfolio, live valuation, FCN, risk, Watchlist, Alerts, and quote diagnostics in one read-only morning summary. News remains placeholder-only.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
            disabled={!brief || loadState === "loading"}
            onClick={() => void copyShareText()}
            type="button"
          >
            <Copy className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            {copyState === "copied" ? "Copied" : copyState === "unavailable" ? "Unavailable" : "Copy"}
          </button>
          <button
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
            disabled={loadState === "loading"}
            onClick={() => void loadBrief()}
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
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Status", brief?.sourceStatus ?? (loadState === "error" ? "unavailable" : "loading")],
          ["Provider", brief?.liveMarket.provider.toUpperCase() ?? "--"],
          ["As Of", formatDateTime(brief?.asOf)],
          ["Alerts", String(brief?.alerts?.alertCount ?? 0)],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 break-words font-mono text-lg font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {topSections.map((section) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={section.label}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-[var(--ixai-forest)]">
                  {section.label}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                  {section.source}
                </p>
              </div>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {section.status}
              </span>
            </div>
            <p className="mt-3 font-mono text-lg font-semibold text-[var(--ixai-forest)]">
              {section.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {section.detail}
            </p>
          </article>
        ))}
      </div>

      {brief ? (
        <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          {brief.informationalOnlyDisclaimer}
        </p>
      ) : null}

      {loadState === "error" ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-800">
          Morning Brief v1 could not be built. Existing Workspace cards remain available.
        </p>
      ) : null}
    </section>
  );
}

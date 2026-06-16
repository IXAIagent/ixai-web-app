"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

import { FeatureIcon } from "@/components/ui/feature-icon";
import { loadFcnManualPriceOverrides } from "@/src/lib/fcn/manual-price-overrides";
import { buildIntelligenceCenterReadback } from "@/src/lib/intelligence/intelligence-center";
import type {
  IntelligenceCenterReadback,
  IntelligenceCenterSourceStatus,
  IntelligenceCenterStatus,
} from "@/src/lib/intelligence/intelligence-center-types";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { FCNPosition } from "@/src/types/fcn-position";
import type { StockPosition } from "@/src/types/stock-position";

type LoadStatus = "error" | "loading" | "ready" | "unauthenticated";

type PositionListResponse<T> = {
  ok: boolean;
  positions?: T[];
  status?: string;
};

type PortfolioDashboardResponse = {
  ok: boolean;
  status?: string;
  summary?: {
    portfolioCount?: number;
  };
};

type ReadResult<T> = {
  error: boolean;
  positions: T[];
};

type PortfolioReadResult = {
  error: boolean;
  portfolioCount: number;
};

const STATUS_LABEL: Record<IntelligenceCenterStatus, string> = {
  error: "Needs Review",
  placeholder: "Readiness",
  ready: "Ready",
  unauthenticated: "Login Required",
};

const STATUS_CLASS: Record<IntelligenceCenterStatus, string> = {
  error: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)] text-[var(--ixai-forest)]",
  placeholder: "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest-soft)]",
  ready: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[var(--ixai-forest)]",
  unauthenticated: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] text-[var(--ixai-forest)]",
};

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

async function readPositions<T>(
  path: string,
  headers: HeadersInit,
): Promise<ReadResult<T>> {
  try {
    const response = await fetch(path, {
      cache: "no-store",
      headers,
    });
    const payload = (await response.json().catch(() => ({}))) as PositionListResponse<T>;

    if (!response.ok || !payload.ok) {
      return { error: true, positions: [] };
    }

    return { error: false, positions: payload.positions ?? [] };
  } catch {
    return { error: true, positions: [] };
  }
}

async function readPortfolioDashboard(headers: HeadersInit): Promise<PortfolioReadResult> {
  try {
    const response = await fetch("/api/portfolio/dashboard", {
      cache: "no-store",
      headers,
    });
    const payload = (await response.json().catch(() => ({}))) as PortfolioDashboardResponse;

    if (!response.ok || !payload.ok) {
      return { error: true, portfolioCount: 0 };
    }

    return {
      error: false,
      portfolioCount: payload.summary?.portfolioCount ?? 0,
    };
  } catch {
    return { error: true, portfolioCount: 0 };
  }
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

export function IntelligenceCenterWorkspace() {
  const [readback, setReadback] = useState<IntelligenceCenterReadback>(() => buildInitialReadback());
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const loadIntelligenceCenter = useCallback(async () => {
    setStatus("loading");
    setMessage(null);

    const headers = await getSupabaseAuthorizationHeaders();

    if (!headers) {
      setReadback(
        buildIntelligenceCenterReadback({
          cryptoPositions: [],
          fcnPositions: [],
          stockPositions: [],
          unauthenticated: true,
        }),
      );
      setStatus("unauthenticated");
      return;
    }

    const [portfolioResult, fcnResult, stockResult, cryptoResult] = await Promise.all([
      readPortfolioDashboard(headers),
      readPositions<FCNPosition>("/api/fcn", headers),
      readPositions<StockPosition>("/api/stocks", headers),
      readPositions<CryptoPosition>("/api/crypto", headers),
    ]);

    setReadback(
      buildIntelligenceCenterReadback({
        cryptoError: cryptoResult.error,
        cryptoPositions: cryptoResult.positions,
        fcnError: fcnResult.error,
        fcnPositions: fcnResult.positions,
        manualPrices: loadFcnManualPriceOverrides(),
        portfolioCount: portfolioResult.portfolioCount,
        portfolioError: portfolioResult.error,
        stockError: stockResult.error,
        stockPositions: stockResult.positions,
      }),
    );

    if (portfolioResult.error || fcnResult.error || stockResult.error || cryptoResult.error) {
      setStatus("error");
      setMessage("Some intelligence sources could not be read. Available readiness states are still shown.");
      return;
    }

    setStatus("ready");
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadIntelligenceCenter();
    });
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
                v3.40 Intelligence Center v1
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                Intelligence Center
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                Workspace intelligence brings Daily / Weekly, Market context, FCN highlights,
                portfolio-aware readiness, news readiness, and commentary readiness into one working area.
              </p>
            </div>
            <FeatureIcon icon={Brain} shadow={false} tone="cream" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="FCN Highlights"
              note="Existing /api/fcn readback and v3.20 helper output."
              value={formatNumber(readback.stats.fcnCount)}
            />
            <MetricCard
              label="Stock Positions"
              note="Readiness from /api/stocks, not a new intelligence engine."
              value={formatNumber(readback.stats.stockCount)}
            />
            <MetricCard
              label="Crypto Positions"
              note="Readiness from /api/crypto, not a new market provider."
              value={formatNumber(readback.stats.cryptoCount)}
            />
            <MetricCard
              label="Portfolios"
              note="Readiness from existing portfolio dashboard API."
              value={formatNumber(readback.stats.portfolioCount)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Intelligence Overview
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                Workspace intelligence entry points
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
                These links keep public intelligence as source material while this workspace organizes what the user should review next.
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
              Refresh
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
                  Today&apos;s Portfolio-Aware Highlights
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                  What is ready to review
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
                登入後才能讀取 portfolio-aware FCN / Stock / Crypto intelligence readiness。
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
                  FCN Intelligence Highlights
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                  Reused from FCN Center
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Total FCNs", readback.fcn.summary.totalCount],
                ["High Risk", readback.fcn.summary.highRiskCount],
                ["Watch", readback.fcn.summary.watchCount],
                ["Unknown Risk", readback.fcn.summary.unknownRiskCount],
                ["Upcoming Events", readback.fcn.summary.upcomingEventsCount],
                ["Unique Underlyings", readback.fcn.summary.uniqueUnderlyingCount],
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
              Open FCN Center
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
          instruction. No order execution. No auto trading. No return promise. v3.40 does not
          connect external AI, external news, broker sync, live market data, or trading logic.
        </p>
      </section>
    </main>
  );
}

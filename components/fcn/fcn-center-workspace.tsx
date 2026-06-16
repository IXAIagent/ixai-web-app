"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Layers3,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import type { FCNPosition } from "@/src/types/fcn-position";

type FCNListResponse = {
  message?: string;
  ok: boolean;
  positions?: FCNPosition[];
  status?: string;
};

type LoadStatus = "error" | "loading" | "ready" | "unauthenticated";

const STATUS_LABEL: Record<LoadStatus, string> = {
  error: "Readback Error",
  loading: "Loading",
  ready: "Enabled",
  unauthenticated: "Sign In Required",
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "未設定";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatNumber(value: number | null | undefined, digits = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "未填";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "未填";
  }

  return `${formatNumber(value, 2)}%`;
}

function buildTotalNotionalLabel(positions: FCNPosition[]) {
  const totals = new Map<string, number>();

  positions.forEach((position) => {
    if (typeof position.notionalAmount !== "number" || !Number.isFinite(position.notionalAmount)) {
      return;
    }

    totals.set(position.currency, (totals.get(position.currency) ?? 0) + position.notionalAmount);
  });

  if (totals.size === 0) {
    return "未填";
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, total]) => `${currency} ${formatNumber(total)}`)
    .join(" / ");
}

function getObservationFrequencyLabel(position: FCNPosition) {
  const scheduleCount = position.observationSchedule.length;

  if (scheduleCount > 1) {
    return `${scheduleCount} observations`;
  }

  if (scheduleCount === 1) {
    return "Single observation";
  }

  return "未設定";
}

function getUpcomingCouponCount(positions: FCNPosition[]) {
  const now = new Date();

  return positions.reduce((count, position) => {
    const futureCoupons = position.observationSchedule.filter((item) => {
      if (!item.couponPaymentDate) {
        return false;
      }

      const couponDate = new Date(item.couponPaymentDate);
      return !Number.isNaN(couponDate.getTime()) && couponDate >= now;
    });

    return count + futureCoupons.length;
  }, 0);
}

function getUniqueUnderlyingCount(positions: FCNPosition[]) {
  const symbols = new Set<string>();

  positions.forEach((position) => {
    position.underlyings.forEach((underlying) => {
      if (underlying.symbol) {
        symbols.add(underlying.symbol);
      }
    });
  });

  return symbols.size;
}

function getUnderlyingExposure(positions: FCNPosition[]) {
  const counts = new Map<string, number>();

  positions.forEach((position) => {
    position.underlyings.forEach((underlying) => {
      const symbol = underlying.symbol.trim().toUpperCase();

      if (!symbol) {
        return;
      }

      counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([symbol, count]) => ({ count, symbol }))
    .sort((a, b) => b.count - a.count || a.symbol.localeCompare(b.symbol));
}

function getCouponSchedule(positions: FCNPosition[]) {
  return positions
    .flatMap((position) =>
      position.observationSchedule.map((item, index) => ({
        ...item,
        fcnId: position.id,
        fcnName: position.name,
        index,
      })),
    )
    .sort((a, b) => {
      const aDate = a.observationEnd ?? a.observationStart ?? "";
      const bDate = b.observationEnd ?? b.observationStart ?? "";
      return aDate.localeCompare(bDate);
    });
}

function MetricTile({
  label,
  value,
  note,
}: {
  label: string;
  note?: string;
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
      {note ? <p className="mt-2 text-xs leading-5 text-white/60">{note}</p> : null}
    </article>
  );
}

function ScheduleCard({ item }: { item: ReturnType<typeof getCouponSchedule>[number] }) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-white/80 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            {item.periodLabel || `Observation ${item.index + 1}`}
          </p>
          <h3 className="mt-2 text-base font-semibold text-[var(--ixai-forest)]">
            {item.fcnName}
          </h3>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ixai-forest)]">
          {item.status || "scheduled"}
        </span>
      </div>
      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.68)] p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Observation Date
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--ixai-forest)]">
            {formatDate(item.observationEnd ?? item.observationStart)}
          </dd>
        </div>
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.68)] p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Coupon Date
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--ixai-forest)]">
            {formatDate(item.couponPaymentDate)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function FcnPositionCard({ position }: { position: FCNPosition }) {
  const schedulePreview = position.observationSchedule.slice(0, 3);

  return (
    <article className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/86 p-5 shadow-[0_16px_42px_rgba(9,41,31,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            FCN Position
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            {position.name}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {position.issuer ? `Issuer: ${position.issuer}` : "Issuer 未填"} · Created{" "}
            {formatDate(position.createdAt)}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[rgba(176,141,87,0.36)] bg-[rgba(176,141,87,0.10)] px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
          {position.status}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Currency", position.currency],
          ["Notional", formatNumber(position.notionalAmount)],
          ["Strike", formatPercent(position.strikePct)],
          ["KI / KO", `${formatPercent(position.kiPct)} / ${formatPercent(position.koPct)}`],
          ["Coupon", formatPercent(position.couponRatePct)],
          ["Observation", getObservationFrequencyLabel(position)],
          ["Underlying Count", String(position.underlyings.length)],
          ["Worst-of Status", position.worstOfSummary.status],
        ].map(([label, value]) => (
          <div
            className="min-w-0 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3"
            key={label}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[var(--ixai-forest)]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.56)] p-4">
        <div className="flex items-center gap-2">
          <FeatureIcon icon={Layers3} size="sm" shadow={false} />
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Underlyings</h3>
        </div>
        {position.underlyings.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {position.underlyings.map((underlying) => (
              <article
                className="rounded-lg border border-[var(--ixai-border)] bg-white/74 p-3"
                key={underlying.id}
              >
                <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                  {underlying.symbol}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  {underlying.name || "Name 未填"} {underlying.market ? `· ${underlying.market}` : ""}
                </p>
                <dl className="mt-3 grid gap-2 text-xs text-[var(--ixai-forest-soft)]">
                  <div className="flex justify-between gap-3">
                    <dt>Initial</dt>
                    <dd className="font-semibold text-[var(--ixai-forest)]">
                      {formatNumber(underlying.initialPrice, 2)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Current</dt>
                    <dd className="font-semibold text-[var(--ixai-forest)]">
                      {formatNumber(underlying.currentPrice, 2)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>KI / KO</dt>
                    <dd className="font-semibold text-[var(--ixai-forest)]">
                      {formatNumber(underlying.kiPrice, 2)} / {formatNumber(underlying.koPrice, 2)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/74 p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            此 FCN 尚未儲存 underlyings。
          </p>
        )}
      </section>

      {schedulePreview.length > 0 ? (
        <section className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/60 p-4">
          <div className="flex items-center gap-2">
            <FeatureIcon icon={CalendarDays} size="sm" shadow={false} />
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
              Observation Preview
            </h3>
          </div>
          <div className="mt-4 grid gap-2 lg:grid-cols-3">
            {schedulePreview.map((item, index) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3"
                key={`${position.id}-${item.observationEnd ?? item.observationStart ?? index}`}
              >
                <p className="text-xs font-semibold text-[var(--ixai-forest)]">
                  {item.periodLabel || `Observation ${index + 1}`}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  Observation: {formatDate(item.observationEnd ?? item.observationStart)}
                </p>
                <p className="text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  Coupon: {formatDate(item.couponPaymentDate)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export function FCNCenterWorkspace() {
  const [positions, setPositions] = useState<FCNPosition[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const loadPositions = useCallback(async () => {
    setStatus("loading");
    setMessage(null);

    try {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        setPositions([]);
        setStatus("unauthenticated");
        return;
      }

      const response = await fetch("/api/fcn", {
        cache: "no-store",
        headers,
      });
      const payload = (await response.json().catch(() => ({}))) as FCNListResponse;

      if (!response.ok || !payload.ok) {
        setPositions([]);
        setStatus(response.status === 401 ? "unauthenticated" : "error");
        setMessage(payload.message ?? "FCN positions could not be loaded.");
        return;
      }

      setPositions(payload.positions ?? []);
      setStatus("ready");
    } catch {
      setPositions([]);
      setStatus("error");
      setMessage("FCN positions could not be loaded.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPositions();
    });
  }, [loadPositions]);

  const totalNotional = useMemo(() => buildTotalNotionalLabel(positions), [positions]);
  const upcomingCouponCount = useMemo(() => getUpcomingCouponCount(positions), [positions]);
  const uniqueUnderlyingCount = useMemo(() => getUniqueUnderlyingCount(positions), [positions]);
  const underlyingExposure = useMemo(() => getUnderlyingExposure(positions), [positions]);
  const couponSchedule = useMemo(() => getCouponSchedule(positions), [positions]);

  const showEmptyState = status === "ready" && positions.length === 0;

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                FCN Center
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                FCN Position Foundation
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                從現有 FCN Wizard 與 Supabase persistence 讀取 FCN positions、
                underlyings、barrier terms 與 observation schedule，建立第一條 Input → FCN Center readback。
              </p>
            </div>
            <FeatureIcon icon={ShieldCheck} shadow={false} tone="cream" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="FCN Count" value={String(positions.length)} />
            <MetricTile label="Total Notional" value={totalNotional} />
            <MetricTile label="Upcoming Coupons" value={String(upcomingCouponCount)} />
            <MetricTile label="Unique Underlyings" value={String(uniqueUnderlyingCount)} />
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Data Path
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                FCN Wizard → API → Supabase → FCN Center
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
                本頁使用現有 `/api/fcn` 與 authenticated Supabase session，不新增 migration、
                market data、AI provider、broker sync 或 localStorage draft store。
              </p>
            </div>
            <button
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
              disabled={status === "loading"}
              onClick={() => void loadPositions()}
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

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Readback Status", STATUS_LABEL[status]],
              ["Repository Source", "Supabase /api/fcn"],
              ["Persistence", "fcn_positions + fcn_underlyings"],
            ].map(([label, value]) => (
              <div
                className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                key={label}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  {label}
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-[var(--ixai-forest)]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {message ? (
            <p className="mt-5 rounded-xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4 text-sm leading-7 text-[var(--ixai-forest)]">
              {message}
            </p>
          ) : null}
        </section>

        {status === "loading" ? (
          <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:p-6">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--ixai-gold)]" aria-hidden="true" />
              正在讀取 FCN positions...
            </span>
          </section>
        ) : null}

        {status === "unauthenticated" ? (
          <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <h2 className="text-xl font-semibold text-[var(--ixai-forest)]">
              請先登入 IXAI
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              FCN Center 需要讀取你的 Supabase FCN positions。登入後即可查看已建立的 FCN。
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] sm:w-fit"
              href="/login"
            >
              前往登入
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        {showEmptyState ? (
          <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  Empty State
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                  尚未建立 FCN
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  先從 Asset Input 建立 FCN。建立成功後回到本頁，即可看到 position、
                  underlyings、KI / KO 與 observation schedule readback。
                </p>
              </div>
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] sm:w-fit"
                href="/my-ixai/input/fcn"
              >
                新增 FCN
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            </div>
          </section>
        ) : null}

        {positions.length > 0 ? (
          <>
            <section className="grid gap-4">{positions.map((position) => (
              <FcnPositionCard key={position.id} position={position} />
            ))}</section>

            <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
              <div className="flex items-center gap-3">
                <FeatureIcon icon={CircleDollarSign} shadow={false} />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                    Underlying Exposure
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                    標的出現次數
                  </h2>
                </div>
              </div>
              {underlyingExposure.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {underlyingExposure.map((item) => (
                    <article
                      className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                      key={item.symbol}
                    >
                      <p className="font-mono text-lg font-semibold text-[var(--ixai-forest)]">
                        {item.symbol}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                        {item.count} position{item.count > 1 ? "s" : ""}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  目前 FCN 尚未儲存 underlyings。
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
              <div className="flex items-center gap-3">
                <FeatureIcon icon={CalendarDays} shadow={false} />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                    Coupon Calendar
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
                    Observation / Coupon Readback
                  </h2>
                </div>
              </div>
              {couponSchedule.length > 0 ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {couponSchedule.map((item) => (
                    <ScheduleCard
                      item={item}
                      key={`${item.fcnId}-${item.observationEnd ?? item.observationStart ?? item.index}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  目前沒有 observation / coupon schedule。
                </p>
              )}
            </section>
          </>
        ) : null}

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          本頁僅用於 FCN 部位 readback、條件整理與風險監控資料準備。不接外部行情、不接 AI、不接券商、
          不提供投資建議、產品推薦、買賣建議、目標價、報酬承諾或自動交易。
        </p>
      </section>
    </main>
  );
}

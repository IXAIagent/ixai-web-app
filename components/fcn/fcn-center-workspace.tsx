"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  CalendarDays,
  Gauge,
  Layers3,
  Loader2,
  PencilLine,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { FcnRiskSummary } from "@/components/fcn/fcn-risk-summary";
import { FcnScheduleSummary } from "@/components/fcn/fcn-schedule-summary";
import { LiveFcnUnderlyingStatusCard } from "@/components/fcn/live-fcn-underlying-status-card";
import {
  buildFcnIntelligenceCenterReadback,
  calculateUnderlyingRisk,
  isVisibleForLifecycleFilter,
  type FCNConcentrationItem,
  type FCNIntelligenceRiskStatus,
  type FCNLifecycleFilter,
  type FCNLifecycleStatus,
  type FCNManualPriceOverrides,
  type FCNPositionRiskReadback,
  type FCNTimelineEvent,
} from "@/src/lib/fcn/intelligence-center";
import {
  FCN_MANUAL_PRICE_EVENT,
  loadFcnManualPriceOverrides,
  saveFcnManualPriceOverrides,
} from "@/src/lib/fcn/manual-price-overrides";
import {
  INPUT_TRUTH_BRIDGE_EVENT,
  loadPendingPortfolioInputs,
  type PendingPortfolioInputRecord,
} from "@/src/lib/portfolio/input/input-truth-bridge";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import { V14_FCN_WRITE_STATUS_EVENT } from "@/src/lib/workspace/fcn-database-activation";
import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";

type FCNListResponse = {
  message?: string;
  ok: boolean;
  positions?: FCNPosition[];
  status?: string;
};

type LoadStatus = "error" | "loading" | "ready" | "unauthenticated";

type FCNPriceUpdateRow = {
  currentPrice: number | null;
  distanceToKiPct: number | null;
  fcnCount: number;
  kiPrice: number | null;
  missingPrice: boolean;
  status: FCNIntelligenceRiskStatus;
  symbol: string;
};

const STATUS_LABEL: Record<LoadStatus, string> = {
  error: "Readback Error",
  loading: "Loading",
  ready: "Enabled",
  unauthenticated: "Sign In Required",
};

const RISK_STATUS_LABEL: Record<FCNIntelligenceRiskStatus, string> = {
  GREEN: "GREEN",
  RED: "RED",
  UNKNOWN: "UNKNOWN",
  YELLOW: "YELLOW",
};

const RISK_STATUS_COPY: Record<FCNIntelligenceRiskStatus, string> = {
  GREEN: "Worst KI distance is above 10%.",
  RED: "At least one underlying is at or below KI.",
  UNKNOWN: "Current price or KI input is missing.",
  YELLOW: "Worst KI distance is within 10%.",
};

const RISK_STATUS_CLASS: Record<FCNIntelligenceRiskStatus, string> = {
  GREEN: "border-emerald-200 bg-emerald-50 text-emerald-800",
  RED: "border-rose-200 bg-rose-50 text-rose-800",
  UNKNOWN: "border-slate-200 bg-slate-50 text-slate-700",
  YELLOW: "border-amber-200 bg-amber-50 text-amber-800",
};

const RISK_DOT_CLASS: Record<FCNIntelligenceRiskStatus, string> = {
  GREEN: "bg-emerald-500",
  RED: "bg-rose-500",
  UNKNOWN: "bg-slate-400",
  YELLOW: "bg-amber-500",
};

const LIFECYCLE_STATUS_LABEL: Record<FCNLifecycleStatus, string> = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  CALLED: "CALLED",
  MATURED: "MATURED",
  UNKNOWN: "UNKNOWN",
};

const LIFECYCLE_STATUS_CLASS: Record<FCNLifecycleStatus, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ARCHIVED: "border-slate-200 bg-slate-50 text-slate-700",
  CALLED: "border-sky-200 bg-sky-50 text-sky-800",
  MATURED: "border-violet-200 bg-violet-50 text-violet-800",
  UNKNOWN: "border-amber-200 bg-amber-50 text-amber-800",
};

const EVENT_TYPE_LABEL: Record<FCNTimelineEvent["eventType"], string> = {
  coupon_observation: "Coupon Observation",
  coupon_payment: "Coupon Payment",
  ko_observation: "KO Observation",
  maturity: "Maturity",
};

const EVENT_STATUS_LABEL: Record<FCNTimelineEvent["status"], string> = {
  overdue: "Overdue",
  today: "Today",
  upcoming: "Upcoming",
};

const LIFECYCLE_FILTERS: Array<{ label: string; value: FCNLifecycleFilter }> = [
  { label: "Active", value: "active" },
  { label: "All", value: "all" },
  { label: "Archived", value: "archived" },
  { label: "Matured / Called", value: "closed" },
];

const MAX_TIMELINE_EVENTS = 10;

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

function formatSignedPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "UNKNOWN";
  }

  return `${value >= 0 ? "+" : ""}${formatNumber(value, 2)}%`;
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

function getUniqueUnderlyingPriceRows(
  positions: FCNPosition[],
  manualPrices: FCNManualPriceOverrides,
) {
  const rows = new Map<
    string,
    FCNPriceUpdateRow
  >();
  const seenBySymbol = new Map<string, Set<string>>();

  positions.forEach((position) => {
    position.underlyings.forEach((underlying) => {
      const symbol = underlying.symbol.trim().toUpperCase();

      if (!symbol) {
        return;
      }

      const risk = calculateUnderlyingRisk(underlying, manualPrices);
      const seenPositions = seenBySymbol.get(symbol) ?? new Set<string>();
      const existing =
        rows.get(symbol) ??
        ({
          currentPrice: risk.currentPrice,
          distanceToKiPct: risk.distanceToKiPct,
          fcnCount: 0,
          kiPrice: underlying.kiPrice,
          missingPrice: risk.missingCurrentPrice,
          status: risk.status,
          symbol,
        } satisfies FCNPriceUpdateRow);

      if (!seenPositions.has(position.id)) {
        existing.fcnCount += 1;
        seenPositions.add(position.id);
        seenBySymbol.set(symbol, seenPositions);
      }

      if (
        existing.distanceToKiPct === null ||
        (risk.distanceToKiPct !== null && risk.distanceToKiPct < existing.distanceToKiPct)
      ) {
        existing.currentPrice = risk.currentPrice;
        existing.distanceToKiPct = risk.distanceToKiPct;
        existing.kiPrice = underlying.kiPrice;
        existing.status = risk.status;
      }

      existing.missingPrice = existing.missingPrice || risk.missingCurrentPrice;
      rows.set(symbol, existing);
    });
  });

  return Array.from(rows.values()).toSorted(
    (a, b) => b.fcnCount - a.fcnCount || a.symbol.localeCompare(b.symbol),
  );
}

function parseManualPrice(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
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

function RiskBadge({ status }: { status: FCNIntelligenceRiskStatus }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${RISK_STATUS_CLASS[status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${RISK_DOT_CLASS[status]}`} />
      {RISK_STATUS_LABEL[status]}
    </span>
  );
}

function LifecycleBadge({ status }: { status: FCNLifecycleStatus }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${LIFECYCLE_STATUS_CLASS[status]}`}
    >
      {LIFECYCLE_STATUS_LABEL[status]}
    </span>
  );
}

function UnderlyingRiskCard({
  manualPrices,
  underlying,
}: {
  manualPrices: FCNManualPriceOverrides;
  underlying: FCNUnderlying;
}) {
  const underlyingRisk = calculateUnderlyingRisk(underlying, manualPrices);

  return (
    <article className="rounded-lg border border-[var(--ixai-border)] bg-white/74 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-mono text-sm font-semibold text-[var(--ixai-forest)]">
            {underlying.symbol}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
            {underlying.name || "Name 未填"} {underlying.market ? `· ${underlying.market}` : ""}
          </p>
        </div>
        <RiskBadge status={underlyingRisk.status} />
      </div>
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
            {formatNumber(underlyingRisk.currentPrice, 2)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>KI / KO</dt>
          <dd className="font-semibold text-[var(--ixai-forest)]">
            {formatNumber(underlying.kiPrice, 2)} / {formatNumber(underlying.koPrice, 2)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>KI Distance</dt>
          <dd className="font-semibold text-[var(--ixai-forest)]">
            {formatSignedPercent(underlyingRisk.distanceToKiPct)}
          </dd>
        </div>
      </dl>
      {underlyingRisk.missingCurrentPrice ? (
        <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
          Missing stored current price. KI distance is unavailable until price is recorded.
        </p>
      ) : null}
    </article>
  );
}

function FcnPositionCard({
  position,
  risk,
  manualPrices,
}: {
  manualPrices: FCNManualPriceOverrides;
  position: FCNPosition;
  risk: FCNPositionRiskReadback;
}) {
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
          ["Lifecycle", LIFECYCLE_STATUS_LABEL[risk.lifecycleStatus]],
          ["Risk Status", RISK_STATUS_LABEL[risk.riskStatus]],
          ["Risk Score", risk.riskScore === null ? "UNKNOWN" : String(risk.riskScore)],
          ["Worst Underlying", risk.worstUnderlying?.underlying.symbol ?? "UNKNOWN"],
          ["Worst KI Distance", formatSignedPercent(risk.worstKiDistancePct)],
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

      <section className={`mt-5 rounded-xl border p-4 ${RISK_STATUS_CLASS[risk.riskStatus]}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
              Position Risk Status
            </p>
            <p className="mt-2 text-sm font-semibold">{RISK_STATUS_COPY[risk.riskStatus]}</p>
            <p className="mt-2 text-xs leading-5">
              Worst underlying: {risk.worstUnderlying?.underlying.symbol ?? "UNKNOWN"} · Worst KI
              distance: {formatSignedPercent(risk.worstKiDistancePct)} · Score:{" "}
              {risk.riskScore === null ? "UNKNOWN" : risk.riskScore}
            </p>
            {risk.missingPriceCount > 0 ? (
              <p className="mt-2 text-xs leading-5">
                {risk.missingPriceCount} underlying
                {risk.missingPriceCount > 1 ? "s are" : " is"} missing stored current price.
              </p>
            ) : null}
            {risk.invalidDataCount > 0 ? (
              <p className="mt-2 text-xs leading-5">
                {risk.invalidDataCount} underlying
                {risk.invalidDataCount > 1 ? "s have" : " has"} invalid initial or KI input.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <RiskBadge status={risk.riskStatus} />
            <LifecycleBadge status={risk.lifecycleStatus} />
            <button
              className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[var(--ixai-forest-soft)] opacity-70"
              disabled
              title="Lifecycle persistence requires a dedicated API QA task."
              type="button"
            >
              <Archive className="h-3.5 w-3.5" aria-hidden="true" />
              {risk.lifecycleStatus === "ARCHIVED" ? "Restore disabled" : "Archive disabled"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.56)] p-4">
        <div className="flex items-center gap-2">
          <FeatureIcon icon={Layers3} size="sm" shadow={false} />
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Underlyings</h3>
        </div>
        {position.underlyings.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {position.underlyings.map((underlying) => (
              <UnderlyingRiskCard
                key={underlying.id}
                manualPrices={manualPrices}
                underlying={underlying}
              />
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

function LifecyclePanel({
  activeFilter,
  onFilterChange,
  summary,
}: {
  activeFilter: FCNLifecycleFilter;
  onFilterChange: (filter: FCNLifecycleFilter) => void;
  summary: {
    activeCount: number;
    archivedCount: number;
    calledCount: number;
    maturedCount: number;
    unknownStatusCount: number;
  };
}) {
  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Lifecycle
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            FCN Lifecycle Status
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Default view shows ACTIVE and UNKNOWN FCNs. Archive / restore persistence is disabled
            until a dedicated lifecycle QA task approves the existing API path.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LIFECYCLE_FILTERS.map((filter) => (
            <button
              className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold ${
                activeFilter === filter.value
                  ? "border-[var(--ixai-forest)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)]"
                  : "border-[var(--ixai-border)] bg-white text-[var(--ixai-forest)]"
              }`}
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Active", summary.activeCount],
          ["Archived", summary.archivedCount],
          ["Matured", summary.maturedCount],
          ["Called", summary.calledCount],
          ["Unknown", summary.unknownStatusCount],
        ].map(([label, value]) => (
          <div
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PriceUpdatePanel({
  manualPrices,
  onPriceChange,
  priceInputs,
  rows,
}: {
  manualPrices: FCNManualPriceOverrides;
  onPriceChange: (symbol: string, value: string) => void;
  priceInputs: Record<string, string>;
  rows: FCNPriceUpdateRow[];
}) {
  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={PencilLine} shadow={false} />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Price Update
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
            Manual Current Price Overlay
          </h2>
        </div>
      </div>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
        手動價格只儲存在本機瀏覽器 localStorage，用於立即重算本頁 KI distance 與風險狀態。
        這不是 live market data，也不會寫入 Supabase。
      </p>
      {rows.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {rows.map((row) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={row.symbol}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-base font-semibold text-[var(--ixai-forest)]">
                    {row.symbol}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                    {row.fcnCount} FCN exposure{row.fcnCount > 1 ? "s" : ""} · KI{" "}
                    {formatNumber(row.kiPrice, 2)}
                  </p>
                </div>
                <RiskBadge status={row.status} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--ixai-forest-soft)]">
                    Current Price
                  </span>
                  <input
                    className="mt-1 min-h-11 w-full rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] outline-none focus:border-[var(--ixai-gold)]"
                    inputMode="decimal"
                    onChange={(event) => onPriceChange(row.symbol, event.target.value)}
                    placeholder={row.currentPrice === null ? "Missing price" : String(row.currentPrice)}
                    value={priceInputs[row.symbol] ?? ""}
                  />
                </label>
                <button
                  className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
                  onClick={() => onPriceChange(row.symbol, "")}
                  type="button"
                >
                  Clear
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                Current: {formatNumber(row.currentPrice, 2)} · KI Distance:{" "}
                {formatSignedPercent(row.distanceToKiPct)}
                {manualPrices[row.symbol] !== undefined ? " · Local override active" : ""}
              </p>
              {row.missingPrice ? (
                <p className="mt-2 text-xs font-semibold text-amber-700">
                  Missing stored current price. Add a manual price to calculate risk locally.
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          目前沒有可更新的 FCN underlyings。
        </p>
      )}
    </section>
  );
}

function TimelinePanel({ events }: { events: FCNTimelineEvent[] }) {
  const visibleEvents = events.filter((event) => event.status !== "overdue").slice(0, MAX_TIMELINE_EVENTS);
  const overdueCount = events.filter((event) => event.status === "overdue").length;

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={CalendarDays} shadow={false} />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Timeline / Event Center
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
            Upcoming FCN Events
          </h2>
        </div>
      </div>
      {overdueCount > 0 ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          {overdueCount} stored event{overdueCount > 1 ? "s are" : " is"} overdue and should be
          reviewed for lifecycle cleanup.
        </p>
      ) : null}
      {visibleEvents.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {visibleEvents.map((event) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={`${event.fcnId}-${event.eventType}-${event.date}-${event.note}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                    {EVENT_TYPE_LABEL[event.eventType]}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-[var(--ixai-forest)]">
                    {event.fcnName}
                  </h3>
                </div>
                <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
                  {EVENT_STATUS_LABEL[event.status]}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--ixai-forest)]">
                {formatDate(event.date)}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                {event.note}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          目前沒有 upcoming observation、coupon payment、KO observation 或 maturity events。
        </p>
      )}
    </section>
  );
}

function ConcentrationPanel({ items }: { items: FCNConcentrationItem[] }) {
  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={Gauge} shadow={false} />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Underlying Concentration
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
            標的集中度
          </h2>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={item.symbol}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-semibold text-[var(--ixai-forest)]">
                    {item.symbol}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                    {item.symbol} × {item.fcnCount}
                  </p>
                </div>
                <RiskBadge status={item.riskStatus} />
              </div>
              <dl className="mt-4 grid gap-2 text-xs text-[var(--ixai-forest-soft)]">
                <div className="flex justify-between gap-3">
                  <dt>Total Notional</dt>
                  <dd className="font-semibold text-[var(--ixai-forest)]">
                    {formatNumber(item.totalNotional)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Missing Price</dt>
                  <dd className="font-semibold text-[var(--ixai-forest)]">
                    {item.missingPrice ? "Yes" : "No"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          目前 FCN 尚未儲存 underlyings。
        </p>
      )}
    </section>
  );
}

export function FCNCenterWorkspace() {
  const [lifecycleFilter, setLifecycleFilter] = useState<FCNLifecycleFilter>("active");
  const [manualPrices, setManualPrices] = useState<FCNManualPriceOverrides>({});
  const [pendingFcnInputs, setPendingFcnInputs] = useState<PendingPortfolioInputRecord[]>([]);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
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
    const refreshAfterV14Write = () => {
      void loadPositions();
    };

    queueMicrotask(() => {
      void loadPositions();
    });

    window.addEventListener(V14_FCN_WRITE_STATUS_EVENT, refreshAfterV14Write);

    return () => {
      window.removeEventListener(V14_FCN_WRITE_STATUS_EVENT, refreshAfterV14Write);
    };
  }, [loadPositions]);

  useEffect(() => {
    const loadManualPrices = () => {
      const stored = loadFcnManualPriceOverrides();
      setManualPrices(stored);
      setPriceInputs(
        Object.fromEntries(
          Object.entries(stored).map(([symbol, value]) => [symbol, String(value)]),
        ),
      );
    };

    loadManualPrices();
    window.addEventListener(FCN_MANUAL_PRICE_EVENT, loadManualPrices);

    return () => {
      window.removeEventListener(FCN_MANUAL_PRICE_EVENT, loadManualPrices);
    };
  }, []);

  useEffect(() => {
    function loadPendingInputs() {
      setPendingFcnInputs(loadPendingPortfolioInputs().filter((input) => input.category === "FCN"));
    }

    loadPendingInputs();
    window.addEventListener(INPUT_TRUTH_BRIDGE_EVENT, loadPendingInputs);
    window.addEventListener("ixai:portfolio-input:changed", loadPendingInputs);
    window.addEventListener("storage", loadPendingInputs);

    return () => {
      window.removeEventListener(INPUT_TRUTH_BRIDGE_EVENT, loadPendingInputs);
      window.removeEventListener("ixai:portfolio-input:changed", loadPendingInputs);
      window.removeEventListener("storage", loadPendingInputs);
    };
  }, []);

  const intelligence = useMemo(
    () => buildFcnIntelligenceCenterReadback(positions, manualPrices),
    [manualPrices, positions],
  );
  const priceRows = useMemo(
    () => getUniqueUnderlyingPriceRows(positions, manualPrices),
    [manualPrices, positions],
  );
  const visiblePositions = useMemo(
    () =>
      positions.filter((position) => {
        const positionRisk = intelligence.positionRisks.get(position.id);
        return isVisibleForLifecycleFilter(positionRisk?.lifecycleStatus ?? "UNKNOWN", lifecycleFilter);
      }),
    [intelligence.positionRisks, lifecycleFilter, positions],
  );

  const showEmptyState = status === "ready" && positions.length === 0 && pendingFcnInputs.length === 0;

  function handleManualPriceChange(symbol: string, value: string) {
    const normalizedSymbol = symbol.trim().toUpperCase();
    setPriceInputs((current) => ({
      ...current,
      [normalizedSymbol]: value,
    }));

    const parsed = parseManualPrice(value);
    const nextPrices = { ...manualPrices };

    if (parsed === null) {
      delete nextPrices[normalizedSymbol];
    } else {
      nextPrices[normalizedSymbol] = parsed;
    }

    setManualPrices(nextPrices);
    saveFcnManualPriceOverrides(nextPrices);
  }

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                v3.20 FCN Intelligence Center
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                FCN Management and Risk Workspace
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                從現有 FCN Wizard 與 Supabase persistence 讀取 FCN positions、
                underlyings、barrier terms 與 observation schedule，加入 lifecycle、manual price
                overlay、timeline、concentration 與 Risk Engine v2 readback。
              </p>
            </div>
            <FeatureIcon icon={ShieldCheck} shadow={false} tone="cream" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="Total FCNs" value={String(intelligence.summary.totalCount)} />
            <MetricTile label="Total Notional" value={intelligence.summary.totalNotionalLabel} />
            <MetricTile
              label="High Risk Positions"
              note="Underlying at or below KI."
              value={String(intelligence.summary.highRiskCount)}
            />
            <MetricTile
              label="Watch Positions"
              note="Worst KI distance within 10%."
              value={String(intelligence.summary.watchCount)}
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <MetricTile
              label="Unknown Risk Data"
              note="Missing current price or invalid KI input."
              value={String(intelligence.summary.unknownRiskCount)}
            />
            <MetricTile
              label="Upcoming Events"
              value={String(intelligence.summary.upcomingEventsCount)}
            />
            <MetricTile
              label="Unique Underlyings"
              value={String(intelligence.summary.uniqueUnderlyingCount)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Data Path
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                FCN Wizard → Input Bridge / API → FCN Intelligence Center
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
                本頁優先讀取現有 `/api/fcn` 與 authenticated Supabase session；若 database readback
                為空或不可用，仍會顯示 Input Truth Bridge、FCN Draft Store 與 legacy recent fallback
                的 browser-local pending FCN input。V14 guarded writes 只會在 FCN Wizard 明確 submit
                且 guards 啟用後嘗試，不會由頁面 render 或 diagnostics 觸發。
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
              ["Read Priority", "database -> truth -> draft_store -> legacy_recent -> empty"],
              ["Repository Source", "Supabase /api/fcn + V14 guarded write metadata"],
              ["Pending Bridge", `${pendingFcnInputs.length} local FCN input(s)`],
              ["Persistence", "fcn_positions + fcn_underlyings"],
              ["Manual Prices", "localStorage overlay"],
              ["Risk Engine", "FCN Risk v2"],
              ["External Providers", "None"],
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

        {pendingFcnInputs.length > 0 ? (
          <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  Pending FCN Inputs
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                  FCN Wizard local pending readback
                </h2>
              </div>
              <span className="w-fit rounded-full border border-[rgba(176,141,87,0.38)] bg-[rgba(255,250,240,0.82)] px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
                Local pending only
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              These FCN inputs are visible through the v4.10 Input Truth Bridge, but they are not persisted Supabase positions yet. Persisted FCN risk readback still comes from `/api/fcn`.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pendingFcnInputs.slice(0, 6).map((input) => (
                <article
                  className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                  key={input.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                      {input.title}
                    </h3>
                    <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--ixai-forest-soft)]">
                      PENDING
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                    {input.symbols.length > 0 ? input.symbols.join(" / ") : "No underlyings recorded"}
                  </p>
                  <ul className="mt-3 grid gap-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                    {input.details.slice(0, 3).map((detail) => (
                      <li className="break-words" key={detail}>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <FcnRiskSummary />
        <FcnScheduleSummary />
        <LiveFcnUnderlyingStatusCard />

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
            <LifecyclePanel
              activeFilter={lifecycleFilter}
              onFilterChange={setLifecycleFilter}
              summary={intelligence.summary}
            />

            <PriceUpdatePanel
              manualPrices={manualPrices}
              onPriceChange={handleManualPriceChange}
              priceInputs={priceInputs}
              rows={priceRows}
            />

            <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                    Positions
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                    FCN Position Risk Readback
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    Showing {visiblePositions.length} position
                    {visiblePositions.length === 1 ? "" : "s"} for the selected lifecycle filter.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  Lifecycle actions are read-only in v3.20. Archive / restore is disabled until
                  persistence QA is approved.
                </div>
              </div>
              {visiblePositions.length > 0 ? (
                <div className="mt-5 grid gap-4">
                  {visiblePositions.map((position) => {
                    const risk = intelligence.positionRisks.get(position.id);

                    if (!risk) {
                      return null;
                    }

                    return (
                      <FcnPositionCard
                        key={position.id}
                        manualPrices={manualPrices}
                        position={position}
                        risk={risk}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  目前沒有符合此 lifecycle filter 的 FCN。
                </p>
              )}
            </section>

            <TimelinePanel events={intelligence.timeline} />
            <ConcentrationPanel items={intelligence.concentration} />
          </>
        ) : null}

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          本頁僅用於 FCN 部位 readback、生命週期整理、手動價格覆蓋、事件檢視與風險監控。不接外部行情、不接 AI、不接券商、
          不提供投資建議、產品推薦、買賣建議、目標價、報酬承諾或自動交易。
        </p>
      </section>
    </main>
  );
}

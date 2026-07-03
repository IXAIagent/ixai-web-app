"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, RefreshCw, WalletCards } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { useTranslation } from "@/src/lib/i18n";
import { FCN_DRAFT_STORE_EVENT } from "@/src/lib/portfolio/input/fcn-draft-store";
import { INPUT_TRUTH_BRIDGE_EVENT } from "@/src/lib/portfolio/input/input-truth-bridge";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule/fcn-schedule-service";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";
import type {
  FcnCouponScheduleEvent,
  FcnPortfolioScheduleSummary,
  FcnScheduleSourceStatus,
  FcnScheduleUrgency,
} from "@/src/lib/fcn/schedule/fcn-schedule-types";

const URGENCY_CLASS: Record<FcnScheduleUrgency, string> = {
  due_soon: "border-amber-200 bg-amber-50 text-amber-800",
  future: "border-slate-200 bg-slate-50 text-slate-700",
  overdue: "border-rose-200 bg-rose-50 text-rose-800",
  unavailable: "border-slate-200 bg-slate-50 text-slate-700",
  upcoming: "border-sky-200 bg-sky-50 text-sky-800",
};

const SOURCE_CLASS: Record<FcnScheduleSourceStatus, string> = {
  fallback: "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest-soft)]",
  live: "border-emerald-200 bg-emerald-50 text-emerald-800",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  unavailable: "border-rose-200 bg-rose-50 text-rose-800",
};

const EVENT_TYPE_LABEL_KEY: Record<FcnCouponScheduleEvent["eventType"], string> = {
  coupon: "Coupon",
  ko_observation: "KO Observation",
  maturity: "Maturity",
  observation: "Observation",
  unknown: "Unknown",
};

function formatDate(value: string | undefined) {
  if (!value) return "UNKNOWN";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatNumber(value: number | null | undefined, digits = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "UNKNOWN";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatAmount(value: number | null | undefined, currency = "", unavailableLabel = "Amount not stored") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return unavailableLabel;
  }

  return `${currency} ${formatNumber(value, 2)}`.trim();
}

function getPrimaryEventDate(event: FcnCouponScheduleEvent | undefined) {
  if (!event) return undefined;

  return (
    event.paymentDate ??
    event.couponDate ??
    event.observationEndDate ??
    event.observationStartDate ??
    event.maturityDate
  );
}

function UrgencyBadge({ urgency }: { urgency: FcnScheduleUrgency }) {
  const { t } = useTranslation("fcn");

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${URGENCY_CLASS[urgency]}`}
    >
      {t(`urgency_${urgency}`, urgency.replace("_", " "))}
    </span>
  );
}

function SourceBadge({ status }: { status: FcnScheduleSourceStatus }) {
  const { t } = useTranslation("sourceStatus");

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${SOURCE_CLASS[status]}`}
    >
      {t(status, status)}
    </span>
  );
}

function EventCard({ event }: { event: FcnCouponScheduleEvent }) {
  const { t } = useTranslation("fcn");

  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            {t(`scheduleEvent_${event.eventType}`, EVENT_TYPE_LABEL_KEY[event.eventType])}
          </p>
          <h3 className="mt-2 text-base font-semibold text-[var(--ixai-forest)]">
            {event.fcnName}
          </h3>
        </div>
        <UrgencyBadge urgency={event.urgency} />
      </div>
      <p className="mt-3 text-sm font-semibold text-[var(--ixai-forest)]">
        {formatDate(getPrimaryEventDate(event))}
      </p>
      <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
        {t("expectedCoupon")}: {formatAmount(event.expectedCouponAmount, event.currency, t("amountNotStored"))}
      </p>
      {typeof event.daysUntilEvent === "number" ? (
        <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
          {event.daysUntilEvent >= 0
            ? t("daysUntilEvent").replace("{count}", String(event.daysUntilEvent))
            : t("daysOverdue").replace("{count}", String(Math.abs(event.daysUntilEvent)))}
        </p>
      ) : null}
      {event.warningMessage ? (
        <p className="mt-3 rounded-md border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
          {t("scheduleWarning_unusable_schedule_dates", event.warningMessage)}
        </p>
      ) : null}
    </article>
  );
}

export function FcnScheduleSummary() {
  const { t } = useTranslation("fcn");
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<FcnPortfolioScheduleSummary | null>(null);
  const mountedRef = useRef(false);

  const refreshScheduleSummary = useCallback(async () => {
    setIsLoading(true);
    const result = await runWorkspaceSafe(
      "workspace-fcn-schedule-summary",
      getWorkspaceFcnScheduleSummary,
      null,
    );

    if (!mountedRef.current) {
      return;
    }

    setSummary(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    queueMicrotask(() => {
      if (!cancelled) {
        void refreshScheduleSummary();
      }
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [refreshScheduleSummary]);

  useEffect(() => {
    const refresh = () => {
      void refreshScheduleSummary();
    };

    window.addEventListener(FCN_DRAFT_STORE_EVENT, refresh);
    window.addEventListener(INPUT_TRUTH_BRIDGE_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(FCN_DRAFT_STORE_EVENT, refresh);
      window.removeEventListener(INPUT_TRUTH_BRIDGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refreshScheduleSummary]);

  const visiblePositionSummaries = summary?.summaries.slice(0, 6) ?? [];

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={CalendarDays} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              {t("scheduleEngine")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              {t("scheduleTitle")}
            </h2>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refreshScheduleSummary()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "整理中" : "重新整理"}
        </button>
      </div>

      <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {t("scheduleBody")}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [t("positions"), summary?.positionCount ?? 0],
          [t("scheduled"), summary?.scheduledPositionCount ?? 0],
          [t("unavailable"), summary?.unavailablePositionCount ?? 0],
          [t("dueSoon"), summary?.dueSoonEventCount ?? 0],
          [t("overdue"), summary?.overdueEventCount ?? 0],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </div>

      {summary ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <SourceBadge status={summary.sourceStatus} />
          <span className="rounded-full border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            {t("upcomingEvents")}: {summary.upcomingEventCount}
          </span>
          <span className="rounded-full border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            {t("updated")} {new Date(summary.updatedAt).toLocaleString("zh-TW")}
          </span>
        </div>
      ) : null}

      {summary?.positionCount === 0 ? (
        <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/70 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {t("noSchedulePositions")}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            {t("next30Days")}
          </p>
        </div>
        {summary?.next30DayEvents.length ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {summary.next30DayEvents.slice(0, 10).map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {t("noNext30DayEvents")}
          </p>
        )}
      </section>

      <section className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
        <div className="flex items-center gap-2">
          <WalletCards className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            {t("monthlyExpectedCouponCashflow")}
          </p>
        </div>
        {summary?.monthlyCashflows.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summary.monthlyCashflows.slice(0, 9).map((cashflow) => (
              <article
                className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                key={`${cashflow.monthKey}-${cashflow.currency}`}
              >
                <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                  {cashflow.monthKey}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
                  {formatAmount(cashflow.expectedCouponAmount, cashflow.currency, t("amountNotStored"))}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  {t("couponEventCount").replace("{count}", String(cashflow.eventCount))}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {t("couponAmountMissing")}
          </p>
        )}
      </section>

      {visiblePositionSummaries.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {visiblePositionSummaries.map((position) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={position.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-[var(--ixai-forest)]">{position.name}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                    {t("scheduleEventCount").replace("{count}", String(position.upcomingEvents.length))}
                  </p>
                </div>
                <SourceBadge status={position.sourceStatus} />
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  [t("nextCoupon"), formatDate(getPrimaryEventDate(position.nextCouponEvent))],
                  [
                    t("nextObservation"),
                    formatDate(getPrimaryEventDate(position.nextObservationEvent)),
                  ],
                  [t("event_maturity"), formatDate(getPrimaryEventDate(position.nextMaturityEvent))],
                ].map(([label, value]) => (
                  <div
                    className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                    key={label}
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[var(--ixai-forest)]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              {position.warnings.length > 0 ? (
                <ul className="mt-4 grid gap-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  {position.warnings.slice(0, 3).map((warning) => (
                    <li
                      className="rounded-md border border-[var(--ixai-border)] bg-white/70 p-2"
                      key={`${position.id}-${warning.code}`}
                    >
                      {t(`scheduleWarning_${warning.code}`, warning.message)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
        {t("scheduleDisclaimer", summary?.informationalOnlyDisclaimer)}
      </p>
    </section>
  );
}

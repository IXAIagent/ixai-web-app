"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Layers3,
  ListChecks,
  Network,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  FCN_DRAFT_STORE_EVENT,
  loadFcnDrafts,
  parseDraftNumber,
  type FCNDraftRecord,
} from "@/src/lib/portfolio/input/fcn-draft-store";

type ExposureItem = {
  count: number;
  label: string;
};

type CalendarItem = {
  couponDate?: string;
  draftId: string;
  frequency: string;
  fcnName: string;
  id: string;
  observationDate?: string;
};

function formatDate(value?: string) {
  if (!value) {
    return "未填";
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMoney(currency: string, value: number | null) {
  if (value === null) {
    return `${currency} --`;
  }

  return `${currency} ${formatNumber(value)}`;
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function buildUnderlyingExposure(drafts: FCNDraftRecord[]): ExposureItem[] {
  const counts = new Map<string, number>();

  drafts.forEach((draft) => {
    draft.underlyings.forEach((underlying) => {
      const symbol = normalizeSymbol(underlying.symbol);

      if (!symbol) {
        return;
      }

      counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ count, label }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 12);
}

function buildCouponCalendar(drafts: FCNDraftRecord[]): CalendarItem[] {
  return drafts
    .flatMap((draft) =>
      draft.schedule.map((item) => ({
        couponDate: item.couponDate,
        draftId: draft.id,
        fcnName: draft.name,
        frequency: draft.observationFrequency,
        id: item.id,
        observationDate: item.observationDate,
      })),
    )
    .filter((item) => item.observationDate || item.couponDate)
    .sort((a, b) => {
      const first = new Date(a.observationDate ?? a.couponDate ?? "").getTime();
      const second = new Date(b.observationDate ?? b.couponDate ?? "").getTime();
      return (Number.isFinite(first) ? first : 0) - (Number.isFinite(second) ? second : 0);
    });
}

function countUpcomingCoupons(calendar: CalendarItem[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return calendar.filter((item) => {
    if (!item.couponDate) {
      return false;
    }

    const couponDate = new Date(item.couponDate);
    return Number.isFinite(couponDate.getTime()) && couponDate >= today;
  }).length;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-white/74 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--ixai-forest)]">{value}</p>
    </article>
  );
}

function EmptyState() {
  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.12)] bg-white/78 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex min-w-0 items-start gap-3">
        <FeatureIcon icon={PlusCircle} />
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            FCN Draft Store
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            尚未建立 FCN Draft
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            先到 FCN Input 建立產品條件、Barrier、觀察日程與 Underlyings，完成後這裡會顯示第一版 FCN
            Workspace readback。
          </p>
        </div>
      </div>
      <div className="mt-5">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-[rgba(9,41,31,0.92)]"
          href="/my-ixai/input/fcn"
        >
          新增 FCN
        </Link>
      </div>
    </section>
  );
}

export function FcnCenterWorkspace() {
  const [drafts, setDrafts] = useState<FCNDraftRecord[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  useEffect(() => {
    function syncDrafts() {
      const nextDrafts = loadFcnDrafts();
      setDrafts(nextDrafts);
      setSelectedDraftId((current) =>
        current && nextDrafts.some((draft) => draft.id === current)
          ? current
          : nextDrafts[0]?.id ?? null,
      );
    }

    syncDrafts();
    window.addEventListener(FCN_DRAFT_STORE_EVENT, syncDrafts);
    window.addEventListener("focus", syncDrafts);
    window.addEventListener("pageshow", syncDrafts);
    window.addEventListener("storage", syncDrafts);

    return () => {
      window.removeEventListener(FCN_DRAFT_STORE_EVENT, syncDrafts);
      window.removeEventListener("focus", syncDrafts);
      window.removeEventListener("pageshow", syncDrafts);
      window.removeEventListener("storage", syncDrafts);
    };
  }, []);

  const calendar = useMemo(() => buildCouponCalendar(drafts), [drafts]);
  const exposure = useMemo(() => buildUnderlyingExposure(drafts), [drafts]);
  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0] ?? null,
    [drafts, selectedDraftId],
  );
  const totalNotional = drafts.reduce(
    (sum, draft) => sum + (parseDraftNumber(draft.notionalAmount) ?? 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                FCN Center
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                FCN Workspace：產品條件、標的曝險與配息日程
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                v3.08 建立第一條 FCN Input → FCN Draft Store → FCN Center 資料流，先用本機 draft
                state 顯示 FCN 條件與觀察日程，不接市場資料、外部 API 或交易功能。
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/15 bg-white/[0.07] text-[var(--ixai-gold)]">
              <ShieldCheck className="h-7 w-7" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
              href="/my-ixai/input/fcn"
            >
              新增 FCN
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
              href="/my-ixai/portfolio"
            >
              Portfolio Center
            </Link>
          </div>
        </header>

        {drafts.length === 0 ? <EmptyState /> : null}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total FCN Count" value={formatNumber(drafts.length)} />
          <StatCard label="Total Notional" value={formatMoney(drafts[0]?.currency ?? "USD", totalNotional)} />
          <StatCard label="Upcoming Coupons" value={formatNumber(countUpcomingCoupons(calendar))} />
          <StatCard label="Unique Underlyings" value={formatNumber(exposure.length)} />
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.12)] bg-white/78 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <FeatureIcon icon={ListChecks} />
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                FCN Position Table
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                已建立的 FCN Draft
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {drafts.map((draft) => (
              <button
                className={`grid w-full min-w-0 gap-3 rounded-xl border p-4 text-left transition sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr] ${
                  selectedDraft?.id === draft.id
                    ? "border-[rgba(176,141,87,0.58)] bg-[rgba(176,141,87,0.10)]"
                    : "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.62)] hover:bg-white"
                }`}
                key={draft.id}
                onClick={() => setSelectedDraftId(draft.id)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    FCN Name
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-[var(--ixai-forest)]">
                    {draft.name}
                  </span>
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    Notional
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ixai-forest-soft)]">
                    {formatMoney(draft.currency, parseDraftNumber(draft.notionalAmount))}
                  </span>
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    Strike
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ixai-forest-soft)]">
                    {draft.strikePct || "未填"}
                  </span>
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    KI
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ixai-forest-soft)]">
                    {draft.kiPct || "未填"}
                  </span>
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    KO
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ixai-forest-soft)]">
                    {draft.koPct || "未填"}
                  </span>
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    Underlyings
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ixai-forest-soft)]">
                    {draft.underlyings.length}
                  </span>
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    Created
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ixai-forest-soft)]">
                    {formatDate(draft.createdAt)}
                  </span>
                </span>
                <span className="sm:col-span-2 lg:col-span-7">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    Observation Frequency
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ixai-forest-soft)]">
                    {draft.observationFrequency}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[rgba(9,41,31,0.12)] bg-white/78 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex min-w-0 items-start gap-3">
              <FeatureIcon icon={Network} />
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  Underlying Exposure
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                  連結標的統計
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {exposure.length > 0 ? (
                exposure.map((item) => (
                  <article
                    className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.62)] p-4"
                    key={item.label}
                  >
                    <p className="text-lg font-semibold text-[var(--ixai-forest)]">{item.label}</p>
                    <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">× {item.count}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  尚未有可統計的 FCN underlyings。
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(9,41,31,0.12)] bg-white/78 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
            <div className="flex min-w-0 items-start gap-3">
              <FeatureIcon icon={CalendarDays} />
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                  Coupon Calendar
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                  觀察日與配息日
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {calendar.length > 0 ? (
                calendar.slice(0, 8).map((item) => (
                  <article
                    className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.62)] p-4"
                    key={`${item.draftId}-${item.id}`}
                  >
                    <p className="text-sm font-semibold text-[var(--ixai-forest)]">{item.fcnName}</p>
                    <div className="mt-3 grid gap-2 text-sm text-[var(--ixai-forest-soft)] sm:grid-cols-3">
                      <span>Observation: {formatDate(item.observationDate)}</span>
                      <span>Coupon: {formatDate(item.couponDate)}</span>
                      <span>Frequency: {item.frequency}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  尚未輸入觀察日或配息日。
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.12)] bg-white/78 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <FeatureIcon icon={Layers3} />
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                FCN Detail Panel
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                {selectedDraft?.name ?? "尚未選取 FCN"}
              </h2>
            </div>
          </div>

          {selectedDraft ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.62)] p-4">
                <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Basic Info</h3>
                <dl className="mt-3 grid gap-2 text-sm text-[var(--ixai-forest-soft)]">
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt>Issuer</dt>
                    <dd>{selectedDraft.issuer || "未填"}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt>Currency</dt>
                    <dd>{selectedDraft.currency}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt>Notional</dt>
                    <dd>{formatMoney(selectedDraft.currency, parseDraftNumber(selectedDraft.notionalAmount))}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt>Coupon</dt>
                    <dd>{selectedDraft.couponRatePct || "未填"}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt>Tenor</dt>
                    <dd>{selectedDraft.tenor || "未填"}</dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.62)] p-4">
                <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Barrier Info</h3>
                <dl className="mt-3 grid gap-2 text-sm text-[var(--ixai-forest-soft)]">
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt>Strike</dt>
                    <dd>{selectedDraft.strikePct || "未填"}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt>KI</dt>
                    <dd>{selectedDraft.kiPct || "未填"}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt>KO</dt>
                    <dd>{selectedDraft.koPct || "未填"}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt>Observation</dt>
                    <dd>{selectedDraft.observationFrequency}</dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.62)] p-4 lg:col-span-2">
                <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Underlying List</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedDraft.underlyings.map((underlying) => (
                    <div
                      className="rounded-lg border border-[var(--ixai-border)] bg-white/72 p-3"
                      key={underlying.id}
                    >
                      <p className="font-semibold text-[var(--ixai-forest)]">
                        {normalizeSymbol(underlying.symbol)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">
                        {underlying.name || "未填名稱"} · Initial {underlying.initialPrice || "未填"}
                      </p>
                      <p className="mt-1 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                        Strike {underlying.strikePrice || "未填"} · KI {underlying.kiPrice || "未填"} · KO{" "}
                        {underlying.koPrice || "未填"}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              建立 FCN 後即可查看詳細條件。
            </p>
          )}

          <p className="mt-5 border-t border-[rgba(9,41,31,0.10)] pt-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            FCN Center 目前使用本機 draft store 顯示使用者輸入資料，僅用於產品條件整理、風險監控準備與工作流程閱讀，不構成投資建議、買賣建議、收益承諾或自動交易。
          </p>
        </section>
      </section>
    </main>
  );
}

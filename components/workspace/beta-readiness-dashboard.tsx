"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, ShieldAlert } from "lucide-react";

import { BetaFeedbackPanel } from "@/components/workspace/beta-feedback-panel";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { useTranslation } from "@/src/lib/i18n";

type BetaStatus = "blocked" | "not_started" | "partial" | "ready";

type BetaChecklistItem = {
  detail: string;
  label: string;
  status: BetaStatus;
};

const STATUS_LABEL: Record<BetaStatus, string> = {
  blocked: "blocked",
  not_started: "not started",
  partial: "partial",
  ready: "ready",
};

const STATUS_CLASS: Record<BetaStatus, string> = {
  blocked: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)]",
  not_started: "border-[var(--ixai-border)] bg-white/70",
  partial: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)]",
  ready: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)]",
};

const CHECKLIST: BetaChecklistItem[] = [
  {
    detail: "V12 runtime stabilization passed production manual verification; Sprint 3 still requires production smoke before final Beta claim.",
    label: "Runtime stable",
    status: "partial",
  },
  {
    detail: "Server-side Yahoo/Binance quote route, cache fallback, and provider failure containment are present.",
    label: "Live Market Data",
    status: "ready",
  },
  {
    detail: "Portfolio valuation reads internal quote API and distinguishes live, stale, fallback, and unavailable data.",
    label: "Portfolio valuation",
    status: "ready",
  },
  {
    detail: "FCN live risk reads internal quote context and remains monitoring-only.",
    label: "FCN live risk",
    status: "ready",
  },
  {
    detail: "V14 Workspace Intelligence cards are deterministic, explain-only, and source-labeled.",
    label: "Workspace Intelligence",
    status: "ready",
  },
  {
    detail: "Workspace Morning Brief is on-demand and Workspace-readable only.",
    label: "Morning Brief",
    status: "ready",
  },
  {
    detail: "Timeline groups source-labeled events by overdue, today, next 7 days, and later.",
    label: "Timeline",
    status: "ready",
  },
  {
    detail: "Copilot starts from a safe shell and only summarizes on manual Run summary.",
    label: "Copilot explain-only summary",
    status: "ready",
  },
  {
    detail: "V13.0 shared locale foundation exists; full content translation remains future V13.1-V13.5 work.",
    label: "i18n foundation",
    status: "partial",
  },
  {
    detail: "Mobile QA must pass in Sprint 3 validation before this item is final.",
    label: "Mobile QA",
    status: "partial",
  },
  {
    detail: "Production-like smoke must pass locally and production verification remains a release gate.",
    label: "Production smoke",
    status: "partial",
  },
  {
    detail: "Known limitations are documented in Sprint 1, Sprint 2, Sprint 3, and V14 Beta release notes.",
    label: "Known limitations documented",
    status: "ready",
  },
];

export function BetaReadinessDashboard() {
  const { t } = useTranslation("beta");
  const readyCount = CHECKLIST.filter((item) => item.status === "ready").length;
  const blockedCount = CHECKLIST.filter((item) => item.status === "blocked").length;
  const partialCount = CHECKLIST.filter((item) => item.status === "partial").length;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
              V14 Beta Preview
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
              {t("dashboardTitle")}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
              {t("subtitle")}
            </p>
          </div>
          <FeatureIcon icon={ShieldAlert} shadow={false} tone="cream" />
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["Ready", readyCount],
            ["Partial", partialCount],
            ["Blocked", blockedCount],
            [t("total"), CHECKLIST.length],
          ].map(([label, value]) => (
            <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4" key={label}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">{label}</p>
              <p className="mt-2 font-mono text-3xl font-semibold text-[var(--ixai-forest)]">{value}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {CHECKLIST.map((item) => (
            <article className={`rounded-xl border p-4 ${STATUS_CLASS[item.status]}`} key={item.label}>
              <div className="flex items-start gap-3">
                <FeatureIcon icon={item.status === "ready" ? CheckCircle2 : CircleDot} size="sm" shadow={false} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.label}</p>
                    <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/65 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {t(STATUS_LABEL[item.status].replace(" ", "_"), STATUS_LABEL[item.status])}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          {t("betaNote")}
        </p>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">{t("productionQa")}</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">{t("beforeUsers")}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {t("productionQaBody")}
            </p>
          </div>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/my-ixai/health"
          >
            {t("openHealth")}
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <BetaFeedbackPanel />
    </main>
  );
}

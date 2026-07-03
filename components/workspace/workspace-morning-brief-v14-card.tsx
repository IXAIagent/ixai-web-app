"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Newspaper, RefreshCw } from "lucide-react";

import { BriefShareActions } from "@/components/workspace/brief-share-actions";
import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  buildEmptyWorkspaceMorningBrief,
  getWorkspaceMorningBriefV14,
  type WorkspaceMorningBrief,
} from "@/src/lib/workspace/morning-brief";
import { useTranslation } from "@/src/lib/i18n";
import { runWorkspaceRuntimeBudget, runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

const SECTION_TITLE_KEYS: Record<string, string> = {
  compliance: "disclaimer",
  data_quality: "dataQualityTitle",
  fcn: "fcnTitle",
  market: "marketTitle",
  opening: "openingTitle",
  portfolio: "portfolioTitle",
  risk: "riskTitle",
  timeline: "timelineTitle",
  watchlist: "watchlistTitle",
};

const SECTION_SUMMARY_KEYS: Record<string, string> = {
  compliance: "complianceSummary",
  data_quality: "dataQualitySummary",
  fcn: "fcnSummary",
  market: "marketSummary",
  opening: "openingSummary",
  portfolio: "portfolioSummary",
  risk: "riskSummary",
  timeline: "timelineSummary",
  watchlist: "watchlistSummary",
};

export function WorkspaceMorningBriefV14Card({
  autoLoad = false,
  compact = false,
}: {
  autoLoad?: boolean;
  compact?: boolean;
}) {
  const { t } = useTranslation("morningBrief");
  const { t: tPolish } = useTranslation("productPolish");
  const { t: tStatus } = useTranslation("status");
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

  const localizedBrief = useMemo<WorkspaceMorningBrief>(() => ({
    ...brief,
    informationalOnlyDisclaimer: t("disclaimer", brief.informationalOnlyDisclaimer),
    sections: brief.sections.map((section) => ({
      ...section,
      summary: t(SECTION_SUMMARY_KEYS[section.key] ?? "unavailableSummary", section.summary),
      title: t(SECTION_TITLE_KEYS[section.key] ?? section.key, section.title),
    })),
    title: `${t("generatedPrefix", "Workspace Morning Brief")} · ${brief.date}`,
  }), [brief, t]);
  const visibleLocalizedSections = compact ? localizedBrief.sections.slice(0, 4) : localizedBrief.sections;
  const openingSection = localizedBrief.sections.find((section) => section.key === "opening");
  const portfolioSection = localizedBrief.sections.find((section) => section.key === "portfolio");
  const riskSection = localizedBrief.sections.find((section) => section.key === "risk");
  const fcnSection = localizedBrief.sections.find((section) => section.key === "fcn");
  const marketSection = localizedBrief.sections.find((section) => section.key === "market");
  const alertSection = localizedBrief.sections.find((section) => section.key === "watchlist") ?? localizedBrief.sections.find((section) => section.key === "timeline");
  const reportHighlights = [
    {
      body: [openingSection?.summary, portfolioSection?.summary].filter(Boolean).join(" "),
      label: tPolish("morningBriefDailySummary"),
      value: tPolish("todaySummary"),
    },
    {
      body: [riskSection?.summary, fcnSection?.summary].filter(Boolean).join(" "),
      label: `${tPolish("morningBriefRisk")} / ${tPolish("morningBriefFcn")}`,
      value: localizedBrief.warnings.length > 0 ? tPolish("important") : tPolish("noImmediateAction"),
    },
    {
      body: [marketSection?.summary, alertSection?.summary].filter(Boolean).join(" "),
      label: tPolish("marketAndAlerts"),
      value: tPolish("nextStep"),
    },
  ];

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Newspaper} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              {tPolish("morningBriefHeroEyebrow")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              {localizedBrief.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {tPolish("morningBriefHeroBody")}
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
          {isLoading ? t("loading") : tPolish("morningBriefManualMode")}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {reportHighlights.map((item) => (
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4" key={item.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {item.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              {item.value}
            </p>
            <p className="mt-3 line-clamp-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {item.body || tPolish("diagnosticsUnavailable")}
            </p>
          </article>
        ))}
      </div>

      <div className={`mt-5 grid gap-3 ${compact ? "lg:grid-cols-2" : "xl:grid-cols-3"}`}>
        {visibleLocalizedSections.map((section) => (
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4" key={section.key}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-base font-semibold text-[var(--ixai-forest)]">{section.title}</p>
              <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/65 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {tStatus(section.severity, section.severity)}
              </span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
              {tPolish("dataStatus")} · {tStatus(section.dataQuality, section.dataQuality)}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {section.summary}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        {localizedBrief.informationalOnlyDisclaimer}
      </p>

      <BriefShareActions brief={localizedBrief} />
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarClock, LineChart, Newspaper, ShieldAlert, WalletCards } from "lucide-react";

import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import {
  buildEmptyWorkspaceMorningBrief,
  getWorkspaceMorningBriefV14,
  type WorkspaceMorningBrief,
  type WorkspaceMorningBriefSection,
} from "@/src/lib/workspace/morning-brief";
import { runWorkspaceRuntimeBudget, runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function sectionByKey(brief: WorkspaceMorningBrief, key: string) {
  return brief.sections.find((section) => section.key === key);
}

function sectionSummary(section: WorkspaceMorningBriefSection | undefined, fallback: string) {
  return section?.summary || fallback;
}

function bulletPoints(brief: WorkspaceMorningBrief) {
  const opening = sectionByKey(brief, "opening");
  const portfolio = sectionByKey(brief, "portfolio");
  const risk = sectionByKey(brief, "risk");
  const fcn = sectionByKey(brief, "fcn");
  const market = sectionByKey(brief, "market");
  const timeline = sectionByKey(brief, "timeline");

  return [
    sectionSummary(opening, "Today starts with a limited Workspace summary."),
    sectionSummary(portfolio, "Portfolio movement is waiting for more complete data."),
    sectionSummary(risk, "Risk is stable unless new alerts appear."),
    sectionSummary(fcn, "FCN risk is being monitored for observation, coupon, and maturity events."),
    sectionSummary(market ?? timeline, "Watch market and calendar events that may affect today's attention."),
  ].slice(0, 5);
}

function NarrativeSection({
  body,
  eyebrow,
  icon: Icon,
  title,
}: {
  body: string;
  eyebrow: string;
  icon: typeof Newspaper;
  title: string;
}) {
  return (
    <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
          <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">{body}</p>
        </div>
      </div>
    </article>
  );
}

export function WorkspaceMorningBriefExperience() {
  const [brief, setBrief] = useState<WorkspaceMorningBrief>(() => buildEmptyWorkspaceMorningBrief());
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function loadBrief() {
      const fallback = buildEmptyWorkspaceMorningBrief();
      const result = await runWorkspaceRuntimeBudget(
        "workspace-morning-brief-v19b",
        () =>
          runWorkspaceSafe(
            "workspace-morning-brief-v19b",
            () => getWorkspaceMorningBriefV14({ force: false }),
            fallback,
          ),
        {
          data: fallback,
          error: null,
          label: "workspace-morning-brief-v19b",
          ok: true,
        },
        { auto: true, threshold: 2, timeoutMs: 4500 },
      );

      if (!mountedRef.current) return;
      setBrief(result.data ?? fallback);
    }

    queueMicrotask(() => void loadBrief());

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const bullets = useMemo(() => bulletPoints(brief), [brief]);
  const portfolio = sectionByKey(brief, "portfolio");
  const market = sectionByKey(brief, "market") ?? sectionByKey(brief, "watchlist");
  const risk = sectionByKey(brief, "risk");
  const fcn = sectionByKey(brief, "fcn");
  const timeline = sectionByKey(brief, "timeline");

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/home", icon: ArrowLeft, label: "Back to Today", variant: "secondary" },
          ]}
          eyebrow="Morning Brief"
          kpis={[
            { description: "Readable summary, not raw cards.", icon: Newspaper, label: "Today's Summary", value: "3 min" },
            { description: "Portfolio context in narrative form.", icon: WalletCards, label: "Portfolio", value: portfolio ? "Included" : "Limited" },
            { description: "Market context without provider wording.", icon: LineChart, label: "Markets", value: market ? "Included" : "Limited" },
            { description: "Risk and next-watch context.", icon: ShieldAlert, label: "Risk / Next", value: risk || timeline ? "Included" : "Limited" },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                What happened?
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{brief.title}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Morning Brief is a readable report. Raw cards, export controls, and source details stay out of the reading layer.
              </p>
            </>
          }
          summary="Morning Brief explains what happened and what to watch next. It should read like a short report, not a system output."
          title="Morning Brief: what happened today."
        />

        <WorkspaceProductSection
          description="The report starts with the answer, then gives short narratives."
          eyebrow="Today's Summary"
          title="今日摘要"
        >
          <ul className="grid gap-3">
            {bullets.map((point) => (
              <li className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]" key={point}>
                <span className="mr-2 text-[var(--ixai-gold)]">•</span>
                {point}
              </li>
            ))}
          </ul>
        </WorkspaceProductSection>

        <div className="grid gap-4 lg:grid-cols-2">
          <NarrativeSection
            body={sectionSummary(portfolio, "Portfolio data is limited. Add or update assets to make this section more useful.")}
            eyebrow="Portfolio"
            icon={WalletCards}
            title="我的資產"
          />
          <NarrativeSection
            body={sectionSummary(market, "Market context is limited. Add watchlist symbols to make market impact more personal.")}
            eyebrow="Markets"
            icon={LineChart}
            title="市場"
          />
          <NarrativeSection
            body={[sectionSummary(risk, "Risk is stable unless new alerts appear."), sectionSummary(fcn, "FCN context is limited until FCN positions are available.")].join(" ")}
            eyebrow="Risk"
            icon={ShieldAlert}
            title="風險"
          />
          <NarrativeSection
            body={sectionSummary(timeline, "No upcoming events require attention right now.")}
            eyebrow="Next"
            icon={CalendarClock}
            title="接下來要看什麼"
          />
        </div>

        <WorkspaceDiagnosticsPanel description="raw sections, warnings, quality details">
          <WorkspaceKpiGrid
            items={[
              { description: "Report sections available.", icon: Newspaper, label: "Sections", value: String(brief.sections.length) },
              { description: "Warnings included in the report.", icon: ShieldAlert, label: "Warnings", value: String(brief.warnings.length) },
              { description: "Report date.", icon: CalendarClock, label: "Date", value: brief.date },
            ]}
          />
          <div className="grid gap-3">
            {brief.sections.map((section) => (
              <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={section.key}>
                <p className="text-sm font-semibold text-[var(--ixai-forest)]">{section.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{section.summary}</p>
              </article>
            ))}
          </div>
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            {brief.informationalOnlyDisclaimer}
          </p>
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}

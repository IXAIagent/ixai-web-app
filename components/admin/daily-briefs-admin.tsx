"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDrafts } from "@/src/lib/editorial/repository";
import { isSupabaseClientConfigured } from "@/src/lib/supabase/client";
import type {
  DailyBriefDraft,
  DailyBriefDraftStatus,
  DailyIntelligenceProviderErrorReason,
  DailyIntelligenceProviderMode,
  DailyIntelligenceProviderStatus,
  DailyDraftGenerationSummary,
  WeeklyIntelligenceDraft,
  WeeklyIntelligenceStatus,
} from "@/src/types/editorial";
import type { NewsIntakeResult } from "@/src/types/news";

const statusLabels: Record<DailyBriefDraftStatus, string> = {
  draft: "Draft",
  review: "Review",
  published: "Published",
};

const statusStyles: Record<DailyBriefDraftStatus, string> = {
  draft: "border-white/12 bg-white/6 text-[rgba(245,240,230,0.62)]",
  review: "border-[rgba(176,141,87,0.4)] bg-[rgba(176,141,87,0.12)] text-[var(--ixai-gold)]",
  published: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

const weeklyStatusLabels: Record<WeeklyIntelligenceStatus, string> = {
  draft: "Draft",
  review: "Review",
  published: "Published",
  archived: "Archived",
};

const weeklyStatusStyles: Record<WeeklyIntelligenceStatus, string> = {
  draft: "border-white/12 bg-white/6 text-[rgba(245,240,230,0.62)]",
  review: "border-[rgba(176,141,87,0.4)] bg-[rgba(176,141,87,0.12)] text-[var(--ixai-gold)]",
  published: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  archived: "border-white/10 bg-white/[0.035] text-[rgba(245,240,230,0.38)]",
};

type GenerationMeta = {
  providerMode: DailyIntelligenceProviderMode;
  providerStatus?: DailyIntelligenceProviderStatus;
  openAIKeyDetected: boolean;
  model: string;
  errorReason?: DailyIntelligenceProviderErrorReason;
  errorMessage?: string;
  inputNewsCount: number;
  sourceMode: "real" | "fallback";
  generatedAt: string;
  complianceNote?: string;
  editorialReviewRequired: boolean;
};

type PersistenceMeta = {
  readable: boolean;
  writable: boolean;
};

type EditorialDesk = "daily" | "weekly";

const weeklyEditorSections = [
  "本週市場重點",
  "本週重大事件",
  "下週觀察",
  "財報焦點",
  "FED / 利率",
  "台股 AI",
  "FCN 市場觀察",
  "IXAI Intelligence Summary",
];

function StatusBadge({ status }: { status: DailyBriefDraftStatus }) {
  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "Not published";
  }

  return new Date(value).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusPillClass(status: "success" | "warning" | "muted") {
  if (status === "success") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.045] text-[rgba(245,240,230,0.56)]";
}

function StatusCard({
  title,
  status,
  children,
}: Readonly<{
  title: string;
  status: "success" | "warning" | "muted";
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          {title}
        </p>
        <span
          className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${statusPillClass(status)}`}
        >
          {status}
        </span>
      </div>
      {children}
    </section>
  );
}

function WeeklyStatusBadge({ status }: { status: WeeklyIntelligenceStatus }) {
  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${weeklyStatusStyles[status]}`}
    >
      {weeklyStatusLabels[status]}
    </span>
  );
}

function WeeklyEditorPreview() {
  const [weeklyDrafts, setWeeklyDrafts] = useState<WeeklyIntelligenceDraft[]>([]);
  const [selectedWeeklyId, setSelectedWeeklyId] = useState("");
  const [weeklyPersistence, setWeeklyPersistence] = useState<PersistenceMeta | null>(null);
  const [weeklyMessage, setWeeklyMessage] = useState("Weekly workflow is connected. Generate creates draft only; publish remains manual.");
  const [isWeeklyGenerating, setIsWeeklyGenerating] = useState(false);
  const [isWeeklySaving, setIsWeeklySaving] = useState(false);
  const [isWeeklyPublishing, setIsWeeklyPublishing] = useState(false);

  const selectedWeeklyDraft =
    weeklyDrafts.find((draft) => draft.id === selectedWeeklyId) ?? weeklyDrafts[0] ?? null;
  const weeklyCounts = useMemo(
    () => ({
      draft: weeklyDrafts.filter((draft) => draft.status === "draft").length,
      review: weeklyDrafts.filter((draft) => draft.status === "review").length,
      published: weeklyDrafts.filter((draft) => draft.status === "published").length,
      archived: weeklyDrafts.filter((draft) => draft.status === "archived").length,
    }),
    [weeklyDrafts],
  );
  // v1.30.5 — never let a static fallback weekly into the editable
  // workflow. The admin API now filters these out, but we also guard at
  // the UI layer so any cached / stale response cannot accidentally bind
  // Save / Mark Review / Publish to a row that does not exist in Supabase.
  const selectedIsStatic = selectedWeeklyDraft?.id.startsWith("static-") ?? false;
  const canPublishWeekly =
    !selectedIsStatic &&
    selectedWeeklyDraft?.status === "review" &&
    Boolean(selectedWeeklyDraft.summary && selectedWeeklyDraft.sections.marketHighlights.length);

  const refreshWeeklyDrafts = useCallback((nextDrafts: WeeklyIntelligenceDraft[]) => {
    const durableDrafts = nextDrafts.filter((draft) => !draft.id.startsWith("static-"));
    setWeeklyDrafts(durableDrafts);
    setSelectedWeeklyId((current) =>
      durableDrafts.some((draft) => draft.id === current)
        ? current
        : durableDrafts[0]?.id ?? "",
    );
  }, []);

  // v1.30.6 — defensive re-fetch. Used when Generate returns a draft but
  // the inline drafts array came back empty (RLS leak, stale cache, etc.).
  // Reusing the same admin GET keeps the source of truth single.
  const reloadWeeklyDrafts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/weekly-briefs", { cache: "no-store" });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        drafts: WeeklyIntelligenceDraft[];
        persistence?: PersistenceMeta;
      };

      refreshWeeklyDrafts(payload.drafts ?? []);
      setWeeklyPersistence(payload.persistence ?? null);
      return payload.drafts ?? [];
    } catch {
      return null;
    }
  }, [refreshWeeklyDrafts]);

  useEffect(() => {
    let ignore = false;

    async function loadWeeklyDrafts() {
      try {
        const response = await fetch("/api/admin/weekly-briefs", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          drafts: WeeklyIntelligenceDraft[];
          persistence?: PersistenceMeta;
        };

        if (!ignore) {
          refreshWeeklyDrafts(payload.drafts ?? []);
          setWeeklyPersistence(payload.persistence ?? null);
        }
      } catch {
        if (!ignore) {
          setWeeklyMessage("Weekly drafts could not be loaded. Check admin session or Supabase persistence.");
        }
      }
    }

    void loadWeeklyDrafts();

    return () => {
      ignore = true;
    };
  }, [refreshWeeklyDrafts]);

  async function handleGenerateWeeklyDraft() {
    setIsWeeklyGenerating(true);

    try {
      const response = await fetch("/api/admin/weekly-briefs/generate", {
        method: "POST",
      });

      // v1.30.4 — propagate the server's actual error so persistence
      // failures (Supabase 4xx/5xx, on_conflict mismatch, RLS denial)
      // reach the admin UI instead of being replaced with a generic line.
      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as {
          message?: string;
          status?: string;
        };
        throw new Error(errorPayload.message ?? "Weekly generation failed.");
      }

      const payload = (await response.json()) as {
        draft: WeeklyIntelligenceDraft;
        drafts: WeeklyIntelligenceDraft[];
        persistence?: PersistenceMeta;
        summary?: { status: "generated" | "existing"; itemCount: number; sourceMode: string };
      };

      // v1.30.6 — defensive refresh path. If the inline drafts array is
      // empty (e.g. RLS leak, response payload regression) but Generate
      // returned a real draft, re-fetch the admin list so the Editorial
      // Studio still shows the just-written row.
      let resolvedDrafts = payload.drafts ?? [];

      if (resolvedDrafts.length === 0 && payload.draft) {
        const reloaded = await reloadWeeklyDrafts();
        if (reloaded && reloaded.length > 0) {
          resolvedDrafts = reloaded;
        } else {
          resolvedDrafts = [payload.draft];
          refreshWeeklyDrafts(resolvedDrafts);
        }
      } else {
        refreshWeeklyDrafts(resolvedDrafts);
      }

      setWeeklyPersistence(payload.persistence ?? null);
      setSelectedWeeklyId(payload.draft.id);

      // v1.30.6 — surface draft id prefix + status + drafts count so
      // operators can verify durability without opening the Table Editor.
      const draftIdPrefix = payload.draft.id.slice(0, 8);
      const draftCount = resolvedDrafts.filter((draft) => !draft.id.startsWith("static-")).length;
      const baseMessage =
        payload.summary?.status === "existing"
          ? `Existing weekly draft loaded · ${payload.summary.itemCount} input items · ${payload.summary.sourceMode}`
          : `Weekly draft generated · ${payload.summary?.itemCount ?? 0} input items · ${payload.summary?.sourceMode ?? "fallback"}`;
      setWeeklyMessage(
        `${baseMessage} · id ${draftIdPrefix} · status ${payload.draft.status} · drafts ${draftCount}`,
      );
    } catch (error) {
      setWeeklyMessage(
        error instanceof Error
          ? error.message
          : "Generate Weekly Draft failed. No content was published.",
      );
    } finally {
      setIsWeeklyGenerating(false);
    }
  }

  async function patchWeeklyDraft(
    patch: Partial<Pick<WeeklyIntelligenceDraft, "status" | "title" | "summary" | "sections" | "editorialNotes" | "complianceNote">>,
    message: string,
  ) {
    if (!selectedWeeklyDraft) {
      return;
    }

    // v1.30.5 — static fallback rows are read-only public content; they
    // cannot be edited via PATCH because no Supabase row exists for the
    // synthetic id (e.g. "static-2026-05-17-weekly-brief").
    if (selectedWeeklyDraft.id.startsWith("static-")) {
      setWeeklyMessage(
        "Static fallback weekly cannot be edited. Generate a durable weekly draft first.",
      );
      return;
    }

    setIsWeeklySaving(true);

    try {
      const response = await fetch(`/api/admin/weekly-briefs/${selectedWeeklyDraft.id}`, {
        body: JSON.stringify(patch),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });

      // v1.30.4 — surface server-side persistence errors instead of
      // showing a generic Save-failed message.
      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorPayload.message ?? "Weekly save failed.");
      }

      const payload = (await response.json()) as {
        draft: WeeklyIntelligenceDraft;
        drafts: WeeklyIntelligenceDraft[];
        persistence?: PersistenceMeta;
      };
      refreshWeeklyDrafts(payload.drafts);
      setWeeklyPersistence(payload.persistence ?? null);
      setSelectedWeeklyId(payload.draft.id);
      setWeeklyMessage(message);
    } catch (error) {
      setWeeklyMessage(
        error instanceof Error
          ? error.message
          : "Weekly draft save failed. Please verify persistence and admin session.",
      );
    } finally {
      setIsWeeklySaving(false);
    }
  }

  async function handlePublishWeekly() {
    if (!selectedWeeklyDraft) {
      return;
    }

    // v1.30.5 — see patchWeeklyDraft for the same guard. Publish must
    // target a real Supabase row.
    if (selectedWeeklyDraft.id.startsWith("static-")) {
      setWeeklyMessage(
        "Static fallback weekly cannot be edited. Generate a durable weekly draft first.",
      );
      return;
    }

    setIsWeeklyPublishing(true);

    try {
      const response = await fetch(`/api/admin/weekly-briefs/${selectedWeeklyDraft.id}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message ?? "Weekly publish failed.");
      }

      const payload = (await response.json()) as {
        draft: WeeklyIntelligenceDraft;
        drafts: WeeklyIntelligenceDraft[];
        persistence?: PersistenceMeta;
      };
      refreshWeeklyDrafts(payload.drafts);
      setWeeklyPersistence(payload.persistence ?? null);
      setSelectedWeeklyId(payload.draft.id);
      setWeeklyMessage("Weekly Intelligence manually published after human review.");
    } catch (error) {
      setWeeklyMessage(error instanceof Error ? error.message : "Weekly publish failed.");
    } finally {
      setIsWeeklyPublishing(false);
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Weekly Workflow Console
            </p>
            <p className="mt-1 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
              News sources / market data / AI-assisted suggestion → Editorial review → Preview → Manual publish.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-[var(--ixai-gold)] px-3 py-2 text-xs font-semibold text-[#071a14] disabled:cursor-wait disabled:opacity-60"
              disabled={isWeeklyGenerating}
              onClick={handleGenerateWeeklyDraft}
              type="button"
            >
              {isWeeklyGenerating ? "Generating..." : "Generate Weekly Draft"}
            </button>
            <button
              className="rounded-lg border border-[rgba(176,141,87,0.38)] px-3 py-2 text-xs font-semibold text-[var(--ixai-gold)] disabled:opacity-45"
              disabled={!selectedWeeklyDraft}
              onClick={() =>
                setWeeklyMessage(
                  selectedWeeklyDraft
                    ? `AI suggestion ready · ${selectedWeeklyDraft.aiSuggestion.keyThemes.join(" / ")}`
                    : "Generate a weekly draft before requesting AI suggestion.",
                )
              }
              type="button"
            >
              Generate AI Suggestion
            </button>
            <button
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[rgba(245,240,230,0.68)] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!selectedWeeklyDraft || selectedIsStatic || isWeeklySaving}
              onClick={() => patchWeeklyDraft({}, "Weekly draft saved.")}
              type="button"
            >
              Save Draft
            </button>
            <button
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[rgba(245,240,230,0.68)] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={
                !selectedWeeklyDraft ||
                selectedIsStatic ||
                selectedWeeklyDraft.status === "published" ||
                isWeeklySaving
              }
              onClick={() => patchWeeklyDraft({ status: "review" }, "Weekly draft marked as Review.")}
              type="button"
            >
              Mark as Review
            </button>
            <button
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[rgba(245,240,230,0.68)]"
              onClick={() => setWeeklyMessage("Preview is visible below. Human review remains required before publish.")}
              type="button"
            >
              Preview Weekly
            </button>
            <button
              className="rounded-lg bg-emerald-300/14 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canPublishWeekly || isWeeklyPublishing}
              onClick={handlePublishWeekly}
              type="button"
            >
              {isWeeklyPublishing ? "Publishing..." : "Publish Weekly"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-xs leading-5 text-[rgba(245,240,230,0.58)] md:grid-cols-4">
          {(["draft", "review", "published", "archived"] as WeeklyIntelligenceStatus[]).map((status) => (
            <p className="rounded-md border border-white/10 bg-black/14 px-3 py-2" key={status}>
              {weeklyStatusLabels[status]}: {weeklyCounts[status]}
            </p>
          ))}
        </div>
        <div className="mt-3 grid gap-2 text-xs leading-5 text-[rgba(245,240,230,0.46)] sm:grid-cols-2">
          <p>{weeklyMessage}</p>
          <p>
            Persistence:{" "}
            <span className="text-[var(--ixai-cream)]">
              {weeklyPersistence?.writable ? "durable Supabase" : "safe fallback / static published"}
            </span>{" "}
            · Human Review Required · No Auto-publish
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.035]">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Weekly Draft History
            </p>
            <h2 className="mt-1 text-base font-semibold">草稿 / Review / Published / Archived</h2>
          </div>
          <div className="divide-y divide-white/10">
            {weeklyDrafts.map((draft) => (
              <button
                className={`block w-full px-5 py-4 text-left transition ${
                  draft.id === selectedWeeklyDraft?.id ? "bg-white/9" : "hover:bg-white/5"
                }`}
                key={draft.id}
                onClick={() => setSelectedWeeklyId(draft.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold leading-6 text-[var(--ixai-cream)]">
                      {draft.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-[rgba(245,240,230,0.38)]">
                      {draft.weekStart} - {draft.weekEnd}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[rgba(245,240,230,0.42)]">
                      generated {formatDate(draft.generatedAt)} · updated {formatDate(draft.updatedAt)}
                      {draft.publishedAt ? ` · published ${formatDate(draft.publishedAt)}` : ""}
                    </p>
                  </div>
                  <WeeklyStatusBadge status={draft.status} />
                </div>
              </button>
            ))}
            {!weeklyDrafts.length ? (
              <p className="px-5 py-6 text-sm leading-6 text-[rgba(245,240,230,0.5)]">
                No weekly drafts yet. Generate a draft to start the weekly editorial workflow.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#0a2119]">
          {selectedWeeklyDraft ? (
            <>
              <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                    Weekly Preview
                  </p>
                  <h2 className="mt-2 text-xl font-semibold leading-8">{selectedWeeklyDraft.title}</h2>
                  <p className="mt-2 font-mono text-xs text-[rgba(245,240,230,0.42)]">
                    {selectedWeeklyDraft.weekStart} - {selectedWeeklyDraft.weekEnd} · Last updated{" "}
                    {formatDate(selectedWeeklyDraft.updatedAt)}
                  </p>
                </div>
                <WeeklyStatusBadge status={selectedWeeklyDraft.status} />
              </div>

              <div className="grid gap-4 p-5">
                <div className="rounded-lg border border-white/10 bg-black/16 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    Publish Guardrail
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.62)]">
                    Human review required. No auto-publish. AI suggestion must be reviewed before publishing.
                    Editorial owner controls final content. No buy/sell advice, target price, or guaranteed return language.
                  </p>
                  {!canPublishWeekly ? (
                    <p className="mt-2 text-xs leading-5 text-amber-100/80">
                      Publish disabled until this draft is marked as Review and contains title, summary, sections, and IXAI Intelligence Summary.
                    </p>
                  ) : null}
                </div>

                <div className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.08)] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    IXAI Intelligence Summary
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.72)]">
                    {selectedWeeklyDraft.sections.intelligenceSummary.pricing}
                  </p>
                </div>

                {selectedWeeklyDraft.sections.generatorStats ? (
                  <div className="rounded-lg border border-white/10 bg-black/16 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                      Generator Stats
                    </p>
                    <div className="mt-2 grid gap-2 text-xs leading-5 text-[rgba(245,240,230,0.62)] sm:grid-cols-2 lg:grid-cols-3">
                      <p>
                        Input news count:{" "}
                        <span className="font-mono text-[rgba(245,240,230,0.85)]">
                          {selectedWeeklyDraft.sections.generatorStats.inputNewsCount}
                        </span>
                      </p>
                      <p>
                        Unique headlines:{" "}
                        <span className="font-mono text-[rgba(245,240,230,0.85)]">
                          {selectedWeeklyDraft.sections.generatorStats.uniqueHeadlinesCount}
                        </span>
                      </p>
                      <p>
                        Duplicates removed:{" "}
                        <span className="font-mono text-[rgba(245,240,230,0.85)]">
                          {selectedWeeklyDraft.sections.generatorStats.duplicatesRemoved}
                        </span>
                      </p>
                      <p>
                        Upcoming events:{" "}
                        <span className="font-mono text-[rgba(245,240,230,0.85)]">
                          {selectedWeeklyDraft.sections.generatorStats.upcomingEventsCount}
                        </span>
                      </p>
                      <p>
                        Sources used:{" "}
                        <span className="font-mono text-[rgba(245,240,230,0.85)]">
                          {selectedWeeklyDraft.sections.generatorStats.sourcesUsedCount}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-lg border border-white/10 bg-black/16 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    Summary
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.72)]">
                    {selectedWeeklyDraft.summary}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {weeklyEditorSections.map((section) => (
                    <article className="rounded-lg border border-white/10 bg-white/[0.03] p-4" key={section}>
                      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                        {section}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.58)]">
                        {section === "本週市場重點"
                          ? selectedWeeklyDraft.sections.marketHighlights.map((item) => item.headline).join(" / ")
                          : section === "本週重大事件"
                            ? selectedWeeklyDraft.sections.majorEvents.map((item) => item.title).join(" / ")
                            : section === "下週觀察"
                              ? selectedWeeklyDraft.sections.nextWeekFocus.join(" / ")
                              : section === "財報焦點"
                                ? selectedWeeklyDraft.sections.earningsFocus.join(" / ")
                                : section === "FED / 利率"
                                  ? selectedWeeklyDraft.sections.fedRates.summary
                                  : section === "台股 AI"
                                    ? selectedWeeklyDraft.sections.taiwanAi.summary
                                    : section === "FCN 市場觀察"
                                      ? selectedWeeklyDraft.sections.fcnMarketObservation.sentiment
                                      : selectedWeeklyDraft.sections.intelligenceSummary.riskTone}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="rounded-lg border border-white/10 bg-black/16 p-4 text-sm leading-7 text-[rgba(245,240,230,0.62)]">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                    AI-assisted Suggestion
                  </p>
                  <p className="mt-2">{selectedWeeklyDraft.aiSuggestion.intelligenceNarrative}</p>
                  <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.42)]">
                    Input news: {selectedWeeklyDraft.aiSuggestion.inputNewsCount} · Source mode:{" "}
                    {selectedWeeklyDraft.aiSuggestion.sourceMode} · Generated{" "}
                    {formatDate(selectedWeeklyDraft.aiSuggestion.generatedAt)}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-[rgba(245,240,230,0.62)]">
                  {selectedWeeklyDraft.complianceNote}
                </div>
              </div>
            </>
          ) : (
            <p className="p-5 text-sm leading-6 text-[rgba(245,240,230,0.5)]">
              Generate or select a Weekly Intelligence draft to preview.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export function DailyBriefsAdmin() {
  const [activeDesk, setActiveDesk] = useState<EditorialDesk>("daily");
  const [drafts, setDrafts] = useState<DailyBriefDraft[]>(() => getDrafts());
  const [selectedId, setSelectedId] = useState(() => drafts[0]?.id ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [intakeMeta, setIntakeMeta] = useState<NewsIntakeResult | null>(null);
  const [generationMeta, setGenerationMeta] = useState<GenerationMeta | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<{
    schedulerConfigured: boolean;
    lastGeneration: DailyDraftGenerationSummary | null;
  } | null>(null);
  const [persistenceMeta, setPersistenceMeta] = useState<PersistenceMeta | null>(null);
  const publishedBriefs = useMemo(
    () =>
      drafts
        .filter((draft) => draft.status === "published")
        .sort(
          (a, b) =>
            new Date(b.publishedAt ?? b.updatedAt).getTime() -
            new Date(a.publishedAt ?? a.updatedAt).getTime(),
        ),
    [drafts],
  );
  const selectedDraft = drafts.find((draft) => draft.id === selectedId) ?? drafts[0];
  const canPublishSelectedDraft = selectedDraft?.status === "review";
  const supabaseReady = isSupabaseClientConfigured();
  const intakeSources = intakeMeta?.sourceStatus ?? intakeMeta?.sources ?? [];
  const openAIStatus = generationMeta?.providerStatus ?? null;

  const refresh = useCallback((nextDrafts?: DailyBriefDraft[]) => {
    const next = nextDrafts ?? getDrafts();
    setDrafts(next);
    if (!next.some((draft) => draft.id === selectedId)) {
      setSelectedId(next[0]?.id ?? "");
    }
  }, [selectedId]);

  useEffect(() => {
    let ignore = false;

    async function loadDrafts() {
      try {
        const response = await fetch("/api/admin/daily-briefs", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          drafts: DailyBriefDraft[];
          persistence?: PersistenceMeta;
        };

        if (!ignore && Array.isArray(payload.drafts)) {
          refresh(payload.drafts);
          setPersistenceMeta(payload.persistence ?? null);
        }
      } catch {
        // Keep local fallback state available.
      }
    }

    async function loadSchedulerStatus() {
      try {
        const response = await fetch("/api/admin/daily-briefs/scheduler/status");
        const status = (await response.json()) as {
          schedulerConfigured: boolean;
          lastGeneration: DailyDraftGenerationSummary | null;
        };

        if (!ignore) {
          setSchedulerStatus(status);
        }
      } catch {
        if (!ignore) {
          setSchedulerStatus({
            schedulerConfigured: false,
            lastGeneration: null,
          });
        }
      }
    }

    void loadDrafts();
    void loadSchedulerStatus();

    return () => {
      ignore = true;
    };
  }, [refresh]);

  async function handlePublish() {
    if (!selectedDraft) {
      return;
    }

    const response = await fetch("/api/admin/daily-briefs", {
      body: JSON.stringify({ action: "publish", id: selectedDraft.id }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as {
      drafts: DailyBriefDraft[];
      persistence?: PersistenceMeta;
    };
    refresh(payload.drafts);
    setPersistenceMeta(payload.persistence ?? null);
  }

  async function handleGenerateDraft() {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/admin/daily-briefs/draft", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Draft generation failed.");
      }

      const payload = (await response.json()) as {
        draft: DailyBriefDraft;
        drafts: DailyBriefDraft[];
        intake: NewsIntakeResult;
        ai: GenerationMeta;
        persistence?: PersistenceMeta;
      };
      const { draft, intake, ai } = payload;
      setIntakeMeta(intake);
      setGenerationMeta(ai);
      setPersistenceMeta(payload.persistence ?? null);
      setSchedulerStatus((current) => ({
        schedulerConfigured: current?.schedulerConfigured ?? false,
        lastGeneration: {
          status: "generated",
          draftSlug: draft.slug,
          generatedAt: ai.generatedAt,
          sourceMode: intake.mode,
          itemCount: intake.itemCount,
          providerMode: ai.providerMode,
          providerStatus: ai.providerStatus,
          inputNewsCount: ai.inputNewsCount,
          sourceStatus: intake.sourceStatus ?? intake.sources,
          schedulerConfigured: current?.schedulerConfigured ?? false,
          forced: false,
        },
      }));
      setDrafts(payload.drafts);
      setSelectedId(draft.id);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#071a14] text-[#f5f0e6]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-lg border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
                IXAI Editorial Studio
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
                Daily / Weekly Intelligence Workflow
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[rgba(245,240,230,0.62)]">
                新聞來源與市場資料先進入 AI-assisted suggestion，再由 Editorial Studio
                審閱、預覽與發布。日報與週報分流，不做自動發布。
              </p>
            </div>
            <div className="grid gap-3 rounded-lg border border-white/10 bg-black/18 p-4 text-sm leading-6 text-[rgba(245,240,230,0.62)] lg:min-w-[300px]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                {activeDesk === "daily" ? "Daily Generate" : "Weekly Assist"}
              </p>
              <p className="text-xs leading-5 text-[rgba(245,240,230,0.46)]">
                {activeDesk === "daily"
                  ? "News intake → OpenAI provider → review draft. No auto-publish."
                  : "AI suggestion supports weekly narrative, key themes, Fed / earnings ranking, and risk focus."}
              </p>
              {activeDesk === "daily" ? (
                <button
                  className="rounded-lg bg-[var(--ixai-gold)] px-4 py-2 text-sm font-semibold text-[#071a14] disabled:cursor-wait disabled:opacity-60"
                  disabled={isGenerating}
                  onClick={handleGenerateDraft}
                  type="button"
                >
                  {isGenerating ? "Generating..." : "Generate Daily Intelligence Draft"}
                </button>
              ) : (
                <span className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-xs leading-5 text-[rgba(245,240,230,0.58)]">
                  Weekly editor is structured and preview-ready; publish remains manual.
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-2 sm:w-fit sm:grid-cols-2">
          {[
            ["daily", "Daily Briefs"],
            ["weekly", "Weekly Intelligence"],
          ].map(([desk, label]) => (
            <button
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                activeDesk === desk
                  ? "bg-[var(--ixai-gold)] text-[#071a14]"
                  : "text-[rgba(245,240,230,0.62)] hover:bg-white/[0.055] hover:text-[var(--ixai-cream)]"
              }`}
              key={desk}
              onClick={() => setActiveDesk(desk as EditorialDesk)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {activeDesk === "weekly" ? (
          <WeeklyEditorPreview />
        ) : (
          <>
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                Daily Workflow Console
              </p>
              <p className="mt-1 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
                Generate Daily Intelligence Draft → AI-assisted suggestion → Editorial review → Preview → Manual publish.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-[var(--ixai-gold)] px-3 py-2 text-xs font-semibold text-[#071a14] disabled:cursor-wait disabled:opacity-60"
                disabled={isGenerating}
                onClick={handleGenerateDraft}
                type="button"
              >
                {isGenerating ? "Generating..." : "Generate Daily Draft"}
              </button>
              <button
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[rgba(245,240,230,0.68)]"
                type="button"
              >
                Preview Daily
              </button>
              <button
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[rgba(245,240,230,0.38)] opacity-70"
                disabled
                type="button"
              >
                Auto Publish Off
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-xs leading-5 text-[rgba(245,240,230,0.58)] md:grid-cols-4">
            <p className="rounded-md border border-white/10 bg-black/14 px-3 py-2">
              Brief type: Daily Brief
            </p>
            <p className="rounded-md border border-white/10 bg-black/14 px-3 py-2">
              Status: {selectedDraft ? statusLabels[selectedDraft.status] : "No draft"}
            </p>
            <p className="rounded-md border border-white/10 bg-black/14 px-3 py-2">
              Review: {canPublishSelectedDraft ? "ready to publish" : "human review required"}
            </p>
            <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-amber-100/82">
              Publish requires editor control; no auto-publish
            </p>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-4">
          <StatusCard
            status={intakeMeta?.mode === "real" ? "success" : intakeMeta ? "warning" : "muted"}
            title="News Intake Status"
          >
            {intakeMeta ? (
              <>
                <p>
                  Source mode: <span className="text-[var(--ixai-cream)]">{intakeMeta.mode}</span>
                </p>
                <p>
                  News item count: <span className="text-[var(--ixai-cream)]">{intakeMeta.itemCount}</span>
                </p>
                <p>
                  Last fetch: <span className="text-[var(--ixai-cream)]">{formatDate(intakeMeta.fetchedAt)}</span>
                </p>
              </>
            ) : (
              <p>尚未執行本次 draft generation。</p>
            )}
          </StatusCard>

          <StatusCard
            status={
              generationMeta?.providerMode === "openai"
                ? "success"
                : generationMeta
                  ? "warning"
                  : "muted"
            }
            title="OpenAI Provider Status"
          >
            {generationMeta ? (
              <>
                <p>
                  providerMode: <span className="text-[var(--ixai-cream)]">{generationMeta.providerMode}</span>
                </p>
                <p>
                  OpenAI API key detected:{" "}
                  <span className="text-[var(--ixai-cream)]">{generationMeta.openAIKeyDetected ? "yes" : "no"}</span>
                </p>
                <p>
                  Model used: <span className="text-[var(--ixai-cream)]">{generationMeta.model}</span>
                </p>
                <p>
                  Error reason:{" "}
                  <span className="text-[var(--ixai-cream)]">
                    {generationMeta.errorReason ?? openAIStatus?.errorReason ?? "-"}
                  </span>
                </p>
              </>
            ) : (
              <p>Generate 後會顯示 provider 狀態與 fallback 原因。</p>
            )}
          </StatusCard>

          <StatusCard
            status={persistenceMeta?.writable ? "success" : supabaseReady ? "warning" : "warning"}
            title="Supabase Persistence Status"
          >
            <p>
              Supabase env: <span className="text-[var(--ixai-cream)]">{supabaseReady ? "configured" : "not configured"}</span>
            </p>
            <p>
              Persistence mode:{" "}
              <span className="text-[var(--ixai-cream)]">
                {persistenceMeta?.writable
                  ? "durable Supabase"
                  : supabaseReady
                    ? "read-ready / write fallback"
                    : "local fallback"}
              </span>
            </p>
            <p className="text-xs leading-5 text-[rgba(245,240,230,0.42)]">
              Published state uses Supabase when the table and server write key are available; otherwise IXAI falls back safely without breaking review flow.
            </p>
          </StatusCard>

          <StatusCard
            status={schedulerStatus?.schedulerConfigured ? "success" : "warning"}
            title="Scheduler Status"
          >
            <p>
              Scheduler:{" "}
              <span className="text-[var(--ixai-cream)]">
                {schedulerStatus?.schedulerConfigured ? "configured" : "not configured"}
              </span>
            </p>
            <p>
              Last draft:{" "}
              <span className="text-[var(--ixai-cream)]">
                {schedulerStatus?.lastGeneration?.draftSlug ?? "No scheduled draft yet"}
              </span>
            </p>
            <p>
              AI provider:{" "}
              <span className="text-[var(--ixai-cream)]">
                {schedulerStatus?.lastGeneration?.providerMode ?? "-"}
              </span>
            </p>
          </StatusCard>
        </div>

        {generationMeta ? (
          <section className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.07)] p-4 text-sm leading-6 text-[rgba(245,240,230,0.64)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                  AI Synthesis Result
                </p>
                <p className="mt-1">
                  providerMode: <span className="text-[var(--ixai-cream)]">{generationMeta.providerMode}</span> · Model:{" "}
                  <span className="text-[var(--ixai-cream)]">{generationMeta.model}</span> · Input news:{" "}
                  <span className="text-[var(--ixai-cream)]">{generationMeta.inputNewsCount}</span> · Generated:{" "}
                  <span className="text-[var(--ixai-cream)]">{formatDate(generationMeta.generatedAt)}</span>
                </p>
                <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.46)]">
                  AI generated · editorial review required
                </p>
              </div>
              {generationMeta.providerMode !== "openai" ? (
                <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100/86 lg:max-w-md">
                  Fallback active:{" "}
                  <span className="font-mono">{generationMeta.errorReason ?? "unknown_error"}</span>
                  {generationMeta.errorMessage ? (
                    <span className="mt-1 block text-amber-100/70">{generationMeta.errorMessage}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
            {generationMeta.complianceNote ? (
              <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-[rgba(245,240,230,0.42)]">
                {generationMeta.complianceNote}
              </p>
            ) : null}
          </section>
        ) : null}

        {intakeMeta ? (
          <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                  News Intake
                </p>
                <p className="mt-1">
                  Source mode: <span className="text-[var(--ixai-cream)]">{intakeMeta.mode}</span> · Items used:{" "}
                  <span className="text-[var(--ixai-cream)]">{intakeMeta.itemCount}</span> · Last fetch:{" "}
                  <span className="text-[var(--ixai-cream)]">{formatDate(intakeMeta.fetchedAt)}</span>
                </p>
              </div>
            </div>
            {intakeMeta.mode === "fallback" ? (
              <div className="mt-3 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100/86">
                正在使用 fallback intake。Draft 仍可審核與發布，但請在發布前確認市場脈絡是否需要人工補充。
              </div>
            ) : null}
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {intakeSources.map((source) => (
                <div
                  className="rounded-md border border-white/10 bg-black/14 px-3 py-2"
                  key={source.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[rgba(245,240,230,0.72)]">
                      {source.label}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                        source.status === "success"
                          ? "bg-emerald-400/10 text-emerald-200"
                          : source.status === "failed" || source.status === "fallback"
                            ? "bg-amber-300/10 text-amber-100"
                            : "bg-white/8 text-[rgba(245,240,230,0.42)]"
                      }`}
                    >
                      {source.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[rgba(245,240,230,0.46)]">
                    {source.enabled ? "Real source" : "Disabled slot"} · {source.itemCount} items
                  </p>
                  {source.reason ? (
                    <p className="mt-1 text-xs leading-5 text-[rgba(245,240,230,0.38)]">{source.reason}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[rgba(245,240,230,0.42)]">
              {intakeMeta.disclaimer}
            </p>
          </section>
        ) : null}

        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                Daily Auto Draft Scheduler
              </p>
              <p className="mt-1">
                Scheduler:{" "}
                <span className="text-[var(--ixai-cream)]">
                  {schedulerStatus?.schedulerConfigured ? "configured" : "not configured"}
                </span>{" "}
                · Human review required
              </p>
            </div>
            <div className="grid gap-1 text-xs leading-5 text-[rgba(245,240,230,0.48)] lg:min-w-[320px]">
              <p>
                Last generated draft:{" "}
                <span className="text-[var(--ixai-cream)]">
                  {schedulerStatus?.lastGeneration?.draftSlug ?? "No scheduled draft yet"}
                </span>
              </p>
              <p>
                Source mode:{" "}
                <span className="text-[var(--ixai-cream)]">
                  {schedulerStatus?.lastGeneration?.sourceMode ?? "-"}
                </span>{" "}
                · Item count:{" "}
                <span className="text-[var(--ixai-cream)]">
                  {schedulerStatus?.lastGeneration?.itemCount ?? "-"}
                </span>
              </p>
              <p>
                AI provider:{" "}
                <span className="text-[var(--ixai-cream)]">
                  {schedulerStatus?.lastGeneration?.providerMode ?? "-"}
                </span>{" "}
                · Input news:{" "}
                <span className="text-[var(--ixai-cream)]">
                  {schedulerStatus?.lastGeneration?.inputNewsCount ?? "-"}
                </span>
              </p>
              <p>
                Generated time:{" "}
                <span className="text-[var(--ixai-cream)]">
                  {schedulerStatus?.lastGeneration
                    ? formatDate(schedulerStatus.lastGeneration.generatedAt)
                    : "-"}
                </span>
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-lg border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Draft Queue
              </p>
              <h2 className="mt-1 text-base font-semibold">待審與已發布內容</h2>
            </div>
            <div className="divide-y divide-white/10">
              {drafts.map((draft) => (
                <button
                  className={`block w-full px-5 py-4 text-left transition ${
                    draft.id === selectedDraft?.id ? "bg-white/9" : "hover:bg-white/5"
                  }`}
                  key={draft.id}
                  onClick={() => setSelectedId(draft.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold leading-6 text-[var(--ixai-cream)]">
                        {draft.title}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-[rgba(245,240,230,0.38)]">
                        {draft.slug}
                      </p>
                    </div>
                    <StatusBadge status={draft.status} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#0a2119]">
            {selectedDraft ? (
              <>
                <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                      Preview
                    </p>
                    <h2 className="mt-2 text-xl font-semibold leading-8">
                      {selectedDraft.title}
                    </h2>
                    <p className="mt-2 font-mono text-xs text-[rgba(245,240,230,0.42)]">
                      Updated {formatDate(selectedDraft.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedDraft.status} />
                    <button
                      className="rounded-lg bg-[var(--ixai-gold)] px-4 py-2 text-sm font-semibold text-[#071a14] disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={!canPublishSelectedDraft}
                      onClick={handlePublish}
                      type="button"
                    >
                      Publish
                    </button>
                  </div>
                  {!canPublishSelectedDraft ? (
                    <p className="text-xs leading-5 text-[rgba(245,240,230,0.42)]">
                      Publish disabled: draft must be in Review status and manually approved by the editorial owner.
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-5 p-5">
                  <div className="rounded-lg border border-white/10 bg-black/16 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                      Compliance Note
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.62)]">
                      Human review required. No auto-publish. AI suggestion must be reviewed before publishing.
                      Editorial owner controls final content.
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/16 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                      Market Summary
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.72)]">
                      {selectedDraft.marketSummary}
                    </p>
                  </div>

                  {selectedDraft.editorialNote ? (
                    <div className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.08)] p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                        Editorial Note
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.72)]">
                        {selectedDraft.editorialNote}
                      </p>
                    </div>
                  ) : null}

                  {selectedDraft.intelligence ? (
                    <div className="grid gap-3 rounded-lg border border-emerald-300/18 bg-emerald-300/8 p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200">
                        Live Intelligence Payload
                      </p>
                      <p className="text-sm leading-7 text-[rgba(245,240,230,0.72)]">
                        {selectedDraft.intelligence.marketRegimeNote}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.12em]">
                        <span className="rounded-md border border-white/10 px-2 py-1 text-[rgba(245,240,230,0.62)]">
                          {selectedDraft.intelligence.sessionLabel}
                        </span>
                        <span className="rounded-md border border-white/10 px-2 py-1 text-[rgba(245,240,230,0.62)]">
                          {selectedDraft.intelligence.marketRegime}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-3">
                    {selectedDraft.sections.map((section) => (
                      <article
                        className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                        key={`${section.category}-${section.headline}`}
                      >
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                          {section.category}
                        </p>
                        <h3 className="mt-2 text-sm font-semibold leading-6">
                          {section.headline}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[rgba(245,240,230,0.58)]">
                          {section.summary}
                        </p>
                        {section.ixaiView ? (
                          <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-7 text-[rgba(245,240,230,0.68)]">
                            {section.ixaiView}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </section>
        </div>

        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Published
              </p>
              <h2 className="mt-1 text-base font-semibold">已發布 Daily Brief</h2>
            </div>
            <Link
              className="w-fit rounded-lg border border-white/12 px-4 py-2 text-sm font-medium text-[rgba(245,240,230,0.72)]"
              href="/"
            >
              查看 Dashboard
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {publishedBriefs.map((brief) => (
              <div className="rounded-lg border border-white/10 bg-black/14 p-4" key={brief.id}>
                <p className="font-mono text-xs text-[var(--ixai-gold)]">
                  {formatDate(brief.publishedAt)}
                </p>
                <h3 className="mt-2 text-sm font-semibold leading-6">{brief.title}</h3>
              </div>
            ))}
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  );
}

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

export function DailyBriefsAdmin() {
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
        <header className="rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
                IXAI Editorial CMS
              </p>
              <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
                Daily Brief Draft Pipeline
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[rgba(245,240,230,0.62)]">
                市場資料、OpenAI synthesis、Admin review 與 Publish workflow 的內部營運層。
                Draft 需人工審閱後才會發布到 Dashboard 與 Daily Brief。
              </p>
            </div>
            <div className="grid gap-3 rounded-lg border border-white/10 bg-black/18 p-4 text-sm leading-6 text-[rgba(245,240,230,0.62)] lg:min-w-[300px]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                Generate
              </p>
              <p className="text-xs leading-5 text-[rgba(245,240,230,0.46)]">
                News intake → OpenAI provider → review draft. No auto-publish.
              </p>
              <button
                className="rounded-lg bg-[var(--ixai-gold)] px-4 py-2 text-sm font-semibold text-[#071a14] disabled:cursor-wait disabled:opacity-60"
                disabled={isGenerating}
                onClick={handleGenerateDraft}
                type="button"
              >
                {isGenerating ? "Generating..." : "Generate Daily Intelligence Draft"}
              </button>
            </div>
          </div>
        </header>

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
                      disabled={selectedDraft.status === "published"}
                      onClick={handlePublish}
                      type="button"
                    >
                      Publish
                    </button>
                  </div>
                </div>
                <div className="grid gap-5 p-5">
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
      </div>
    </div>
  );
}

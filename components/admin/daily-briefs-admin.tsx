"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getDrafts,
  publishDraft,
  saveDraft,
} from "@/src/lib/editorial/repository";
import { generateDailyIntelligenceDraftFromNews } from "@/src/lib/intelligence/generator";
import { isSupabaseClientConfigured } from "@/src/lib/supabase/client";
import type { DailyBriefDraft, DailyBriefDraftStatus } from "@/src/types/editorial";
import type { NewsIntakeResult } from "@/src/types/news";

const statusLabels: Record<DailyBriefDraftStatus, string> = {
  draft: "Draft",
  review: "Review",
  published: "Published",
};

const statusStyles: Record<DailyBriefDraftStatus, string> = {
  draft: "border-white/12 bg-white/6 text-white/62",
  review: "border-[rgba(176,141,87,0.4)] bg-[rgba(176,141,87,0.12)] text-[var(--ixai-gold)]",
  published: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
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

export function DailyBriefsAdmin() {
  const [drafts, setDrafts] = useState<DailyBriefDraft[]>(() => getDrafts());
  const [selectedId, setSelectedId] = useState(() => drafts[0]?.id ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [intakeMeta, setIntakeMeta] = useState<NewsIntakeResult | null>(null);
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

  function refresh(nextDrafts?: DailyBriefDraft[]) {
    const next = nextDrafts ?? getDrafts();
    setDrafts(next);
    if (!next.some((draft) => draft.id === selectedId)) {
      setSelectedId(next[0]?.id ?? "");
    }
  }

  function handlePublish() {
    if (!selectedDraft) {
      return;
    }

    refresh(publishDraft(selectedDraft.id));
  }

  async function handleGenerateDraft() {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/news/latest?limit=12");
      const intake = (await response.json()) as NewsIntakeResult;
      const draft = generateDailyIntelligenceDraftFromNews(intake.items);
      const nextDrafts = saveDraft(draft);
      setIntakeMeta(intake);
      setDrafts(nextDrafts);
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
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
                市場資料、AI draft、Admin review 與 Publish workflow 的第一版內部營運層。
                目前以 local fallback 模擬，未來可直接替換為 Supabase repository。
              </p>
            </div>
            <div className="grid gap-3 rounded-lg border border-white/10 bg-black/18 p-4 text-sm leading-6 text-white/62">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                Supabase
              </p>
              <p className="mt-2">{supabaseReady ? "Env configured" : "Env optional / fallback mode"}</p>
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

        {intakeMeta ? (
          <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/62">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                  News Intake
                </p>
                <p className="mt-1">
                  Source mode: <span className="text-white">{intakeMeta.mode}</span> · Items used:{" "}
                  <span className="text-white">{intakeMeta.itemCount}</span> · Last fetch:{" "}
                  <span className="text-white">{formatDate(intakeMeta.fetchedAt)}</span>
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
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/72">
                      {source.label}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                        source.status === "success"
                          ? "bg-emerald-400/10 text-emerald-200"
                          : source.status === "failed" || source.status === "fallback"
                            ? "bg-amber-300/10 text-amber-100"
                            : "bg-white/8 text-white/42"
                      }`}
                    >
                      {source.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/46">
                    {source.enabled ? "Real source" : "Disabled slot"} · {source.itemCount} items
                  </p>
                  {source.reason ? (
                    <p className="mt-1 text-xs leading-5 text-white/38">{source.reason}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-white/42">
              {intakeMeta.disclaimer}
            </p>
          </section>
        ) : null}

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
                      <h3 className="text-sm font-semibold leading-6 text-white">
                        {draft.title}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-white/38">
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
                    <p className="mt-2 font-mono text-xs text-white/42">
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
                    <p className="mt-2 text-sm leading-7 text-white/72">
                      {selectedDraft.marketSummary}
                    </p>
                  </div>

                  {selectedDraft.editorialNote ? (
                    <div className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.08)] p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                        Editorial Note
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/72">
                        {selectedDraft.editorialNote}
                      </p>
                    </div>
                  ) : null}

                  {selectedDraft.intelligence ? (
                    <div className="grid gap-3 rounded-lg border border-emerald-300/18 bg-emerald-300/8 p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200">
                        Live Intelligence Payload
                      </p>
                      <p className="text-sm leading-7 text-white/72">
                        {selectedDraft.intelligence.marketRegimeNote}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.12em]">
                        <span className="rounded-md border border-white/10 px-2 py-1 text-white/62">
                          {selectedDraft.intelligence.sessionLabel}
                        </span>
                        <span className="rounded-md border border-white/10 px-2 py-1 text-white/62">
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
                        <p className="mt-2 text-sm leading-7 text-white/58">
                          {section.summary}
                        </p>
                        {section.ixaiView ? (
                          <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-7 text-white/68">
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
              className="w-fit rounded-lg border border-white/12 px-4 py-2 text-sm font-medium text-white/72"
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

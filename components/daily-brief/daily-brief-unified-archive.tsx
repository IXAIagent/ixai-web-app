"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DailyBrief } from "@/content/daily-briefs";
import {
  getPublishedIntelligenceBriefs,
  subscribeToEditorialUpdates,
} from "@/src/lib/editorial/repository";

type ArchiveBrief = {
  slug: string;
  publishedAt?: string;
  title: string;
  marketSummary: string;
};

function sortByPublishedDesc(briefs: ArchiveBrief[]) {
  return [...briefs].sort(
    (a, b) =>
      new Date(b.publishedAt ?? 0).getTime() -
      new Date(a.publishedAt ?? 0).getTime(),
  );
}

function toFallbackBrief(brief: DailyBrief): ArchiveBrief {
  return {
    slug: brief.slug,
    publishedAt: brief.publishedAt,
    title: brief.title,
    marketSummary: brief.marketSummary,
  };
}

function formatPublishedAt(value?: string) {
  if (!value) {
    return "Not published";
  }

  return value.includes("T")
    ? new Date(value).toLocaleString("zh-TW", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : value;
}

export function DailyBriefUnifiedArchive({
  fallbackBriefs,
}: Readonly<{
  fallbackBriefs: DailyBrief[];
}>) {
  const fallbackArchive = useMemo(
    () => sortByPublishedDesc(fallbackBriefs.map(toFallbackBrief)),
    [fallbackBriefs],
  );
  const [briefs, setBriefs] = useState<ArchiveBrief[]>([]);
  const [sourceState, setSourceState] = useState<"loading" | "published" | "fallback">("loading");
  const latestBrief = briefs[0];
  const isFallback = sourceState === "fallback";

  useEffect(() => {
    function syncPublishedIntelligence() {
      const publishedIntelligence = getPublishedIntelligenceBriefs();

      if (publishedIntelligence.length > 0) {
        setBriefs(
          sortByPublishedDesc(
            publishedIntelligence.map((brief) => ({
              slug: brief.slug,
              publishedAt: brief.publishedAt ?? brief.updatedAt,
              title: brief.title,
              marketSummary: brief.marketSummary,
            })),
          ),
        );
        setSourceState("published");
        return;
      }

      setBriefs(fallbackArchive);
      setSourceState("fallback");
    }

    const timeoutId = window.setTimeout(syncPublishedIntelligence, 0);
    const unsubscribe = subscribeToEditorialUpdates(syncPublishedIntelligence);

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [fallbackArchive]);

  if (sourceState === "loading") {
    return (
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          Daily Brief
        </p>
        <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
          正在讀取最新每日簡報。
        </p>
      </section>
    );
  }

  if (!latestBrief) {
    return (
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-5">
        <p className="text-sm leading-7 text-[var(--ixai-ink-muted)]">
          目前尚無已發布 Daily Brief。
        </p>
      </section>
    );
  }

  return (
    <>
      {isFallback ? (
        <section className="rounded-lg border border-amber-300/35 bg-amber-100/30 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            Editorial Backup
          </p>
          <p className="mt-2">
            目前尚未偵測到最新已發布簡報，因此暫時顯示一玄編輯備援內容。
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_16rem] lg:p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              最新簡報 / {formatPublishedAt(latestBrief.publishedAt)}
            </p>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-8 text-[var(--ixai-forest)]">
              {latestBrief.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-ink-muted)]">
              {latestBrief.marketSummary}
            </p>
          </div>
          <div className="flex items-end lg:justify-end">
            <Link
              className="inline-flex rounded-lg border border-[var(--ixai-forest)] bg-[var(--ixai-paper)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
              href={`/daily-brief/${latestBrief.slug}`}
            >
              閱讀最新簡報
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.74)]">
        <div className="border-b border-[var(--ixai-border)] px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            簡報封存
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            歷史每日簡報
          </h2>
        </div>
        <div className="divide-y divide-[var(--ixai-border)]">
          {briefs.map((brief) => (
            <Link
              className="block px-5 py-4 transition hover:bg-[rgba(9,41,31,0.035)]"
              href={`/daily-brief/${brief.slug}`}
              key={brief.slug}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-[var(--ixai-gold)]">
                    {formatPublishedAt(brief.publishedAt)}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[var(--ixai-forest)]">
                    {brief.title}
                  </h3>
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--ixai-ink-muted)]">
                  {isFallback ? "編輯備援" : "已發布簡報"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

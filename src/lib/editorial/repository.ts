import { dailyBriefs, type DailyBrief } from "@/content/daily-briefs";
import { mockGeneratedDrafts } from "@/src/lib/editorial/mockGeneratedDrafts";
import type { DailyBriefDraft, DailyIntelligenceDraft } from "@/src/types/editorial";

const STORAGE_KEY = "ixai.editorial.dailyBriefDrafts.v1";
const PUBLISH_EVENT = "ixai-editorial-publish";

let serverDrafts: DailyBriefDraft[] = [];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function toDraftFromPublishedBrief(brief: DailyBrief): DailyBriefDraft {
  return {
    id: `published-${brief.slug}`,
    slug: brief.slug,
    status: "published",
    title: brief.title,
    marketSummary: brief.marketSummary,
    editorialNote: brief.editorialNote,
    sections: brief.sections,
    riskFocus: brief.riskFocus,
    publishedAt: brief.publishedAt,
    createdAt: brief.publishedAt,
    updatedAt: brief.publishedAt,
  };
}

function readStoredDrafts(): DailyBriefDraft[] {
  if (!canUseStorage()) {
    return serverDrafts;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is DailyBriefDraft => {
      return (
        typeof item?.id === "string" &&
        typeof item?.slug === "string" &&
        ["draft", "review", "published"].includes(item?.status) &&
        typeof item?.title === "string" &&
        typeof item?.marketSummary === "string" &&
        Array.isArray(item?.sections) &&
        typeof item?.createdAt === "string" &&
        typeof item?.updatedAt === "string"
      );
    });
  } catch {
    return [];
  }
}

function writeStoredDrafts(drafts: DailyBriefDraft[]) {
  if (!canUseStorage()) {
    serverDrafts = drafts;
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  window.dispatchEvent(new Event(PUBLISH_EVENT));
}

function seedDrafts() {
  const published = dailyBriefs.map(toDraftFromPublishedBrief);
  const stored = readStoredDrafts();
  const storedIds = new Set(stored.map((draft) => draft.id));
  const generated = mockGeneratedDrafts.filter((draft) => !storedIds.has(draft.id));

  return [...stored, ...generated, ...published].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getDrafts(): DailyBriefDraft[] {
  return seedDrafts();
}

export function getPublishedBriefs(): DailyBriefDraft[] {
  return getDrafts()
    .filter((draft) => draft.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.updatedAt).getTime() -
        new Date(a.publishedAt ?? a.updatedAt).getTime(),
    );
}

export function getPublishedIntelligenceBriefs(): DailyBriefDraft[] {
  return getPublishedBriefs()
    .filter((draft) => Boolean(draft.intelligence))
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.updatedAt).getTime() -
        new Date(a.publishedAt ?? a.updatedAt).getTime(),
    );
}

export function getLatestPublishedIntelligenceBrief(): DailyBriefDraft | undefined {
  return getPublishedIntelligenceBriefs()[0];
}

export function getLatestPublishedBrief(): DailyBriefDraft {
  return getLatestPublishedIntelligenceBrief() ?? getPublishedBriefs()[0] ?? toDraftFromPublishedBrief(dailyBriefs[0]);
}

export function getLatestPublishedIntelligence(): DailyIntelligenceDraft | undefined {
  return getLatestPublishedIntelligenceBrief()?.intelligence;
}

export function getPublishedBriefBySlug(slug: string): DailyBriefDraft | undefined {
  return getPublishedBriefs().find((brief) => brief.slug === slug);
}

export function saveDraft(draft: DailyBriefDraft): DailyBriefDraft[] {
  const now = new Date().toISOString();
  const nextDraft = {
    ...draft,
    updatedAt: now,
  };
  const generatedIds = new Set(mockGeneratedDrafts.map((item) => item.id));
  const current = readStoredDrafts().filter((item) => item.id !== draft.id);
  const next = [nextDraft, ...current].filter(
    (item) => item.status !== "published" || !generatedIds.has(item.id) || item.id === draft.id,
  );

  writeStoredDrafts(next);
  return getDrafts();
}

export function findDraftForDate(dateKey: string): DailyBriefDraft | undefined {
  return readStoredDrafts().find((draft) => draft.slug.includes(dateKey));
}

export function publishDraft(id: string): DailyBriefDraft[] {
  const draft = getDrafts().find((item) => item.id === id);

  if (!draft) {
    return getDrafts();
  }

  const now = new Date().toISOString();
  const publishedDraft: DailyBriefDraft = {
    ...draft,
    status: "published",
    intelligence: draft.intelligence
      ? {
          ...draft.intelligence,
          publishedAt: now,
        }
      : undefined,
    publishedAt: now,
    updatedAt: now,
  };

  return saveDraft(publishedDraft);
}

export function subscribeToEditorialUpdates(callback: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  window.addEventListener(PUBLISH_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(PUBLISH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

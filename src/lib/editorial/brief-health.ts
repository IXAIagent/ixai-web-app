import type {
  DailyBriefDraft,
  DailyDraftGenerationSummary,
  WeeklyIntelligenceDraft,
} from "@/src/types/editorial";

const STALE_DAILY_DAYS = 1;
const STALE_WEEKLY_DAYS = 7;

type BriefHealthItem = {
  id: string;
  slug: string;
  status: string;
  title: string;
  updatedAt: string;
  publishedAt?: string;
};

export type BriefPublishHealth = {
  daysSinceLastPublished: number | null;
  hasPublishGap: boolean;
  latestDraftOrReview: BriefHealthItem | null;
  latestGenerated: BriefHealthItem | null;
  latestPublished: BriefHealthItem | null;
  schedulerMode: "draft_only" | "manual_publish_required";
  stalePublished: boolean;
};

function itemTime(item?: { generatedAt?: string; publishedAt?: string; updatedAt?: string }) {
  if (!item) {
    return 0;
  }

  return new Date(item.publishedAt ?? item.updatedAt ?? item.generatedAt ?? 0).getTime();
}

function daysSince(value?: string) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

function toHealthItem(
  item: DailyBriefDraft | WeeklyIntelligenceDraft | undefined,
): BriefHealthItem | null {
  if (!item) {
    return null;
  }

  return {
    id: item.id,
    publishedAt: item.publishedAt,
    slug: item.slug,
    status: item.status,
    title: item.title,
    updatedAt: timestampFor(item),
  };
}

function timestampFor(item: DailyBriefDraft | WeeklyIntelligenceDraft) {
  if ("generatedAt" in item) {
    return item.updatedAt ?? item.generatedAt ?? item.publishedAt ?? "";
  }

  return item.updatedAt ?? item.publishedAt ?? "";
}

export function buildDailyBriefPublishHealth({
  drafts,
}: {
  drafts: DailyBriefDraft[];
  lastGeneration?: DailyDraftGenerationSummary | null;
}): BriefPublishHealth {
  const sorted = [...drafts].sort((a, b) => itemTime(b) - itemTime(a));
  const latestPublished = sorted.find((draft) => draft.status === "published");
  const latestDraftOrReview = sorted.find(
    (draft) => draft.status === "draft" || draft.status === "review",
  );
  const latestGenerated = sorted[0];
  const latestPublishedDays = daysSince(latestPublished?.publishedAt ?? latestPublished?.updatedAt);

  return {
    daysSinceLastPublished: latestPublishedDays,
    hasPublishGap:
      Boolean(latestDraftOrReview) &&
      itemTime(latestDraftOrReview) > itemTime(latestPublished),
    latestDraftOrReview: toHealthItem(latestDraftOrReview),
    latestGenerated: toHealthItem(latestGenerated),
    latestPublished: toHealthItem(latestPublished),
    schedulerMode: "manual_publish_required",
    stalePublished: latestPublishedDays === null || latestPublishedDays > STALE_DAILY_DAYS,
  };
}

export function buildWeeklyBriefPublishHealth({
  drafts,
}: {
  drafts: WeeklyIntelligenceDraft[];
}): BriefPublishHealth {
  const sorted = [...drafts].sort((a, b) => itemTime(b) - itemTime(a));
  const latestPublished = sorted.find((draft) => draft.status === "published");
  const latestDraftOrReview = sorted.find(
    (draft) => draft.status === "draft" || draft.status === "review",
  );
  const latestGenerated = sorted[0];
  const latestPublishedDays = daysSince(latestPublished?.publishedAt ?? latestPublished?.updatedAt);

  return {
    daysSinceLastPublished: latestPublishedDays,
    hasPublishGap:
      Boolean(latestDraftOrReview) &&
      itemTime(latestDraftOrReview) > itemTime(latestPublished),
    latestDraftOrReview: toHealthItem(latestDraftOrReview),
    latestGenerated: toHealthItem(latestGenerated),
    latestPublished: toHealthItem(latestPublished),
    schedulerMode: "manual_publish_required",
    stalePublished: latestPublishedDays === null || latestPublishedDays > STALE_WEEKLY_DAYS,
  };
}

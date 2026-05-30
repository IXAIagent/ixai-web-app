import type {
  DistributionQueueItem,
  DistributionQueueSnapshot,
  DistributionQueueStatus,
} from "@/src/lib/intelligence/distribution/types";

const FOUNDATION_QUEUE_ITEMS: DistributionQueueItem[] = [
  {
    channel: "in_app",
    id: "daily-intelligence-draft",
    kind: "daily",
    source: "Daily Intelligence Content Engine",
    status: "draft",
    title: "Daily Intelligence draft ready for editorial review",
    updatedAt: "foundation",
  },
  {
    channel: "in_app",
    id: "weekly-intelligence-reviewed",
    kind: "weekly",
    source: "Weekly Intelligence workflow",
    status: "reviewed",
    title: "Weekly Intelligence reviewed before public distribution",
    updatedAt: "foundation",
  },
  {
    channel: "in_app",
    id: "public-intelligence-published",
    kind: "daily",
    source: "Public Intelligence",
    status: "published",
    title: "Published intelligence available for in-app reading",
    updatedAt: "foundation",
  },
];

function countByStatus(items: DistributionQueueItem[]) {
  return items.reduce<Record<DistributionQueueStatus, number>>(
    (counts, item) => ({
      ...counts,
      [item.status]: counts[item.status] + 1,
    }),
    {
      draft: 0,
      published: 0,
      reviewed: 0,
    },
  );
}

export function getDistributionQueueSnapshot(): DistributionQueueSnapshot {
  return {
    counts: countByStatus(FOUNDATION_QUEUE_ITEMS),
    items: FOUNDATION_QUEUE_ITEMS,
    mode: "foundation",
    note:
      "Distribution Queue is read-only foundation state. It does not send LINE, email, push, or automated marketing messages.",
  };
}


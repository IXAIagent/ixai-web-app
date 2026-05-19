import { dailyBriefs, type DailyBrief } from "@/content/daily-briefs";

export function getAllDailyBriefs(): DailyBrief[] {
  return [...dailyBriefs].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getLatestDailyBrief(): DailyBrief {
  return getAllDailyBriefs()[0];
}

export function getDailyBriefBySlug(slug: string): DailyBrief | undefined {
  return dailyBriefs.find((brief) => brief.slug === slug);
}

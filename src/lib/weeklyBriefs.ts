import { weeklyBriefs, type WeeklyBrief } from "@/content/weekly-briefs";

export function getAllWeeklyBriefs(): WeeklyBrief[] {
  return [...weeklyBriefs].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getLatestWeeklyBrief(): WeeklyBrief {
  return getAllWeeklyBriefs()[0];
}

export function getWeeklyBriefBySlug(slug: string): WeeklyBrief | undefined {
  return weeklyBriefs.find((brief) => brief.slug === slug);
}

import { weeklyBriefs, type WeeklyBrief } from "@/content/weekly-briefs";
import {
  getLatestPublishedWeeklyDraftAsync,
  getPublishedWeeklyDraftBySlugAsync,
  listPublishedWeeklyDraftsAsync,
  weeklyDraftToBrief,
} from "@/src/lib/editorial/weekly";

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

export async function getAllWeeklyBriefsAsync(): Promise<WeeklyBrief[]> {
  const drafts = await listPublishedWeeklyDraftsAsync();
  return drafts.map(weeklyDraftToBrief);
}

export async function getLatestWeeklyBriefAsync(): Promise<WeeklyBrief | null> {
  const draft = await getLatestPublishedWeeklyDraftAsync();
  return draft ? weeklyDraftToBrief(draft) : null;
}

export async function getWeeklyBriefBySlugAsync(slug: string): Promise<WeeklyBrief | null> {
  const draft = await getPublishedWeeklyDraftBySlugAsync(slug);
  return draft ? weeklyDraftToBrief(draft) : null;
}

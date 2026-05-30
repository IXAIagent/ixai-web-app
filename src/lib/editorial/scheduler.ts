import {
  findDraftForDateAsync,
  getDraftsAsync,
  saveDraftAsync,
} from "@/src/lib/editorial/repository";
import { generateDailyIntelligenceDraftFromNews } from "@/src/lib/intelligence/generator";
import { getLatestNewsIntakeResult } from "@/src/lib/news/providers";
import type { DailyDraftGenerationSummary } from "@/src/types/editorial";
import type { NewsIntakeResult } from "@/src/types/news";

let lastGenerationSummary: DailyDraftGenerationSummary | null = null;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function forceSuffix() {
  return `force-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

function buildSummary({
  status,
  draftSlug,
  generatedAt,
  intake,
  schedulerConfigured,
  forced,
  providerMode,
  providerStatus,
  inputNewsCount,
  coverageScore,
  contentQuality,
}: {
  status: DailyDraftGenerationSummary["status"];
  draftSlug: string;
  generatedAt: string;
  intake: NewsIntakeResult;
  schedulerConfigured: boolean;
  forced: boolean;
  providerMode?: DailyDraftGenerationSummary["providerMode"];
  providerStatus?: DailyDraftGenerationSummary["providerStatus"];
  inputNewsCount?: number;
  coverageScore?: DailyDraftGenerationSummary["coverageScore"];
  contentQuality?: DailyDraftGenerationSummary["contentQuality"];
}): DailyDraftGenerationSummary {
  return {
    status,
    draftSlug,
    generatedAt,
    sourceMode: intake.mode,
    itemCount: intake.itemCount,
    providerMode,
    providerStatus,
    inputNewsCount: inputNewsCount ?? intake.itemCount,
    coverageScore,
    contentQuality,
    sourceStatus: intake.sourceStatus ?? intake.sources,
    schedulerConfigured,
    forced,
  };
}

export function isSchedulerConfigured() {
  return Boolean(process.env.IXAI_CRON_SECRET || process.env.CRON_SECRET);
}

export function getExpectedCronSecret() {
  return process.env.IXAI_CRON_SECRET ?? process.env.CRON_SECRET ?? "";
}

export function getLastGenerationSummary() {
  return lastGenerationSummary;
}

export async function generateScheduledDailyDraft({
  force = false,
}: {
  force?: boolean;
} = {}): Promise<DailyDraftGenerationSummary> {
  const dateKey = todayKey();
  const existingDraft = await findDraftForDateAsync(dateKey);
  const intake = await getLatestNewsIntakeResult();
  const schedulerConfigured = isSchedulerConfigured();
  const previousBriefs = await getDraftsAsync();

  if (existingDraft && !force) {
    lastGenerationSummary = buildSummary({
      status: "existing",
      draftSlug: existingDraft.slug,
      generatedAt: existingDraft.updatedAt,
      intake,
      schedulerConfigured,
      forced: false,
      providerMode: existingDraft.intelligence?.providerMode,
      providerStatus: existingDraft.intelligence?.providerStatus,
      inputNewsCount: existingDraft.intelligence?.inputNewsCount,
      coverageScore: existingDraft.intelligence?.coverageScore,
      contentQuality: existingDraft.intelligence?.contentQuality,
    });

    return lastGenerationSummary;
  }

  const draft = await generateDailyIntelligenceDraftFromNews(
    intake.items,
    force
      ? {
          slugSuffix: forceSuffix(),
          previousBriefs,
          sourceMode: intake.mode,
          sourceLabels: [
            ...new Set(
              (intake.sourceStatus ?? intake.sources)
                .filter((source) => source.status === "success" && source.itemCount > 0)
                .map((source) => source.label),
            ),
          ],
          sourceStatus: intake.sourceStatus ?? intake.sources,
        }
      : {
          sourceMode: intake.mode,
          previousBriefs,
          sourceLabels: [
            ...new Set(
              (intake.sourceStatus ?? intake.sources)
                .filter((source) => source.status === "success" && source.itemCount > 0)
                .map((source) => source.label),
            ),
          ],
          sourceStatus: intake.sourceStatus ?? intake.sources,
        },
  );
  const savedDrafts = await saveDraftAsync(draft);
  const savedDraft = savedDrafts.find((item) => item.id === draft.id) ?? draft;

  lastGenerationSummary = buildSummary({
    status: "generated",
    draftSlug: savedDraft.slug,
    generatedAt: savedDraft.updatedAt,
    intake,
    schedulerConfigured,
    forced: force,
    providerMode: savedDraft.intelligence?.providerMode,
    providerStatus: savedDraft.intelligence?.providerStatus,
    inputNewsCount: savedDraft.intelligence?.inputNewsCount,
    coverageScore: savedDraft.intelligence?.coverageScore,
    contentQuality: savedDraft.intelligence?.contentQuality,
  });

  return lastGenerationSummary;
}

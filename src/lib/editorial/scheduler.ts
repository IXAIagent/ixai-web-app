import {
  findDraftForDate,
  saveDraft,
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
  const existingDraft = findDraftForDate(dateKey);
  const intake = await getLatestNewsIntakeResult();
  const schedulerConfigured = isSchedulerConfigured();

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
    });

    return lastGenerationSummary;
  }

  const draft = await generateDailyIntelligenceDraftFromNews(
    intake.items,
    force
      ? { slugSuffix: forceSuffix(), sourceMode: intake.mode }
      : { sourceMode: intake.mode },
  );
  const savedDrafts = saveDraft(draft);
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
  });

  return lastGenerationSummary;
}

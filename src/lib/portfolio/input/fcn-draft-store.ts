import { loadRecentPortfolioInputs } from "@/src/lib/portfolio/input/recent-inputs";

export type FCNDraftUnderlying = {
  currentPrice?: string;
  id: string;
  initialPrice?: string;
  kiPrice?: string;
  koPrice?: string;
  market?: string;
  name?: string;
  strikePrice?: string;
  symbol: string;
  weightPct?: string;
};

export type FCNDraftScheduleItem = {
  couponDate?: string;
  id: string;
  label?: string;
  observationDate?: string;
};

export type FCNDraftRecord = {
  couponRatePct?: string;
  createdAt: string;
  currency: string;
  id: string;
  issuer?: string;
  kiPct?: string;
  koPct?: string;
  name: string;
  notionalAmount?: string;
  observationFrequency: string;
  schedule: FCNDraftScheduleItem[];
  source: "local_mock";
  strikePct?: string;
  tenor?: string;
  underlyings: FCNDraftUnderlying[];
};

export type FCNDraftInput = Omit<FCNDraftRecord, "createdAt" | "id" | "source">;

export const FCN_DRAFT_STORE_EVENT = "ixai:fcn-drafts:changed";
export const FCN_DRAFT_STORAGE_KEY = "ixai.fcn.drafts.v308";

const MAX_FCN_DRAFTS = 24;

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createLocalDraftId() {
  return `fcn-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function parseDrafts(raw: string | null): FCNDraftRecord[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is FCNDraftRecord => {
      return (
        item &&
        typeof item === "object" &&
        isString(item.id) &&
        isString(item.name) &&
        isString(item.currency) &&
        isString(item.createdAt) &&
        Array.isArray(item.underlyings) &&
        Array.isArray(item.schedule)
      );
    });
  } catch {
    return [];
  }
}

export function loadFcnDrafts(): FCNDraftRecord[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  const drafts = parseDrafts(window.localStorage.getItem(FCN_DRAFT_STORAGE_KEY));

  if (drafts.length > 0) {
    return drafts;
  }

  const legacyDrafts = loadLegacyRecentFcnDrafts();

  if (legacyDrafts.length > 0) {
    persistFcnDrafts(legacyDrafts);
  }

  return legacyDrafts;
}

export function saveFcnDraft(input: FCNDraftInput) {
  const nextDraft: FCNDraftRecord = {
    ...input,
    createdAt: new Date().toISOString(),
    id: createLocalDraftId(),
    source: "local_mock",
  };

  if (!canUseLocalStorage()) {
    return nextDraft;
  }

  const current = parseDrafts(window.localStorage.getItem(FCN_DRAFT_STORAGE_KEY));
  const next = [nextDraft, ...current].slice(0, MAX_FCN_DRAFTS);

  persistFcnDrafts(next);

  return nextDraft;
}

export function parseDraftNumber(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function persistFcnDrafts(drafts: FCNDraftRecord[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(FCN_DRAFT_STORAGE_KEY, JSON.stringify(drafts));
    window.dispatchEvent(new CustomEvent(FCN_DRAFT_STORE_EVENT));
  } catch {
    // Local draft persistence must not block the FCN input workflow.
  }
}

function loadLegacyRecentFcnDrafts(): FCNDraftRecord[] {
  return loadRecentPortfolioInputs()
    .filter((input) => input.category === "FCN")
    .map((input) => ({
      createdAt: input.createdAt,
      currency: inferCurrency(input.details),
      id: `legacy-${input.id}`,
      name: input.title,
      notionalAmount: inferNotional(input.details),
      observationFrequency: inferObservationFrequency(input.details),
      schedule: [],
      source: "local_mock" as const,
      underlyings: [],
    }));
}

function inferCurrency(details: string[]) {
  const notionalDetail = details.find((detail) => /^[A-Z]{3}\s+/u.test(detail.trim()));
  return notionalDetail?.trim().split(/\s+/u)[0] ?? "USD";
}

function inferNotional(details: string[]) {
  const notionalDetail = details.find((detail) => /^[A-Z]{3}\s+/u.test(detail.trim()));
  return notionalDetail?.trim().split(/\s+/u).slice(1).join(" ") || undefined;
}

function inferObservationFrequency(details: string[]) {
  const observationDetail = details.find((detail) => detail.toLowerCase().includes("observation"));
  return observationDetail?.replace(/observation/iu, "").trim() || "Monthly";
}

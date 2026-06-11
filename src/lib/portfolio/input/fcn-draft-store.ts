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

const FCN_DRAFT_STORAGE_KEY = "ixai.fcn.drafts.v308";
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

  return parseDrafts(window.localStorage.getItem(FCN_DRAFT_STORAGE_KEY));
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

  const current = loadFcnDrafts();
  const next = [nextDraft, ...current].slice(0, MAX_FCN_DRAFTS);

  try {
    window.localStorage.setItem(FCN_DRAFT_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(FCN_DRAFT_STORE_EVENT));
  } catch {
    // Local draft persistence must not block the FCN input workflow.
  }

  return nextDraft;
}

export function parseDraftNumber(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

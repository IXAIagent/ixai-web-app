import type { PortfolioInputAssetCategory } from "@/src/lib/portfolio/input/asset-types";

export type RecentPortfolioInput = {
  category: PortfolioInputAssetCategory;
  createdAt: string;
  details: string[];
  id: string;
  source: "local_mock";
  title: string;
};

const RECENT_INPUTS_STORAGE_KEY = "ixai.portfolio.recent-inputs.v306";
const MAX_RECENT_INPUTS = 6;

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseRecentInputs(raw: string | null): RecentPortfolioInput[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is RecentPortfolioInput => {
      return (
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.category === "string" &&
        Array.isArray(item.details)
      );
    });
  } catch {
    return [];
  }
}

export function loadRecentPortfolioInputs(): RecentPortfolioInput[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  return parseRecentInputs(window.localStorage.getItem(RECENT_INPUTS_STORAGE_KEY));
}

export function saveRecentPortfolioInput(input: Omit<RecentPortfolioInput, "createdAt" | "id" | "source">) {
  if (!canUseLocalStorage()) {
    return;
  }

  const nextInput: RecentPortfolioInput = {
    ...input,
    createdAt: new Date().toISOString(),
    id: `${input.category.toLowerCase()}-${Date.now()}`,
    source: "local_mock",
  };
  const current = loadRecentPortfolioInputs();
  const next = [nextInput, ...current].slice(0, MAX_RECENT_INPUTS);

  try {
    window.localStorage.setItem(RECENT_INPUTS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("ixai:portfolio-input:changed"));
  } catch {
    // Local mock state should never break the input flow.
  }
}

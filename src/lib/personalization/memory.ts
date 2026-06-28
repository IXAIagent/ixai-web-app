import type {
  IntelligenceInterest,
  PersonalMemory,
} from "@/src/types/identity";
import { logWorkspaceRuntimeWarning } from "@/src/lib/workspace/runtime-safety";

const MEMORY_KEY = "ixai.personal.memory.v1";

export const interestOptions: Array<{
  id: IntelligenceInterest;
  label: string;
  description: string;
}> = [
  {
    id: "us_equities",
    label: "美股",
    description: "S&P 500、Nasdaq、科技權值股",
  },
  {
    id: "taiwan_tech",
    label: "台灣科技",
    description: "台積電、半導體、供應鏈",
  },
  {
    id: "ai",
    label: "AI",
    description: "AI capex、晶片、雲端主線",
  },
  {
    id: "crypto",
    label: "Crypto",
    description: "BTC、ETH、流動性 beta",
  },
  {
    id: "macro",
    label: "總經 / 利率",
    description: "Fed、殖利率、美元、VIX",
  },
  {
    id: "fcn",
    label: "FCN",
    description: "結構型商品與未來 Pro 監控",
  },
];

export function createDefaultMemory(): PersonalMemory {
  return {
    watchedSymbols: [],
    recentlyViewedSections: [],
    preferredCategories: [],
    lastVisitAt: new Date().toISOString(),
    onboardingCompleted: false,
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function memoryKey(userId?: string) {
  return userId ? `${MEMORY_KEY}:${userId}` : MEMORY_KEY;
}

function isInterest(value: unknown): value is IntelligenceInterest {
  return interestOptions.some((option) => option.id === value);
}

export function readPersonalMemory(userId?: string): PersonalMemory {
  if (!canUseStorage()) {
    return createDefaultMemory();
  }

  try {
    const raw = window.localStorage.getItem(memoryKey(userId));
    const parsed = raw ? JSON.parse(raw) : null;

    if (!parsed || typeof parsed !== "object") {
      return createDefaultMemory();
    }

    return {
      watchedSymbols: Array.isArray(parsed.watchedSymbols)
        ? parsed.watchedSymbols.filter((item: unknown): item is string => typeof item === "string")
        : [],
      recentlyViewedSections: Array.isArray(parsed.recentlyViewedSections)
        ? parsed.recentlyViewedSections.filter((item: unknown): item is string => typeof item === "string")
        : [],
      preferredCategories: Array.isArray(parsed.preferredCategories)
        ? parsed.preferredCategories.filter(isInterest)
        : [],
      lastVisitAt:
        typeof parsed.lastVisitAt === "string"
          ? parsed.lastVisitAt
          : new Date().toISOString(),
      onboardingCompleted: Boolean(parsed.onboardingCompleted),
    };
  } catch {
    return createDefaultMemory();
  }
}

export function writePersonalMemory(memory: PersonalMemory, userId?: string) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      memoryKey(userId),
      JSON.stringify({
        ...memory,
        lastVisitAt: new Date().toISOString(),
      }),
    );
    window.dispatchEvent(new Event("ixai-personal-memory-change"));
  } catch (error) {
    logWorkspaceRuntimeWarning("personal-memory-local-write-fallback", error);
  }
}

export function inferInterestsFromSymbols(symbols: string[]): IntelligenceInterest[] {
  const interests = new Set<IntelligenceInterest>();

  for (const symbol of symbols.map((item) => item.toUpperCase())) {
    if (["BTC", "ETH", "SOL", "XRP"].includes(symbol)) {
      interests.add("crypto");
    }

    if (["NVDA", "AAPL", "MSFT", "TSLA", "QQQ"].includes(symbol)) {
      interests.add("us_equities");
      interests.add("ai");
    }

    if (/^\d{4}(\.TW)?$/.test(symbol) || ["TSM", "TSMC"].includes(symbol)) {
      interests.add("taiwan_tech");
    }
  }

  return [...interests];
}

export function personalizeCategoryOrder(memory: PersonalMemory): string[] {
  const order = ["Rates", "AI Equity", "Crypto", "Taiwan"];
  const preferred = new Set(memory.preferredCategories);

  if (preferred.has("crypto")) {
    order.unshift("Crypto");
  }

  if (preferred.has("taiwan_tech")) {
    order.unshift("Taiwan");
  }

  if (preferred.has("ai")) {
    order.unshift("AI Equity");
  }

  if (preferred.has("macro")) {
    order.unshift("Rates");
  }

  return [...new Set(order)];
}

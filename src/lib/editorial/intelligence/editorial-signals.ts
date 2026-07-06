import type { EditorialStory } from "@/src/lib/editorial/editorial-types";

export type EditorialSignalId =
  | "breaking"
  | "developing"
  | "follow_up"
  | "market_moving"
  | "background"
  | "macro"
  | "company"
  | "crypto"
  | "risk"
  | "structured_product";

export type EditorialSignal = {
  confidence: number;
  label: string;
  reason: string;
  signal: EditorialSignalId;
  storyId: string;
};

function hasCategory(story: EditorialStory, pattern: RegExp) {
  return story.categories.some((category) => pattern.test(category));
}

function hasSymbol(story: EditorialStory) {
  return story.symbols.length > 0;
}

function signal(
  story: EditorialStory,
  editorialSignal: EditorialSignalId,
  label: string,
  confidence: number,
  reason: string,
): EditorialSignal {
  return {
    confidence,
    label,
    reason,
    signal: editorialSignal,
    storyId: story.id,
  };
}

export function detectEditorialSignals(stories: EditorialStory[]): EditorialSignal[] {
  return stories.flatMap((story) => {
    const signals: EditorialSignal[] = [];

    if (story.importance >= 0.86 && story.freshness >= 0.65) {
      signals.push(signal(story, "breaking", "Breaking", 0.82, "High importance and fresh enough for front-of-brief review."));
    }

    if (story.freshness >= 0.55) {
      signals.push(signal(story, "developing", "Developing", 0.72, "Recent story with enough freshness for ongoing monitoring."));
    }

    if (story.duplicationRisk > 0.45 || story.duplicateOf) {
      signals.push(signal(story, "follow_up", "Follow-up", 0.65, "Duplicate or related story suggests continuing coverage."));
    }

    if ((story.rankingScore ?? 0) >= 0.7 || story.marketRelevance >= 0.75) {
      signals.push(signal(story, "market_moving", "Market-moving", 0.78, "Strong ranking score or market relevance."));
    }

    if (story.importance < 0.55) {
      signals.push(signal(story, "background", "Background", 0.54, "Lower importance story should support context only."));
    }

    if (hasCategory(story, /macro|rate|fed/i)) {
      signals.push(signal(story, "macro", "Macro", 0.74, "Macro or rates category detected."));
    }

    if (hasSymbol(story)) {
      signals.push(signal(story, "company", "Company", 0.7, "Story includes company or asset symbols."));
    }

    if (story.markets.includes("crypto") || hasCategory(story, /crypto/i)) {
      signals.push(signal(story, "crypto", "Crypto", 0.76, "Crypto market coverage detected."));
    }

    if (hasCategory(story, /risk|volatility/i)) {
      signals.push(signal(story, "risk", "Risk", 0.8, "Risk or volatility category detected."));
    }

    if (hasCategory(story, /fcn|structured/i)) {
      signals.push(signal(story, "structured_product", "Structured product", 0.78, "FCN or structured-product relevance detected."));
    }

    return signals;
  });
}

import type {
  EditorialProviderAdapter,
  EditorialRawStory,
} from "@/src/lib/editorial/providers/provider-types";
import type { RawEditorialProviderItem } from "@/src/lib/editorial/editorial-types";

export function toRawEditorialProviderItem(story: EditorialRawStory): RawEditorialProviderItem {
  return {
    categories: story.categories,
    confidence: story.confidence,
    description: story.summary,
    headline: story.title,
    id: story.id,
    importance: story.importance,
    markets: story.markets,
    providerKey: story.providerId,
    publishedAt: story.publishedAt ?? story.providerTimestamp,
    sourceId: story.providerId,
    sourceKind: story.sourceKind,
    sourceLabel: story.providerName,
    symbols: story.symbols,
    updatedAt: story.providerTimestamp,
    url: story.url ?? story.providerUrl,
  };
}

export function adaptProviderStories(stories: EditorialRawStory[]): RawEditorialProviderItem[] {
  return stories.map(toRawEditorialProviderItem);
}

export function readProviderStories(provider: EditorialProviderAdapter): EditorialRawStory[] {
  return provider.getStories?.() ?? [];
}

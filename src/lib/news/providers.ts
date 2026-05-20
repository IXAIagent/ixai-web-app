import { mockNewsItems } from "@/src/lib/news/mock-news";
import type { NewsIntakeProvider, NormalizedNewsItem } from "@/src/types/news";

export const mockNewsIntakeProvider: NewsIntakeProvider = {
  id: "ixai-mock",
  label: "IXAI Mock Intake",
  async fetchItems() {
    return mockNewsItems;
  },
};

export const rssProviderPlaceholders = [
  "Yahoo Finance",
  "CNBC",
  "Reuters",
  "Bloomberg",
  "CoinDesk",
  "CNYES",
  "Futu",
  "The Block",
];

export async function getLatestNewsIntake(): Promise<NormalizedNewsItem[]> {
  // v1.8 keeps intake safe and deterministic. RSS/API adapters can replace
  // this provider without changing the downstream intelligence pipeline.
  return mockNewsIntakeProvider.fetchItems();
}

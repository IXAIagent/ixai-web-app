export type MarketMemorySnapshot = {
  memoryDate?: string;
  dominantThemes: string[];
  risingThemes: string[];
  fadingThemes: string[];
  riskNarrative: string;
  aiTechNarrative: string;
  macroNarrative: string;
  cryptoNarrative: string;
  taiwanNarrative: string;
  previousIxuanView?: string;
};

export type MarketMemoryResult = {
  snapshot: MarketMemorySnapshot;
  whatChangedSinceLastBrief: string;
  continuityTags: string[];
};

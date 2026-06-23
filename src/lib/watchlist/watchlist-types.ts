import type { MarketQuoteResult } from "@/src/lib/market/types";

export type WorkspaceWatchlistAssetType =
  | "crypto"
  | "fcn_candidate"
  | "stock"
  | "unknown";

export type WorkspaceWatchlistSourceStatus =
  | "fallback"
  | "local"
  | "partial"
  | "persisted"
  | "unavailable";

export interface WorkspaceWatchlistItem {
  alertAbove?: number;
  alertBelow?: number;
  assetType: WorkspaceWatchlistAssetType;
  id: string;
  name: string;
  note?: string;
  sourceStatus: WorkspaceWatchlistSourceStatus;
  symbol: string;
  targetPrice?: number;
  updatedAt?: string;
}

export interface WorkspaceWatchlistItemReadback extends WorkspaceWatchlistItem {
  quote: MarketQuoteResult | null;
  quoteStatus: "available" | "unavailable";
}

export interface WorkspaceWatchlistSummary {
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  itemCount: number;
  items: WorkspaceWatchlistItemReadback[];
  quotedItemCount: number;
  sourceStatus: WorkspaceWatchlistSourceStatus;
  unquotedItemCount: number;
}

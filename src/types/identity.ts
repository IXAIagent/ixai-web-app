import type { WatchlistItem } from "@/src/lib/watchlist";

export type IdentityMode = "guest" | "authenticated";

export type IXAIUser = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

export type IXAISession = {
  mode: IdentityMode;
  user: IXAIUser | null;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

export type IntelligenceInterest =
  | "us_equities"
  | "taiwan_tech"
  | "ai"
  | "crypto"
  | "macro"
  | "fcn";

export type PersonalMemory = {
  watchedSymbols: string[];
  recentlyViewedSections: string[];
  preferredCategories: IntelligenceInterest[];
  lastVisitAt: string;
  onboardingCompleted: boolean;
};

export type WatchlistSyncState = {
  mode: "local" | "synced" | "pending";
  label: string;
  lastSyncedAt?: string;
  message?: string;
};

export type PersistenceMode = "local" | "synced" | "pending";

export type PersistenceStatus = {
  mode: PersistenceMode;
  label: string;
  message: string;
  lastSyncedAt?: string;
};

export type PersistedIdentityPayload = {
  session: IXAISession;
  memory: PersonalMemory;
  watchlist?: WatchlistItem[];
};

import { checkWatchlistTablesReadiness } from "@/src/lib/watchlist/persistence/watchlist-database-adapter";

export async function getWatchlistDatabaseActivationReadiness() {
  const readiness = await checkWatchlistTablesReadiness();

  return {
    ...readiness,
    migrationStatus: "draft_only" as const,
    runtimeRequired: false,
    summary:
      "Watchlist database activation is optional. Local/fallback watchlist readback remains active when tables are missing.",
  };
}

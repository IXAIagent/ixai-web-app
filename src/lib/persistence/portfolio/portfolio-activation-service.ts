import { checkPortfolioTablesReadiness } from "@/src/lib/persistence/portfolio/portfolio-database-adapter";

export async function getPortfolioDatabaseActivationReadiness() {
  const readiness = await checkPortfolioTablesReadiness();

  return {
    ...readiness,
    migrationStatus: "draft_only" as const,
    runtimeRequired: false,
    summary:
      "Portfolio database activation is prepared, but runtime still falls back when tables are missing.",
  };
}

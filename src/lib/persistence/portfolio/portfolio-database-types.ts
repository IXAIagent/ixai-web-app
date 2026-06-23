import type { DatabaseActivationTableStatus } from "@/src/lib/persistence/database-activation-utils";
import type {
  PersistentCryptoPosition,
  PersistentPortfolioPosition,
  PersistentStockPosition,
} from "@/src/lib/persistence/portfolio";

export interface PortfolioDatabaseTableReadiness {
  generatedAt: string;
  sourceStatus: "partial" | "ready" | "unavailable";
  tables: Array<{
    name: "crypto_positions" | "portfolio_positions" | "stock_positions";
    status: DatabaseActivationTableStatus;
    warnings: string[];
  }>;
  warnings: string[];
}

export interface PortfolioDatabaseAdapter {
  readCryptoPositionsFromDatabase: () => Promise<PersistentCryptoPosition[]>;
  readPortfolioPositionsFromDatabase: () => Promise<PersistentPortfolioPosition[]>;
  readStockPositionsFromDatabase: () => Promise<PersistentStockPosition[]>;
}

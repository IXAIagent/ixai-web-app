import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";

export type PortfolioPositionCreateInput = Omit<
  PortfolioPosition,
  "createdAt" | "id" | "updatedAt"
>;

export type PortfolioPositionUpdateInput = Partial<
  Omit<PortfolioPosition, "assetId" | "createdAt" | "id" | "updatedAt">
>;

export type PortfolioPositionRepository = {
  createPosition(input: PortfolioPositionCreateInput): Promise<PortfolioPosition>;
  deletePosition(id: string): Promise<{ id: string; ok: boolean }>;
  getPositions(): Promise<PortfolioPosition[]>;
  updatePosition(
    id: string,
    input: PortfolioPositionUpdateInput,
  ): Promise<PortfolioPosition | null>;
};

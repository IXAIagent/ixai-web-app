import type {
  PortfolioExposureItem,
  PortfolioExposureReport,
} from "@/src/lib/portfolio/exposure/exposure-types";

export type PortfolioConcentrationLevel = "CRITICAL" | "HIGH" | "LOW" | "MEDIUM";

export interface PortfolioConcentrationItem {
  category: PortfolioExposureItem["category"];
  key: string;
  label: string;
  level: PortfolioConcentrationLevel;
  marketValue: number;
  percentage: number;
}

export interface PortfolioConcentrationReport {
  alerts: string[];
  concentrationScore: number;
  generatedAt: string;
  id: string;
  overallConcentration: PortfolioConcentrationLevel;
  summary: string;
  topAssetType: PortfolioConcentrationItem | null;
  topFcnUnderlying: PortfolioConcentrationItem | null;
  topProvider: PortfolioConcentrationItem | null;
  topRegion: PortfolioConcentrationItem | null;
  topSymbol: PortfolioConcentrationItem | null;
}

export interface PortfolioConcentrationInput {
  exposureReport: PortfolioExposureReport;
}

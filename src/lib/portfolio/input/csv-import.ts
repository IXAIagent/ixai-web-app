import type { PortfolioInputAssetCategory } from "@/src/lib/portfolio/input/asset-types";

export const SUPPORTED_CSV_IMPORT_SOURCES = [
  "legacy_pro_export",
  "broker_statement",
  "exchange_statement",
  "bank_statement",
  "manual_template",
] as const;

export const CSV_TEMPLATE_COLUMNS = [
  "category",
  "input_mode",
  "region",
  "broker_name",
  "account_alias",
  "symbol",
  "display_name",
  "currency",
  "quantity",
  "cost_basis",
  "market_value",
  "valuation_date",
  "notes",
] as const;

export type CsvImportSource = (typeof SUPPORTED_CSV_IMPORT_SOURCES)[number];
export type CsvTemplateColumn = (typeof CSV_TEMPLATE_COLUMNS)[number];

export type CsvImportShapeValidation = {
  missingColumns: CsvTemplateColumn[];
  ok: boolean;
  supportedCategories: PortfolioInputAssetCategory[];
};

export function validateCsvImportShape(columns: readonly string[]): CsvImportShapeValidation {
  const normalized = new Set(columns.map((column) => column.trim().toLowerCase()));
  const missingColumns = CSV_TEMPLATE_COLUMNS.filter((column) => !normalized.has(column));

  return {
    missingColumns,
    ok: missingColumns.length === 0,
    supportedCategories: ["FCN", "STOCK", "CRYPTO", "GRID", "DUAL", "CASH"],
  };
}

import type {
  PortfolioPersistedAssetClass,
  PortfolioPersistedPosition,
  PortfolioPersistenceSourceStatus,
  PortfolioPersistenceSummary,
  PortfolioPersistenceWarning,
} from "@/src/lib/portfolio/persistence/persistence-types";

const ASSET_CLASSES: PortfolioPersistedAssetClass[] = [
  "stock",
  "crypto",
  "fcn",
  "cash",
  "unknown",
];

const SOURCE_STATUSES: PortfolioPersistenceSourceStatus[] = [
  "persisted",
  "local",
  "fallback",
  "partial",
  "unavailable",
];

function isUsableDate(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export function countPositionsByAssetClass(
  positions: PortfolioPersistedPosition[],
) {
  return ASSET_CLASSES.reduce(
    (counts, assetClass) => ({
      ...counts,
      [assetClass]: positions.filter((position) => position.assetClass === assetClass)
        .length,
    }),
    {} as Record<PortfolioPersistedAssetClass, number>,
  );
}

export function countPositionsBySourceStatus(
  positions: PortfolioPersistedPosition[],
) {
  return SOURCE_STATUSES.reduce(
    (counts, sourceStatus) => ({
      ...counts,
      [sourceStatus]: positions.filter(
        (position) => position.sourceStatus === sourceStatus,
      ).length,
    }),
    {} as Record<PortfolioPersistenceSourceStatus, number>,
  );
}

export function inferPortfolioPersistenceSourceStatus(input: {
  positions: PortfolioPersistedPosition[];
  warnings?: PortfolioPersistenceWarning[];
}): PortfolioPersistenceSourceStatus {
  if (input.positions.length === 0) {
    return "unavailable";
  }

  const sourceStatuses = new Set(
    input.positions.map((position) => position.sourceStatus),
  );

  if (sourceStatuses.has("unavailable")) {
    return "partial";
  }

  if (sourceStatuses.has("persisted") && sourceStatuses.size === 1) {
    return "persisted";
  }

  if (sourceStatuses.has("local") && sourceStatuses.size === 1) {
    return "local";
  }

  if (sourceStatuses.has("fallback") && sourceStatuses.size === 1) {
    return "fallback";
  }

  return "partial";
}

export function mergePersistenceWarnings(
  warnings: PortfolioPersistenceWarning[],
) {
  const seen = new Set<string>();

  return warnings.filter((warning) => {
    const key = `${warning.sourceName}:${warning.message}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function buildPortfolioPersistenceSummary(input: {
  positions: PortfolioPersistedPosition[];
  warnings?: PortfolioPersistenceWarning[];
}): PortfolioPersistenceSummary {
  const assetCounts = countPositionsByAssetClass(input.positions);
  const sourceCounts = countPositionsBySourceStatus(input.positions);
  const warnings = mergePersistenceWarnings(input.warnings ?? []);
  const lastUpdated = input.positions
    .map((position) => position.updatedAt)
    .filter(isUsableDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    cashPositions: assetCounts.cash,
    cryptoPositions: assetCounts.crypto,
    fallbackPositions: sourceCounts.fallback,
    fcnPositions: assetCounts.fcn,
    lastUpdated,
    localPositions: sourceCounts.local,
    persistedPositions: sourceCounts.persisted,
    positions: input.positions,
    sourceStatus: inferPortfolioPersistenceSourceStatus({
      positions: input.positions,
      warnings,
    }),
    stockPositions: assetCounts.stock,
    totalPositions: input.positions.length,
    unavailablePositions: sourceCounts.unavailable,
    unknownPositions: assetCounts.unknown,
    warnings,
  };
}
